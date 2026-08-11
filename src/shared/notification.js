/**
 * Electron 通知统一封装（ES6）
 *
 * 支持主进程 & 渲染进程，封装 Electron 原生 Notification API。
 *
 * ── 主进程 ──
 *   import { showNotification } from '../shared/notification.js'
 *   showNotification({ title: '标题', body: '内容', silent: false })
 *
 * ── 渲染进程 ──
 *   import { showNotification } from '@shared/notification'
 *   // 或通过 preload 暴露的 window.$notification.show(...)
 *   showNotification({ title: '标题', body: '内容' })
 *
 * 环境检测：
 *   - 主进程：直接使用 electron.Notification（全功能，支持 actions / reply / urgency 等）
 *   - 渲染进程：通过 IPC invoke 到主进程创建原生通知，同时也会触发 toast 通知
 */

// ─── 环境检测 ───────────────────────────────────────────────────────────
const isMainProcess =
  typeof process !== 'undefined' && process.type === 'browser'

const isRendererProcess =
  typeof process !== 'undefined' &&
  (process.type === 'renderer' || process.type === 'worker')

// ─── 工具函数 ───────────────────────────────────────────────────────────

/** 生成唯一通知 ID */
let _idCounter = 0
function _generateId() {
  return `notif_${Date.now()}_${++_idCounter}`
}

// ─── 常量 & 默认配置 ────────────────────────────────────────────────────
const DEFAULT_OPTIONS = {
  title: '',
  body: '',
  subtitle: '', // macOS only
  silent: false,
  urgency: 'normal', // 'normal' | 'critical' | 'low' (Linux)
  timeoutType: 'default', // 'default' | 'never' (Windows / Linux)
  hasReply: false, // macOS only
  closeButtonText: '关闭', // macOS only
  icon: null, // NativeImage | string (path)
  sound: null, // macOS only - 自定义提示音路径
  actions: [], // [{ type: 'button', text: '按钮文字' }] (macOS only)
  toastXml: null, // Windows only - 自定义 toast 模板

  // 回调
  onClick: null,
  onClose: null,
  onAction: null, // macOS only - (event, index) => {}
  onReply: null, // macOS only - (event, reply) => {}
  onShow: null,
  onFailed: null
}

// ─── 主进程：原生 Electron Notification ──────────────────────────────────

/**
 * 在主进程中创建原生 Electron 通知
 */
async function _showInMainProcess(options) {
  const { Notification } = await import('electron')

  const opts = { ...DEFAULT_OPTIONS, ...options }
  const notifId = _generateId()

  // 构建 Electron Notification 参数
  const notifOpts = {
    title: opts.title,
    body: opts.body,
    silent: opts.silent,
    urgency: opts.urgency,
    timeoutType: opts.timeoutType,
    hasReply: opts.hasReply,
    closeButtonText: opts.closeButtonText
  }

  if (opts.subtitle) notifOpts.subtitle = opts.subtitle
  if (opts.icon) notifOpts.icon = opts.icon
  if (opts.sound) notifOpts.sound = opts.sound
  if (opts.actions && opts.actions.length > 0) notifOpts.actions = opts.actions
  if (opts.toastXml) notifOpts.toastXml = opts.toastXml

  const notif = new Notification(notifOpts)

  // 事件绑定
  if (typeof opts.onClick === 'function') {
    notif.once('click', opts.onClick)
  }
  if (typeof opts.onClose === 'function') {
    notif.once('close', opts.onClose)
  }
  if (typeof opts.onAction === 'function') {
    notif.on('action', opts.onAction)
  }
  if (typeof opts.onReply === 'function') {
    notif.on('reply', opts.onReply)
  }
  if (typeof opts.onShow === 'function') {
    notif.once('show', opts.onShow)
  }
  if (typeof opts.onFailed === 'function') {
    notif.once('failed', opts.onFailed)
  }

  // 显示通知
  notif.show()

  return {
    id: notifId,
    close: () => {
      try {
        notif.close()
      } catch (_) {
        /* 忽略已关闭的错误 */
      }
    },
    getNative: () => notif,
    isClosed: () => {
      try {
        // 通过尝试 close 来检测是否已关闭
        notif.close()
        return false
      } catch (_) {
        return true
      }
    }
  }
}

// ─── 渲染进程：通过 IPC 调用主进程 ──────────────────────────────────────

// 渲染进程中缓存的通知回调（按通知 ID 索引）
const _rendererCallbacks = new Map()

/**
 * 在渲染进程中通过 IPC 请求主进程创建通知
 */
