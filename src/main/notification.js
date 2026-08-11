/**
 * 主进程通知模块
 * 基于 shared/notification.js 统一封装，支持原生 Electron Notification + toast 降级
 */
import { showNotification } from '../shared/notification.js'
import { sendNotificationToRenderer } from './ipc/notification.js'

/**
 * 创建通知（主进程入口）
 *
 * 同时触发：
 * 1. 系统原生通知（macOS 通知中心 / Windows Action Center / Linux 桌面通知）
 * 2. 应用内 toast 通知（通过 IPC 发送到渲染进程）
 *
 * @param {Object} options - 通知配置，详见 shared/notification.js 中的 showNotification 文档
 * @param {string}  options.title      - 标题
 * @param {string}  options.body       - 正文
 * @param {string}  options.type       - 类型 'info'|'success'|'warning'|'error'|'celebrate'
 * @param {boolean} options.silent     - 静默模式
 * @param {boolean} options.noNative   - 禁用原生通知，仅 toast
 * @param {boolean} options.noToast    - 禁用 toast，仅原生通知
 * @param {Function} options.onClick   - 点击回调
 * @param {Function} options.onClose   - 关闭回调
 * @param {Array}   options.actions    - 操作按钮（macOS）
 * @param {Function} options.onAction  - 操作按钮回调（macOS）
 * @returns {Promise<Object>} 通知句柄
 */
const createNotification = async (options = {}) => {
  const { noNative, noToast, ...rest } = options

  // 发送 toast 到渲染进程（应用内通知）
  if (!noToast) {
    sendNotificationToRenderer(rest)
  }

  // 发送系统原生通知
  if (!noNative) {
    return showNotification({
      ...rest,
      forceToast: false // 主进程不需要 toast 降级
    })
  }

  return { close: () => {}, getNative: () => null, isClosed: () => false }
}

export default createNotification
