import {
  createMainWindow,
  closeLoginWindow,
  closeMainWindow,
  createLoginWindow,
  createWindow,
  setCloseAction
} from '../main/windowManager'
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
      closeLoginWindow()
      createMainWindow()
    }
  },
  {
    channel: 'logout',
    type: 'on',
    handler: () => {
      closeMainWindow()
      createLoginWindow()
      // 新窗口已创建，重置退出标记，避免 window-all-closed 触发 app.quit()
      app.isQuiting = false
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