async function _showInRendererProcess(options) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const notifId = _generateId()

  // 缓存回调
  _rendererCallbacks.set(notifId, {
    onClick: opts.onClick,
    onClose: opts.onClose,
    onAction: opts.onAction,
    onReply: opts.onReply,
    onShow: opts.onShow,
    onFailed: opts.onFailed
  })

  // 通过 IPC invoke 请求主进程显示通知
  let result = null
  try {
    if (window.ipcRenderer && window.ipcRenderer.invoke) {
      result = await window.ipcRenderer.invoke('show-native-notification', {
        id: notifId,
        title: opts.title,
        body: opts.body,
        subtitle: opts.subtitle,
        silent: opts.silent,
        urgency: opts.urgency,
        timeoutType: opts.timeoutType,
        hasReply: opts.hasReply,
        closeButtonText: opts.closeButtonText,
        icon: opts.icon,
        sound: opts.sound,
        actions: opts.actions,
        toastXml: opts.toastXml
      })
    }
  } catch (err) {
    console.warn('[Notification] IPC 调用失败:', err.message)
    _rendererCallbacks.delete(notifId)
  }

  return {
    id: notifId,
    close: () => {
      if (window.ipcRenderer && window.ipcRenderer.send) {
        window.ipcRenderer.send('close-native-notification', notifId)
      }
      _rendererCallbacks.delete(notifId)
    },
    getNative: () => null,
    isClosed: () => !_rendererCallbacks.has(notifId)
  }
}

/**
 * 初始化渲染进程通知事件监听（在 preload / 渲染进程入口调用一次）
 */
export function initRendererNotificationListener() {
  if (!isRendererProcess || !window.ipcRenderer) return

  // 监听主进程回传的通知事件
  window.ipcRenderer.on('native-notification-clicked', (_event, notifId) => {
    const cb = _rendererCallbacks.get(notifId)
    if (cb?.onClick) {
      cb.onClick()
    }
    _rendererCallbacks.delete(notifId)
  })

  window.ipcRenderer.on('native-notification-closed', (_event, notifId) => {
    const cb = _rendererCallbacks.get(notifId)
    if (cb?.onClose) {
      cb.onClose()
    }
    _rendererCallbacks.delete(notifId)
  })

  window.ipcRenderer.on(
    'native-notification-action',
    (_event, notifId, actionIndex) => {
      const cb = _rendererCallbacks.get(notifId)
      if (cb?.onAction) {
        cb.onAction(null, actionIndex)
      }
    }
  )

  window.ipcRenderer.on(
    'native-notification-reply',
    (_event, notifId, reply) => {
      const cb = _rendererCallbacks.get(notifId)
      if (cb?.onReply) {
        cb.onReply(null, reply)
      }
    }
  )

  window.ipcRenderer.on('native-notification-show', (_event, notifId) => {
    const cb = _rendererCallbacks.get(notifId)
    if (cb?.onShow) {
      cb.onShow()
    }
  })

  window.ipcRenderer.on(
    'native-notification-failed',
    (_event, notifId, error) => {
      const cb = _rendererCallbacks.get(notifId)
      if (cb?.onFailed) {
        cb.onFailed(error)
      }
      _rendererCallbacks.delete(notifId)
    }
  )
}

// ─── 渲染进程降级：Toast 通知（不经过 IPC）───────────────────────────────

/**
 * 降级方案：仅使用 toast 通知
 * 通过触发自定义事件让 NotificationToast 组件捕获
 */
function _showToastOnly(options) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // 优先：通过自定义事件触发已有 toast 组件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('notification-toast', {
        detail: {
          title: opts.title || '通知',
          body: opts.body || '',
          type: opts.type || 'info',
          id: _generateId()
        }
      })
    )
  }

  return {
    id: _generateId(),
    close: () => {},
    getNative: () => null,
    isClosed: () => false
  }
}

// ─── 公开 API ───────────────────────────────────────────────────────────

