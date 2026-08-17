/**
 * 主进程通知模块（方案一）
 *
 * 基于 Electron 原生 Notification + IPC 封装，用于发送系统级通知：
 * Windows 操作中心 / macOS 通知中心 / Linux 桌面通知。
 *
 * ── 特性 ──
 * 1. 支持 Electron Notification 全量配置（subtitle / silent / icon / actions /
 *    urgency / timeoutType / hasReply / toastXml 等）及各类事件回调
 * 2. icon 属性按平台自动适配（也可通过 options.icon 自定义）：
 *    - Windows: 推荐 .ico
 *    - macOS  : 推荐 .png 或 .icns（不传时系统默认使用应用图标）
 *    - Linux  : 必须 .png
 * 3. 同时通过 IPC 推送应用内 toast（复用已注册的 show-notification 频道，
 *    无需修改 ipc/notification.js 与 preload 脚本）
 *
 * ── 用法（主进程）──
 *   import createNotification from './notification'
 *
 *   createNotification({
 *     title: '下载完成',
 *     body: '文件已保存到本地',
 *     type: 'success',
 *     onClick: () => console.log('通知被点击')
 *   })
 *
 * 💡 简单的应用内通知推荐方案二：渲染进程直接使用 Element Plus ElNotification，
 *    见 src/render/utils/toast.js，代码更简洁，无需经过主进程。
 */
import { app, Notification } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import logger from './log'
import { sendNotificationToRenderer } from './ipc/notification.js'

// ─── 平台图标解析 ─────────────────────────────────────────────────────────

/**
 * 图标根目录
 * 与 electron-builder extraResources 的路径规则保持一致：
 *   开发：<APP_ROOT>/resources/icons/<platform>/...
 *   打包：process.resourcesPath/icons/<platform>/...
 */
const getIconsRoot = () =>
  app.isPackaged
    ? path.join(process.resourcesPath, 'icons')
    : path.join(process.env.APP_ROOT, 'resources', 'icons')

/** 返回候选路径中第一个真实存在的文件，均不存在时返回 null */
const pickFirstExisting = (candidates) =>
  candidates.find((p) => p && fs.existsSync(p)) || null

/**
 * 获取当前平台适配的通知图标
 *
 * Electron Notification 的 icon 属性在不同平台有不同要求：
 * - Windows: 推荐 .ico（png/jpg 可用但 ico 效果最佳）
 * - macOS  : 推荐 .png 或 .icns（不传时默认使用应用图标）
 * - Linux  : 必须 .png
 *
 * @returns {string|null} 图标路径；找不到可用图标时返回 null（通知将使用系统默认图标）
 */
export const getNotificationIcon = () => {
  const iconsRoot = getIconsRoot()

  switch (process.platform) {
    case 'win32':
      return pickFirstExisting([
        path.join(iconsRoot, 'win', 'app.ico'),
        path.join(iconsRoot, '..', 'app.png')
      ])
    case 'darwin':
      return pickFirstExisting([
        path.join(iconsRoot, 'mac', 'app.icns'),
        path.join(iconsRoot, '..', 'app.png')
      ])
    case 'linux':
      return pickFirstExisting([
        path.join(iconsRoot, 'linux', '256.png'),
        path.join(iconsRoot, 'linux', '128.png'),
        path.join(iconsRoot, 'linux', '64.png')
      ])
    default:
      return null
  }
}

// ─── 通知创建 ─────────────────────────────────────────────────────────────

/** 生成唯一通知 ID */
let idCounter = 0
const generateId = () => `notif_${Date.now()}_${++idCounter}`

/** 空通知句柄（仅 toast / 不支持原生通知时返回） */
const emptyHandle = (isClosed = false) => ({
  id: null,
  close: () => {},
  getNative: () => null,
  isClosed: () => isClosed
})

