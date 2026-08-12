import { Notification } from 'electron'
import { getMainWindow } from '../windowManager'
import logger from '../log'

/**
 * 辅助函数：向渲染进程发送 toast 通知
 */
export function sendNotificationToRenderer(options) {
  const mainWindow = getMainWindow()
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', options)
  }
}

/**
 * 通知相关 IPC 频道
 * 供 src/main/ipc/index.js 统一注册
 */
export default [
  // 渲染进程请求发送 toast 通知（兼容旧接口）
  {
    channel: 'send-notification',
    type: 'on',
    handler: (event, options) => {
      sendNotificationToRenderer(options)
    }
  },

  // 渲染进程请求显示原生通知（新版 invoke 接口）
  {
    channel: 'show-native-notification',
    type: 'handle',
    handler: async (event, options) => {
      const {
        id: notifId,
        title,
        body,
        subtitle,
        silent,
        urgency,
        timeoutType,
        hasReply,
        closeButtonText,
        icon,
        sound,
        actions,
        toastXml
      } = options

      try {
        const notifOpts = {
          title: title || '',
          body: body || '',
          silent: !!silent,
          urgency: urgency || 'normal',
          timeoutType: timeoutType || 'default',
          hasReply: !!hasReply,
          closeButtonText: closeButtonText || '关闭'
        }

        if (subtitle) notifOpts.subtitle = subtitle
        if (icon) notifOpts.icon = icon
        if (sound) notifOpts.sound = sound
        if (actions && actions.length > 0) notifOpts.actions = actions
        if (toastXml) notifOpts.toastXml = toastXml

        const notif = new Notification(notifOpts)

        // 事件 → 回传给渲染进程
        const sender = event.sender
        if (sender && !sender.isDestroyed()) {
          notif.once('click', () => {
            if (!sender.isDestroyed()) {
              sender.send('native-notification-clicked', notifId)
            }
          })

          notif.once('close', () => {
            if (!sender.isDestroyed()) {
              sender.send('native-notification-closed', notifId)
            }
          })

          notif.on('action', (_event, index) => {
            if (!sender.isDestroyed()) {
              sender.send('native-notification-action', notifId, index)
            }
          })

          notif.on('reply', (_event, reply) => {
            if (!sender.isDestroyed()) {
              sender.send('native-notification-reply', notifId, reply)
            }
          })

          notif.once('show', () => {
            if (!sender.isDestroyed()) {
              sender.send('native-notification-show', notifId)
            }
          })

          notif.once('failed', (_event, error) => {
            if (!sender.isDestroyed()) {
              sender.send(
                'native-notification-failed',
                notifId,
                error?.message || 'unknown'
              )
            }
          })
        }

        notif.show()

        // 存储通知引用，以便渲染进程关闭
        if (!event.sender._activeNotifications) {
          event.sender._activeNotifications = new Map()
        }
        event.sender._activeNotifications.set(notifId, notif)

        return { success: true, id: notifId }
      } catch (err) {
        logger.error('[Notification IPC] 创建原生通知失败:', err)
        return { success: false, id: notifId, error: err.message }
      }
    }
  },

  // 渲染进程请求关闭原生通知
  {
    channel: 'close-native-notification',
    type: 'on',
    handler: (event, notifId) => {
      const activeMap = event.sender._activeNotifications
      if (activeMap) {
        const notif = activeMap.get(notifId)
        if (notif) {
          try {
            notif.close()
          } catch (_) {
            /* 忽略 */
          }
          activeMap.delete(notifId)
        }
      }
    }
  }
]