/**
 * 显示 Electron 原生通知（自动检测环境）
 *
 * @param {Object} options - 通知配置
 * @param {string}  options.title           - 通知标题（必填）
 * @param {string}  options.body            - 通知正文
 * @param {string}  options.subtitle        - 副标题（macOS only）
 * @param {boolean} options.silent          - 是否静默（不播放提示音）
 * @param {string}  options.urgency         - 紧急程度 'normal' | 'critical' | 'low'（Linux）
 * @param {string}  options.timeoutType     - 超时类型 'default' | 'never'（Windows / Linux）
 * @param {boolean} options.hasReply        - 是否允许内联回复（macOS only）
 * @param {string}  options.closeButtonText - 关闭按钮文字（macOS only）
 * @param {*}       options.icon            - 图标（NativeImage 或路径字符串）
 * @param {string}  options.sound           - 自定义提示音路径（macOS only）
 * @param {Array}   options.actions         - 操作按钮 [{ type: 'button', text: '确定' }]（macOS only）
 * @param {string}  options.toastXml        - 自定义 toast 模板（Windows only）
 * @param {string}  options.type            - 通知类型（用于 toast 降级）'info'|'success'|'warning'|'error'
 * @param {Function} options.onClick        - 点击通知回调
 * @param {Function} options.onClose        - 关闭通知回调
 * @param {Function} options.onAction       - 操作按钮回调 (event, index) => {}（macOS only）
 * @param {Function} options.onReply        - 内联回复回调 (event, reply) => {}（macOS only）
 * @param {Function} options.onShow         - 通知显示回调
 * @param {Function} options.onFailed       - 通知失败回调
 * @param {boolean} options.forceToast      - 强制使用 toast 通知（不使用原生通知）
 * @param {boolean} options.noToast         - 禁用 toast 通知（仅原生通知）
 *
 * @returns {Promise<Object>} 通知句柄 { id, close, getNative, isClosed }
 *
 * @example
 * // 主进程
 * import { showNotification } from '../shared/notification.js'
 * showNotification({ title: '下载完成', body: '文件已保存', silent: true })
 *
 * @example
 * // 渲染进程（自动通过 IPC）
 * import { showNotification } from '@shared/notification'
 * showNotification({
 *   title: '新消息',
 *   body: '您有 3 条未读消息',
 *   onClick: () => { console.log('点击了通知') }
 * })
 *
 * @example
 * // macOS 操作按钮
 * showNotification({
 *   title: '提醒',
 *   body: '会议即将开始',
 *   actions: [{ type: 'button', text: '查看' }],
 *   onAction: (event, index) => { console.log('点击了按钮', index) }
 * })
 */
export async function showNotification(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // 强制 toast 模式
  if (opts.forceToast) {
    return _showToastOnly(opts)
  }

  // 主进程：直接使用原生 Notification
  if (isMainProcess) {
    try {
      return await _showInMainProcess(opts)
    } catch (err) {
      console.warn('[Notification] 原生通知失败，降级:', err.message)
      if (!opts.noToast) {
        return _showToastOnly(opts)
      }
      return {
        id: _generateId(),
        close: () => {},
        getNative: () => null,
        isClosed: () => true
      }
    }
  }

  // 渲染进程：尝试 IPC → 原生通知，同时显示 toast
  if (isRendererProcess) {
    // 始终显示 toast 作为视觉反馈（除非显式禁用）
    if (!opts.noToast) {
      _showToastOnly(opts)
    }

    try {
      return await _showInRendererProcess(opts)
    } catch (err) {
      console.warn('[Notification] 渲染进程通知失败:', err.message)
      return {
        id: _generateId(),
        close: () => {},
        getNative: () => null,
        isClosed: () => false
      }
    }
  }

  // 未知环境：仅 toast
  console.warn('[Notification] 未知运行环境，降级为 toast')
  return _showToastOnly(opts)
}

/**
 * 检查当前环境是否支持原生通知
 * @returns {boolean}
 */
export function isNativeNotificationSupported() {
  return isMainProcess || (isRendererProcess && !!window.ipcRenderer)
}

/**
 * 检查当前是否运行在主进程
 * @returns {boolean}
 */
export function isMain() {
  return isMainProcess
}

/**
 * 检查当前是否运行在渲染进程
 * @returns {boolean}
 */
export function isRenderer() {
  return isRendererProcess
}

/**
 * 获取当前平台信息
 * @returns {{ platform: string, isMac: boolean, isWin: boolean, isLinux: boolean }}
 */
export function getPlatformInfo() {
  if (typeof process === 'undefined' || !process.platform) {
    return { platform: 'unknown', isMac: false, isWin: false, isLinux: false }
  }
  const platform = process.platform
  return {
    platform,
    isMac: platform === 'darwin',
    isWin: platform === 'win32',
    isLinux: platform === 'linux'
  }
}

// ─── 便捷方法 ───────────────────────────────────────────────────────────

/**
 * 成功通知
 */
export async function notifySuccess(title, body, options = {}) {
  return showNotification({ ...options, title, body, type: 'success' })
}

/**
 * 警告通知
 */
export async function notifyWarning(title, body, options = {}) {
  return showNotification({ ...options, title, body, type: 'warning' })
}

/**
 * 错误通知
 */
export async function notifyError(title, body, options = {}) {
  return showNotification({ ...options, title, body, type: 'error' })
}

/**
 * 信息通知
 */
export async function notifyInfo(title, body, options = {}) {
  return showNotification({ ...options, title, body, type: 'info' })
}

// ─── 默认导出 ───────────────────────────────────────────────────────────

export default {
  show: showNotification,
  showNotification,
  initRendererNotificationListener,
  isNativeNotificationSupported,
  isMain,
  isRenderer,
  getPlatformInfo,
  notifySuccess,
  notifyWarning,
  notifyError,
  notifyInfo
}
