import {
  createMainWindow,
  closeLoginWindow,
  closeMainWindow,
  createLoginWindow,
  createWindow,
  getLoginWindow,
  setCloseAction
} from '../windowManager'
import { setAppTheme } from '../theme'
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
      // 先彻底销毁现有登录窗口（包括 toMain 时被 hide 但未销毁的残留窗口），
      // 避免 createLoginWindow 复用旧窗口导致登录窗口不可见。
      // closeLoginWindow 会清理 loginWindowId，createLoginWindow 之后会创建全新可见窗口。
      closeLoginWindow()
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
    // 渲染进程切换主题时同步到主进程：设置 nativeTheme.themeSource
    // （驱动原生窗口背景色与 prefers-color-scheme）并持久化供下次冷启动
    channel: 'set-app-theme',
    type: 'on',
    handler: (event, theme) => {
      setAppTheme(theme)
    }
  },
  {
    channel: 'get-app-version',
    type: 'handle',
    handler: () => {
      return app.getVersion()
    }
  },
  {
    // 渲染进程「关于」弹窗使用：版本号、提交哈希（短）、格式化构建日期
    channel: 'get-app-build-info',
    type: 'handle',
    handler: () => {
      const rawCommit =
        typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'unknown'
      const commitHash =
        rawCommit && rawCommit !== 'unknown'
          ? String(rawCommit).slice(0, 7)
          : rawCommit
      const rawDate =
        typeof __BUILD_DATE__ !== 'undefined'
          ? __BUILD_DATE__
          : new Date().toISOString()
      const d = new Date(rawDate)
      const buildDate = Number.isNaN(d.getTime())
        ? rawDate
        : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ` +
          `${String(d.getHours()).padStart(2, '0')}:${String(
            d.getMinutes()
          ).padStart(2, '0')}`
      return {
        name: app.name,
        version: app.getVersion(),
        commitHash,
        buildDate
      }
    }
  }
]
