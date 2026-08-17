import {
  createMainWindow,
  closeLoginWindow,
  closeMainWindow,
  createLoginWindow,
  createWindow,
  getLoginWindow,
  setCloseAction
} from '../windowManager'
import { app } from 'electron'

export default [
  {
    channel: 'open-win',
    type: 'handle',
    handler: (event, arg) => {
      createWindow({
        hash: arg,
        width: 600,
        height: 400,
        title: 'Child Window'
      })
    }
  },
  {
    channel: 'toMain',
    type: 'on',
    handler: (event, data) => {
      // 立即标记并隐藏登录窗口，避免在主窗口加载期间把桌面 UI 渲染到 480x640 的小窗里
      const loginWin = getLoginWindow()
      if (loginWin && !loginWin.isDestroyed()) {
        loginWin._skipShow = true
        loginWin.hide()
      }
      const mainWin = createMainWindow()
      // 等主窗口 ready-to-show 后再关闭登录窗口，避免先关旧窗口、
      // 新窗口尚在加载的空窗期露出桌面造成闪屏
      if (mainWin.isVisible()) {
        closeLoginWindow()
        return
      }
      const timer = setTimeout(() => closeLoginWindow(), 5000)
      mainWin.once('ready-to-show', () => {
        clearTimeout(timer)
        closeLoginWindow()
      })
    }
  },
  {
    channel: 'logout',
    type: 'on',
    handler: () => {
      const loginWin = createLoginWindow()
      // 等登录窗口 ready-to-show 后再关闭主窗口，原因同上
      if (loginWin.isVisible()) {
        closeMainWindow()
        return
      }
      const timer = setTimeout(() => closeMainWindow(), 5000)
      loginWin.once('ready-to-show', () => {
        clearTimeout(timer)
        closeMainWindow()
      })
    }
  },
  {
    channel: 'set-auto-launch',
    type: 'on',
    handler: (event, enable) => {
      // 仅在 macOS / Windows 支持开机启动项
      if (process.platform === 'darwin' || process.platform === 'win32') {
        app.setLoginItemSettings({
          openAtLogin: enable,
          openAsHidden: false
        })
      }
    }
  },
  {
    channel: 'get-auto-launch',
    type: 'handle',
    handler: () => {
      if (process.platform !== 'darwin' && process.platform !== 'win32') {
        return false
      }
      return app.getLoginItemSettings().openAtLogin
    }
  },
  {
    channel: 'set-close-action',
    type: 'on',
    handler: (event, action) => {
      setCloseAction(action)
    }
  },
  {
    channel: 'get-app-version',
    type: 'handle',
    handler: () => {
      return app.getVersion()
    }
  }
]
