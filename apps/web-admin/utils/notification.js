/**
 * Web 通知统一封装（浏览器端）
 *
 * 对应 Electron 版的 src/shared/notification.js，去掉主进程 / IPC 分支，
 * 保留相同的对外 API（showNotification / isNativeNotificationSupported 等），
 * 使 notification-demo 等页面可以无差别调用。
 *
 * 环境映射：
 *   - 原生通知：浏览器 Notification API（需用户授权，桌面通知中心展示）
 *   - toast 降级：与 Electron 版一致，派发 'notification-toast' 自定义事件，
 *     由 NotificationToast 组件捕获展示
 */

// ─── 工具函数 ───────────────────────────────────────────────────────────

let _idCounter = 0
function _generateId() {
  return `notif_${Date.now()}_${++_idCounter}`
}

const DEFAULT_OPTIONS = {
  title: '',
  body: '',
  silent: false,
  icon: null,
  tag: '',
  // 通知类型（用于 toast 降级）'info' | 'success' | 'warning' | 'error'
  type: 'info',
  onClick: null,
  onClose: null,
  onShow: null,
  onFailed: null,
  // 强制使用 toast 通知（不申请系统通知）
  forceToast: false,
  // 禁用 toast 通知（仅原生通知）
  noToast: false
}

function _showToastOnly(options) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
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

/** 申请浏览器通知权限（未授权时自动弹窗询问） */
async function ensurePermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

/**
 * 显示通知：优先浏览器原生 Notification，失败/未授权降级为应用内 toast
 *
 * @param {Object} options
 * @param {string}  options.title
 * @param {string}  [options.body]
 * @param {boolean} [options.silent]     - 静默（不影响浏览器行为，仅标记）
 * @param {string}  [options.icon]       - 图标 URL
 * @param {string}  [options.tag]        - 同 tag 通知互相替换
 * @param {Function}[options.onClick]
 * @param {Function}[options.onClose]
 * @param {boolean} [options.forceToast] - 强制仅 toast
 * @param {boolean} [options.noToast]    - 原生失败时不降级
 * @returns {Promise<{id, close, getNative, isClosed}>}
 */
export async function showNotification(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (opts.forceToast) return _showToastOnly(opts)

  const permission = await ensurePermission()
  if (permission !== 'granted') {
    if (opts.noToast) {
      opts.onFailed?.(new Error('通知权限未授予'))
      return {
        id: _generateId(),
        close: () => {},
        getNative: () => null,
        isClosed: () => true
      }
    }
    return _showToastOnly(opts)
  }

  const id = _generateId()
  const native = new Notification(opts.title || '通知', {
    body: opts.body || '',
    icon: opts.icon || '/logo.svg',
    tag: opts.tag || id,
    silent: !!opts.silent
  })

  let closed = false
  native.onclick = () => opts.onClick?.()
  native.onclose = () => {
    closed = true
    opts.onClose?.()
  }
  native.onerror = (e) => opts.onFailed?.(e)
  native.onshow = () => opts.onShow?.()

  // 原生通知已展示时同步出一条应用内 toast（与 Electron 版行为一致）
  if (!opts.noToast) _showToastOnly(opts)

  return {
    id,
    close: () => native.close(),
    getNative: () => native,
    isClosed: () => closed
  }
}

/** 当前环境是否支持原生（系统）通知 */
export function isNativeNotificationSupported() {
  return typeof Notification !== 'undefined'
}

/** 是否为服务端（Node）环境 —— 浏览器端恒为 false，保持 API 兼容 */
export function isMain() {
  return false
}

/** 是否运行在浏览器页面中 */
export function isRenderer() {
  return typeof window !== 'undefined'
}

/** 平台信息（基于 UA 粗判） */
export function getPlatformInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isMac = /Mac/i.test(ua)
  const isWin = /Windows/i.test(ua)
  const isLinux = /Linux/i.test(ua) && !isAndroid(ua)
  return {
    platform: isMac
      ? 'darwin'
      : isWin
        ? 'win32'
        : isLinux
          ? 'linux'
          : 'unknown',
    isMac,
    isWin,
    isLinux
  }
}

function isAndroid(ua) {
  return /Android/i.test(ua)
}

// ─── 便捷方法 ───────────────────────────────────────────────────────────

export async function notifySuccess(title, body, options = {}) {
  return showNotification({ ...options, title, body, type: 'success' })
}

export async function notifyWarning(title, body, options = {}) {
  return showNotification({ ...options, title, body, type: 'warning' })
}

export async function notifyError(title, body, options = {}) {
  return showNotification({ ...options, title, body, type: 'error' })
}

export async function notifyInfo(title, body, options = {}) {
  return showNotification({ ...options, title, body, type: 'info' })
}

export default {
  show: showNotification,
  showNotification,
  isNativeNotificationSupported,
  isMain,
  isRenderer,
  getPlatformInfo,
  notifySuccess,
  notifyWarning,
  notifyError,
  notifyInfo
}
