import { app, BrowserWindow, nativeImage, nativeTheme } from 'electron'
import path from 'node:path'
import initIpc from './ipc'
import initTray from './tray'
import createMenu from './menu'

import { createLoginWindow, restoreMainWindow } from './windowManager'
import './config'

// 开发模式下禁用安全警告，生产环境保留以暴露潜在安全问题
if (!app.isPackaged) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
}

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
  // 开发模式下：Dock 图标使用 resources/icon.png
  if (!app.isPackaged && process.platform === 'darwin' && app.dock) {
    const devIcon = path.join(
      process.env.APP_ROOT || process.cwd(),
      'resources',
      'icon.png'
    )
    app.dock.setIcon(nativeImage.createFromPath(devIcon))
  }

  // 创建自定义菜单
  createMenu()
  // 创建登录窗口
  createLoginWindow()
  // 延迟500ms，初始化非核心功能
  setTimeout(() => {
    // 注册 IPC 事件
    initIpc()
    // 创建托盘图标
    initTray()
  }, 500)
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

// 当应用被激活时
app.on('second-instance', () => {
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
