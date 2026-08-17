/**
 * 渲染进程通知模块（方案二）
 *
 * 基于 Element Plus ElNotification 封装，可在任意 Vue 组件 / JS 模块中直接调用。
 * 代码简洁，无需修改主进程或预加载脚本，适用于简单的应用内通知需求。
 *
 * ── 用法（Vue 组件内）──
 *   import { showToast } from '@/utils/toast'
 *
 *   // 对象形式（完整配置）
 *   showToast({ title: '保存成功', message: '内容已更新', type: 'success' })
 *
 *   // 简写形式
 *   showToast('登录状态已过期，请重新登录', 'error')
 *
 *   // 便捷方法
 *   showToast.success('操作成功')
 *   showToast.error('操作失败', { duration: 0 }) // duration: 0 不自动关闭
 *
 * 说明：ElNotification 由 unplugin-auto-import 自动导入（含 sass 主题样式），
 * 因此此处无需手动 import，与项目其他位置（如 hooks/useNetwork.js）保持一致。
 *
 * 💡 需要系统级原生通知（通知中心 / 操作中心）时请使用方案一：
 *    见 src/main/notification.js（Electron Notification + IPC）。
 */
import { h } from 'vue'
import SvgIcon from '../components/SvgIcon/index.vue'

// ElNotification 内置的标准类型（自动渲染对应主题色图标）
const EL_TYPES = ['success', 'warning', 'info', 'error']

/**
 * 显示通知
 *
 * @param {Object|string} options - 通知配置对象，或直接传通知正文（简写形式）
 * @param {string}  options.title      - 标题（默认 '通知'）
 * @param {string|VNode} options.message - 正文内容
 * @param {string}  options.type       - 类型。标准类型 'success'|'warning'|'info'|'error'
 *                                       使用 ElNotification 内置图标；
 *                                       其他类型（如 'celebrate'）渲染为 SvgIcon 图标
 * @param {string|Component|VNode} options.icon - 自定义图标（优先于 type 图标）
 * @param {boolean} options.showClose  - 是否显示关闭按钮（默认 false）
 * @param {string}  options.position   - 弹出位置（默认 'top-right'）
 * @param {number}  options.duration   - 自动关闭时间 ms（默认 2500，0 表示不自动关闭）
 * @param {Function} options.onClick   - 点击回调
 * @param {Function} options.onClose   - 关闭回调
 * @param {string} [fallbackType]      - 简写形式的类型：showToast('正文', 'error')
 * @returns {Object} NotificationHandle，可调用 .close() 手动关闭
 */
export const showToast = (options, fallbackType) => {
  // 兼容简写：showToast('正文内容', 'error')
  const opts =
    typeof options === 'string'
      ? { message: options, type: fallbackType }
      : { ...options }

  const {
    title = '通知',
    message = '',
    type = 'info',
    icon,
    showClose = false,
    position = 'top-right',
    duration = 2500,
    ...rest
  } = opts

  // 图标策略：
  // 1. 显式传入 icon 时优先使用
  // 2. 标准类型使用 ElNotification 内置图标（type 驱动）
  // 3. 自定义类型（如 celebrate）渲染为 SvgIcon
  const isStandardType = EL_TYPES.includes(type)
  const resolvedIcon =
    icon ??
    (isStandardType
      ? undefined
      : h(SvgIcon, { iconClass: type, width: '25px', height: '25px' }))

  return ElNotification({
    title,
    message,
    // 仅透传标准类型，避免 ElNotification 收到未知类型报错
    type: isStandardType ? type : '',
    icon: resolvedIcon,
    showClose,
    position,
    duration,
    // 透传其余 ElNotification 原生配置（onClick / onClose / dangerouslyUseHTMLString 等）
    ...rest
  })
}

// ─── 便捷方法 ─────────────────────────────────────────────────────────────
showToast.success = (message, options = {}) =>
  showToast({ ...options, message, type: 'success' })
showToast.warning = (message, options = {}) =>
  showToast({ ...options, message, type: 'warning' })
showToast.error = (message, options = {}) =>
  showToast({ ...options, message, type: 'error' })
showToast.info = (message, options = {}) =>
  showToast({ ...options, message, type: 'info' })

export default showToast
