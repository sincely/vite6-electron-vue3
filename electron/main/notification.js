import { sendNotificationToRenderer } from '../ipc/notification.js'

// 创建通知的函数
const createNotification = (options) => {
  sendNotificationToRenderer(options)
}

export default createNotification
