import { app, BrowserWindow } from 'electron'
import os from 'node:os'
import { registerIpc } from '../ipc/index.js'
import { createLoginWindow, restoreMainWindow } from './windowManager.js'
import '../config/index.js'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.whenReady().then(() => {
  registerIpc()
  createLoginWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  restoreMainWindow()
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createLoginWindow()
  }
})
