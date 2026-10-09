/**
 * 渲染进程通知模块
 *
 * 与主进程通知（src/main/notification.js）职责分离，各走各的通道：
 * - 主进程  ：负责系统原生通知的创建（Electron Notification 只能在主进程发起），
 *             并可把应用内通知通过 'show-notification' 频道推给渲染层
 * - 渲染进程：负责应用内通知（本模块 notify → 通知中心 store + Toast 组件），
 *             需要系统级通知时通过 preload 的 window.notification 委托给主进程
 * ── 用法 ──
 *   import { notify, notifySuccess, showNativeNotification } from '@/utils/notification'
 *
 *   notify({ title: '提示', body: '已保存', type: 'success' })  // 仅应用内：通知中心 + Toast
 *   showNativeNotification({ title: '下载完成', body: '...' })  // 系统原生通知
 */
import { useNotificationStore } from '@/store/modules/notification'

/**
 * 发送应用内通知：写入通知中心 store，Toast 组件监听 store 变化自动弹出
 * @param {Object} options
 * @param {string} options.title - 标题（默认 '通知'）
 * @param {string} options.body  - 正文
 * @param {string} options.type  - 类型 'info'|'success'|'warning'|'error'|'celebrate'
 * @returns {Object} 推入通知中心的记录 { id, title, body, type, time, read }
 */
export function notify(options = {}) {
  const store = useNotificationStore()
  const { title = '通知', body = '', type = 'info' } = options
  store.push({ title, body, type })
  return store.list[0]
}

/**
 * 发送系统原生通知（Windows 操作中心 / macOS 通知中心 / Linux 桌面通知）
 * Electron 原生通知只能由主进程创建：这里通过 preload 暴露的 window.notification.show()
 * 经 IPC 委托主进程创建，事件回调由 preload 监听 IPC 事件还原到渲染进程。
 * 不会写入应用内通知中心，需要时请另调 notify()。
 *
 * @param {Object} options - 同 window.notification.show()，完整参数见 src/preload/index.mjs
 * @param {string}   options.title    - 标题
 * @param {string}   options.body     - 正文
 * @param {boolean}  options.silent   - 是否静默
 * @param {Function} options.onClick  - 点击回调
 * @param {Function} options.onClose  - 关闭回调
 * @returns {Promise<Object>} 通知句柄 { id, success, close }
 */
export async function showNativeNotification(options = {}) {
  if (!window.notification) {
    console.warn('[Notification] window.notification 不可用（preload 未注入），无法发送原生通知')
    return { id: null, success: false, close: () => {} }
  }
  return window.notification.show(options)
}

/**
 * 监听主进程推送的应用内通知（'show-notification' 频道）。
 * 主进程 createNotification 默认会把通知同步到渲染层，本监听负责将其
 * 写入通知中心（Toast 组件随之弹出）。
 * 在渲染进程入口（src/render/main.js）调用一次即可。
 */
export function initNotificationListener() {
  if (!window.ipcRenderer) return

  window.ipcRenderer.on('show-notification', (_event, options) => {
    notify(typeof options === 'string' ? { body: options } : options || {})
  })
}

export default {
  notify,
  showNativeNotification,
  initNotificationListener
}