/**
 * 创建通知（主进程入口）
 *
 * 同时触发：
 * 1. 应用内 toast 通知（通过 IPC 发送到渲染进程，推入通知中心）
 * 2. 系统原生通知（Electron Notification）
 *
 * @param {Object} options - 通知配置
 * @param {string}  options.title           - 标题（默认 '通知'）
 * @param {string}  options.body            - 正文
 * @param {string}  options.type            - 类型 'info'|'success'|'warning'|'error'|'celebrate'（仅用于应用内 toast 展示）
 * @param {string}  options.subtitle        - 副标题（macOS only）
 * @param {boolean} options.silent          - 静默模式（不播放提示音）
 * @param {string}  options.urgency         - 紧急程度 'normal'|'critical'|'low'（Linux only）
 * @param {string}  options.timeoutType     - 超时类型 'default'|'never'（Windows / Linux）
 * @param {boolean} options.hasReply        - 是否允许内联回复（macOS only）
 * @param {string}  options.closeButtonText - 关闭按钮文字（macOS only）
 * @param {string}  options.icon            - 自定义图标路径。不传则按平台自动选取
 *                                            （Windows → .ico / macOS → .png|.icns / Linux → .png）；
 *                                            显式传 null 表示不使用自定义图标
 * @param {string}  options.sound           - 自定义提示音路径（macOS only）
 * @param {Array}   options.actions         - 操作按钮 [{ type: 'button', text: '查看' }]（macOS only）
 * @param {string}  options.toastXml        - 自定义 toast XML 模板（Windows only）
 * @param {boolean} options.noNative        - 禁用原生通知，仅应用内 toast
 * @param {boolean} options.noToast         - 禁用应用内 toast，仅原生通知
 * @param {Function} options.onClick        - 点击回调
 * @param {Function} options.onClose        - 关闭回调
 * @param {Function} options.onAction       - 操作按钮回调 (event, index)（macOS only）
 * @param {Function} options.onReply        - 内联回复回调 (event, reply)（macOS only）
 * @param {Function} options.onShow         - 显示回调
 * @param {Function} options.onFailed       - 失败回调
 * @returns {Promise<Object>} 通知句柄 { id, close, getNative, isClosed }
 */
const createNotification = async (options = {}) => {
  const {
    noNative,
    noToast,
    type,
    icon,
    onClick,
    onClose,
    onAction,
    onReply,
    onShow,
    onFailed,
    ...rest
  } = options

  const title = options.title || '通知'
  const body = options.body || ''

  // 1. 应用内 toast：通过 IPC 发送到渲染进程（复用既有 show-notification 频道）
  if (!noToast) {
    sendNotificationToRenderer({ title, body, type: type || 'info' })
  }

  // 2. 系统原生通知
  if (noNative) return emptyHandle()

  if (!Notification.isSupported) {
    logger.warn('[Notification] 当前系统不支持原生通知')
    return emptyHandle(true)
  }

  // 构建 Electron Notification 参数
  const notifOpts = {
    title,
    body,
    silent: !!rest.silent,
    urgency: rest.urgency || 'normal',
    timeoutType: rest.timeoutType || 'default',
    hasReply: !!rest.hasReply,
    closeButtonText: rest.closeButtonText || '关闭'
  }

  // icon：显式传入则使用自定义值；未传入时按平台自动选取；显式传 null 表示不使用
  const notifIcon = 'icon' in options ? icon : getNotificationIcon()
  if (notifIcon) notifOpts.icon = notifIcon

  if (rest.subtitle) notifOpts.subtitle = rest.subtitle
  if (rest.sound) notifOpts.sound = rest.sound
  if (rest.actions && rest.actions.length > 0) notifOpts.actions = rest.actions
  if (rest.toastXml) notifOpts.toastXml = rest.toastXml

  try {
    const notif = new Notification(notifOpts)

    // 事件绑定
    if (typeof onClick === 'function') notif.once('click', onClick)
    if (typeof onClose === 'function') notif.once('close', onClose)
    if (typeof onAction === 'function') notif.on('action', onAction)
    if (typeof onReply === 'function') notif.on('reply', onReply)
    if (typeof onShow === 'function') notif.once('show', onShow)
    if (typeof onFailed === 'function') notif.once('failed', onFailed)

    notif.show()

    const notifId = generateId()
    let closed = false
    notif.once('close', () => {
      closed = true
    })

    return {
      id: notifId,
      close: () => {
        try {
          notif.close()
          closed = true
        } catch (_) {
          /* 忽略已关闭的错误 */
        }
      },
      getNative: () => notif,
      isClosed: () => closed
    }
  } catch (err) {
    logger.error('[Notification] 创建原生通知失败:', err)
    if (typeof onFailed === 'function') onFailed(null, err?.message || err)
    return emptyHandle(true)
  }
}

export default createNotification
