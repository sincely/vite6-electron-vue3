import { app, BrowserWindow, nativeImage, nativeTheme } from 'electron'
import os from 'node:os'
import path from 'node:path'
import { registerIpc } from '../ipc'
import createTray from './tray'

import { createLoginWindow, restoreMainWindow } from './windowManager.js'
import '../config'

// 禁用安全警告
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

// 应用是否正在退出
app.isQuiting = false

// 禁用硬件加速，解决在Windows 7上的问题
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

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

  // 注册 IPC 事件
  registerIpc()
  // 创建登录窗口
  createLoginWindow()
  // 创建托盘图标
  createTray()

  // 监听系统主题变化
  nativeTheme.on('updated', () => {
    const allWindows = BrowserWindow.getAllWindows()
    allWindows.forEach((win) => {
      win.webContents.send(
        'system-theme-updated',
        nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
      )
    })
  })
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
