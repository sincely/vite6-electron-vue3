// project/electron/ipc/handlers/win.js
import { ipcMain, BrowserWindow } from 'electron'

export const winHander = () => {
  // 处理窗口打开请求
  ipcMain.on('open-window', async (event) => {
    // 创建新窗口的逻辑
    const win = new BrowserWindow({ width: 800, height: 600 })
  })

  // 窗口管理相关处理器
  ipcMain.on('close-window', async (event) => {
    // 窗口关闭逻辑
  })
}
