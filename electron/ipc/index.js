import { ipcMain } from 'electron'
import appIpc from './app'
import updateIpc from './update'
import winControlIpc from './win-control'
import notificationIpc from './notification'
// 注册所有 IPC 频道
export function registerIpc() {
  const ipcList = [
    ...appIpc,
    ...updateIpc,
    ...winControlIpc,
    ...notificationIpc
  ]

  ipcList.forEach((ipc) => {
    if (ipc.type === 'handle') {
      ipcMain.handle(ipc.channel, ipc.handler)
    } else if (ipc.type === 'on') {
      ipcMain.on(ipc.channel, ipc.handler)
    }
  })
}
