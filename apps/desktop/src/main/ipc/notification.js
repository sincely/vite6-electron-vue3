/**
 * 通知相关 IPC 频道，供 src/main/ipc/index.js 统一注册
 *
 * 渲染进程的"原生通知"请求经 preload 的 window.notification 走 show / close 频道，
 * 最终统一由主进程 src/main/notification.js 的 createNotification 创建
 * （原生通知只在主进程构造，避免多份实现）；
 * 另含 open-notification-settings，用于 macOS 通知权限被拒（UNErrorDomain 错误 1）
 * 时引导用户直达系统设置开启授权。
 */
import { shell } from 'electron'
import logger from '../log'
import { createNotification } from '../notification'

// 渲染进程发起的原生通知：通知 ID → 通知句柄（用于关闭）
const activeNotifications = new Map()

/**
 * 通知相关 IPC 频道
 * 供 src/main/ipc/index.js 统一注册
 */
export default [
  // 渲染进程请求显示原生通知（preload window.notification.show → invoke）
  {
    channel: 'show-native-notification',
    type: 'handle',
    handler: async (event, options = {}) => {
      // id 单独取出：回调无法跨 IPC 传输，这里把通知事件转发回发起方，
      // 由 preload 监听对应频道还原成渲染进程侧的回调
      const { id: notifId, ...rest } = options
      const sender = event.sender
      const forward = (channel) => {
        return (...args) => {
          if (!sender.isDestroyed()) sender.send(channel, notifId, ...args)
        }
      }

      try {
        const handle = await createNotification({
          ...rest,
          noToast: true, // 原生通知不自动推应用内通知，渲染层需要时自己调 notify()
          onClick: forward('native-notification-clicked'),
          onClose: forward('native-notification-closed'),
          onAction: forward('native-notification-action'),
          onReply: forward('native-notification-reply'),
          onShow: forward('native-notification-show'),
          // createNotification 的失败回调第二参数已是翻译后的错误信息字符串，直接转发
          onFailed: (_event, message) => {
            if (!sender.isDestroyed()) sender.send('native-notification-failed', notifId, message)
          }
        })
        activeNotifications.set(notifId, handle)
        return { success: true, id: notifId }
      } catch (err) {
        logger.error('[Notification IPC] 创建原生通知失败:', err)
        return { success: false, id: notifId, error: err.message }
      }
    }
  },

  // 渲染进程请求关闭原生通知（preload 通知句柄的 close()）
  {
    channel: 'close-native-notification',
    type: 'on',
    handler: (_event, notifId) => {
      const handle = activeNotifications.get(notifId)
      if (handle) {
        handle.close()
        activeNotifications.delete(notifId)
      }
    }
  },

  // 打开系统通知设置页（通知权限被拒时引导用户去授权，macOS / Windows）
  {
    channel: 'open-notification-settings',
    type: 'handle',
    handler: async () => {
      try {
        if (process.platform === 'darwin') {
          await shell.openExternal('x-apple.systempreferences:com.apple.Notifications-Settings')
        } else if (process.platform === 'win32') {
          await shell.openExternal('ms-settings:notifications')
        } else {
          return { success: false, error: '当前平台没有可直接打开的系统通知设置页' }
        }
        return { success: true }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }
  }
]
