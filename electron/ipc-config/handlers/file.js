// project/electron/ipc/handlers/file.js
import { ipcMain } from 'electron'

export const fileHander = () => {
  // 处理文件夹清理请求
  ipcMain.handle('clear-folder', async (event, path) => {
    // 具体的文件操作逻辑
    console.log('Clearing folder:', path)
  })

  // 可以注册更多的文件相关处理器
  ipcMain.handle('read-file', async (event, filePath) => {
    // 文件读取逻辑
  })
}
