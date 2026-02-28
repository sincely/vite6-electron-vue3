import { app, BrowserWindow } from 'electron'
import os from 'node:os'
import { registerIpc } from '../ipc/index.js'
import createTray from './tray.js'

import { createLoginWindow, restoreMainWindow } from './windowManager.js'
import '../config/index.js'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

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
  // 注册 IPC 事件
  registerIpc()
  // 创建登录窗口
  createLoginWindow()
  // 创建托盘图标
  createTray()
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
