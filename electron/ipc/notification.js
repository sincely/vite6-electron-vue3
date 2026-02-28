import { getMainWindow } from '../main/windowManager.js'

export function sendNotificationToRenderer(options) {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', options)
  }
}
