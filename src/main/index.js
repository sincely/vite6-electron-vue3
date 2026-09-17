import { app, BrowserWindow, nativeImage, nativeTheme } from 'electron'
import path from 'node:path'
import initIpc from './ipc'
import initTray from './tray'
import createMenu from './menu'
import { registerSchemes, setupProtocol } from './protocol'
import { createLoginWindow, restoreMainWindow } from './windowManager'
import { initAppTheme } from './theme'
import { setupDeepLink, handleDeepLinkFromArgv } from './deeplink'
import './config'

// 开发模式下禁用安全警告，生产环境保留以暴露潜在安全问题
if (!app.isPackaged) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
}

// 注册 app:// 协议为标准特权方案（⚠️ 必须在 app.whenReady() 之前）
registerSchemes()

// 初始化 Deep Link 支持（⚠️ 需在 app.whenReady() 之前调用）
// 注册 lightning:// 协议处理程序、监听 macOS open-url 事件、
// 处理 Windows/Linux 冷启动参数中的 deeplink URL
setupDeepLink()

// 应用是否正在退出
app.isQuiting = false
// 设置应用用户模型ID，用于Windows任务栏分组
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

// 确保只有一个实例运行
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}
// 当Electron完成初始化并准备好创建浏览器窗口时
app.whenReady().then(() => {
  // 注册 app:// 协议处理器（⚠️ 必须在 app.whenReady() 之后）
  setupProtocol()
  // 开发模式下：Dock 图标使用 resources/app.png
  if (!app.isPackaged && process.platform === 'darwin' && app.dock) {
    const devIcon = path.join(process.env.APP_ROOT || process.cwd(), 'resources', 'app.png')
    app.dock.setIcon(nativeImage.createFromPath(devIcon))
  }

  // 创建自定义菜单
  createMenu()
  // 应用持久化的主题到 nativeTheme，使首个窗口的 backgroundColor 与应用主题一致
  initAppTheme()
  // 创建登录窗口（加载完成后由渲染进程登录态决定显示登录窗口还是直接进入主窗口）
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
  restoreMainWindow()
  // 从第二个实例的 argv 中提取并处理 deeplink URL
  handleDeepLinkFromArgv(argv, 'second-instance')
})

// 当应用被激活时，聚焦已有窗口；无窗口时创建登录窗口（由其内部按登录态决定显示还是切主窗口）
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createLoginWindow()
  }
})
