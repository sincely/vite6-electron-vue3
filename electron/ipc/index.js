import { ipcMain } from 'electron'
import appIpc from './app.js'
import updateIpc from './update.js'
import winControlIpc from './win-control.js'

export function registerIpc() {
  const ipcList = [...appIpc, ...updateIpc, ...winControlIpc]

  ipcList.forEach((ipc) => {
    if (ipc.type === 'handle') {
      ipcMain.handle(ipc.channel, ipc.handler)
    } else if (ipc.type === 'on') {
      ipcMain.on(ipc.channel, ipc.handler)
    }
  })
}
