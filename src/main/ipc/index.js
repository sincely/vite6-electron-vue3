import { ipcMain } from 'electron'
import appIpc from './app'
import updateIpc from './update'
import winControlIpc from './win-control'
import notificationIpc from './notification'
import systemInfoIpc from './systemInfo'
import logIpc from './log'
import httpIpc from './http'
import { deepLinkIpc } from '../deeplink'

// 注册所有 IPC 频道
export default function initIpc() {
  const ipcList = [
    ...appIpc,
    ...updateIpc,
    ...winControlIpc,
    ...notificationIpc,
    ...systemInfoIpc,
    ...logIpc,
    ...httpIpc,
    ...deepLinkIpc
  ]

  ipcList.forEach((ipc) => {
    if (ipc.type === 'handle') {
      ipcMain.handle(ipc.channel, ipc.handler)
    } else if (ipc.type === 'on') {
      ipcMain.on(ipc.channel, ipc.handler)
    }
  })
}
