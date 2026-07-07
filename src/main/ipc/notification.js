import { getMainWindow } from '../windowManager'

/**
 * 辅助函数：向渲染进程发送通知
 */
export function sendNotificationToRenderer(options) {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', options)
  }
}

/**
 * 通知相关 IPC 频道（采用与 update.js 一致的数组导出格式）
 * 供 src/main/ipc/index.js 统一注册
 */
export default [
  // 渲染进程请求发送通知
  {
    channel: 'send-notification',
    type: 'on',
    handler: (event, options) => {
      sendNotificationToRenderer(options)
    }
  }
]
