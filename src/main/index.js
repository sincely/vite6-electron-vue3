import { app, BrowserWindow, nativeImage, nativeTheme } from 'electron'
import path from 'node:path'
import initIpc from './ipc'
import initTray from './tray'
import createMenu from './menu'
import { registerSchemes, setupProtocol } from './protocol'
import { setupDeepLink, handleDeepLinkFromArgv } from './deeplink'
import store from './store'
import {
  setCloseAction,
  createLoginWindow,
  restoreMainWindow
} from './windowManager'
import logger from './log'
import './config'

// 开发模式下禁用安全警告，生产环境保留以暴露潜在安全问题
if (!app.isPackaged) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
}

// 注册 app:// 协议为标准特权方案（⚠️ 必须在 app.whenReady() 之前）
registerSchemes()

// 应用是否正在退出
app.isQuiting = false
// 设置应用用户模型ID，用于Windows任务栏分组
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

// 确保只有一个实例运行
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
// 注册 lightning:// 协议并监听深链事件（⚠️ 需在 whenReady 之前，macOS 冷启动的 open-url 可能早于 ready 触发）
setupDeepLink()
// 当Electron完成初始化并准备好创建浏览器窗口时
app.whenReady().then(() => {
  // 注册 app:// 协议处理器（⚠️ 必须在 app.whenReady() 之后）
  setupProtocol()
  // 开发模式下：Dock 图标使用 resources/app.png
  if (!app.isPackaged && process.platform === 'darwin' && app.dock) {
    const devIcon = path.join(
      process.env.APP_ROOT || process.cwd(),
      'resources',
      'app.png'
    )
    app.dock.setIcon(nativeImage.createFromPath(devIcon))
  }

  // 从持久化存储中恢复应用设置
  try {
    const savedCloseAction = store.get('appSettings.closeAction', 'minimize')
    setCloseAction(savedCloseAction)
    logger.info(`[App] 恢复 closeAction: ${savedCloseAction}`)

    const savedAutoLaunch = store.get('appSettings.autoLaunch', false)
    if (process.platform === 'darwin' || process.platform === 'win32') {
      app.setLoginItemSettings({
        openAtLogin: !!savedAutoLaunch,
        openAsHidden: false
      })
      logger.info(`[App] 恢复 autoLaunch: ${savedAutoLaunch}`)
    }
  } catch (err) {
    logger.warn('[App] 恢复应用设置失败:', err.message)
  }

  // 创建自定义菜单
  createMenu()
  // 创建登录窗口
  createLoginWindow()
  // 注册 IPC 事件
  initIpc()
  // 创建托盘图标
  initTray()
})

// 当应用准备退出时
app.on('before-quit', () => {
  app.isQuiting = true
})

// 当所有窗口都被关闭时
app.on('window-all-closed', () => {
  // 在 macOS 以外的平台上退出应用
  if (process.platform !== 'darwin') app.quit()
})

// 第二个实例被启动时（Windows/Linux 下点击协议链接会唤起新实例，链接在 argv 中）
app.on('second-instance', (_event, argv) => {
  handleDeepLinkFromArgv(argv, 'second-instance')
  restoreMainWindow()
})

// 当应用被激活时，聚焦到主窗口或创建登录窗口
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createLoginWindow()
  }
})
