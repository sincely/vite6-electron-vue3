/**
 * 浏览器唤起应用（Deep Link / URL Scheme）
 *
 * 通过自定义协议 lightning:// 实现从浏览器或外部应用唤起本应用：
 *  - 打包环境：electron-builder.json5 中 protocols 配置会在安装时注册协议
 *    （macOS → CFBundleURLTypes，Windows → NSIS 注册表）
 *  - 运行中再次唤起：macOS 通过 open-url 事件；Windows/Linux 通过 second-instance 的 argv
 *  - 冷启动唤起：macOS 通过 open-url 事件（可能在 ready 前触发，需提前注册监听）；
 *    Windows/Linux 通过启动参数 process.argv
 *
 * 链接格式：lightning://<路由路径>?<查询参数>
 *   例如 lightning://desktop/console?id=1 → 渲染进程路由 /desktop/console?id=1
 *   仅传 lightning:// 或 lightning://open 时只激活窗口，不做路由跳转
 *
 * 分发策略：
 *  - 主窗口已加载完成：通过 IPC 事件 deep-link-open 实时推送
 *  - 主窗口未就绪（冷启动 / 尚在登录窗口）：缓存到 pendingDeepLink，
 *    由主窗口渲染层挂载后通过 get-pending-deep-link 主动拉取
 */

import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import logger from './log'
import { getMainWindow, restoreMainWindow } from './windowManager'

/** 自定义协议名（与 electron-builder.json5 中 protocols.schemes 保持一致） */
export const DEEPLINK_PROTOCOL = 'lightning'

/** 渲染进程消费用的 IPC 事件/通道名 */
export const DEEPLINK_EVENT = 'deep-link-open'
export const DEEPLINK_PENDING_CHANNEL = 'get-pending-deep-link'

/** 待消费的深链载荷（冷启动 / 登录阶段缓存） */
let pendingDeepLink = null

/**
 * 解析深链 URL 为渲染进程可识别的路由信息
 * @param {string} url - 形如 lightning://desktop/console?id=1
 * @returns {{ url: string, path: string, query: string, fullPath: string } | null}
 *   path 为空字符串表示仅激活窗口，无需路由跳转
 */
export function parseDeepLink(url) {
  if (!url || typeof url !== 'string') return null
  const prefix = `${DEEPLINK_PROTOCOL}://`
  if (!url.toLowerCase().startsWith(prefix)) return null

  // 去掉协议头与多余的开头 / 或 #（兼容 lightning://#/desktop 写法）
  const raw = url.slice(prefix.length).replace(/^[/#]+/, '')
  // 分离路径与 query（保留 query 原样）
  const cutIndex = raw.search(/[?#]/)
  const pathPart = (cutIndex === -1 ? raw : raw.slice(0, cutIndex)).replace(
    /\/+$/,
    ''
  )
  const rest = cutIndex === -1 ? '' : raw.slice(cutIndex)

  const routePath = pathPart ? `/${pathPart}` : ''
  return {
    url,
    path: routePath,
    query: rest.startsWith('?') ? rest.slice(1) : '',
    fullPath: routePath + rest
  }
}

/**
 * 实时推送深链到主窗口；主窗口未就绪时保留 pending 等待拉取
 */
function dispatchToMainWindow(payload) {
  const win = getMainWindow()
  if (win && !win.isDestroyed() && !win.webContents.isLoading()) {
    win.webContents.send(DEEPLINK_EVENT, payload)
  }
  // 其余情况依赖 pendingDeepLink，由渲染层挂载后主动拉取
}

/**
 * 统一的深链入口：解析 → 激活窗口 → 分发/缓存
 * @param {string} url - 原始协议链接
 * @param {string} source - 来源标记：open-url | argv | second-instance
 */
export function handleDeepLink(url, source = 'unknown') {
  const parsed = parseDeepLink(url)
  if (!parsed) {
    logger.warn(`[DeepLink] 忽略无效的链接(${source}): ${url}`)
    return
  }
  logger.info(`[DeepLink] 收到链接(${source}): ${url}`)

  const payload = {
    ...parsed,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    source,
    timestamp: Date.now()
  }

  // 缓存兜底（冷启动时窗口尚未加载完成，事件会丢失）
  pendingDeepLink = payload
  // 激活/聚焦窗口（主窗口不存在时聚焦登录窗口）
  restoreMainWindow()
  // 主窗口已就绪则实时推送
  dispatchToMainWindow(payload)
}

/**
 * 从命令行参数中提取深链（Windows/Linux 冷启动 & second-instance）
 * @param {string[]} argv - 进程启动参数
 * @param {string} source - 来源标记
 */
export function handleDeepLinkFromArgv(argv, source = 'argv') {
  const prefix = `${DEEPLINK_PROTOCOL}://`
  const url = (argv || []).find(
    (arg) => typeof arg === 'string' && arg.toLowerCase().startsWith(prefix)
  )
  if (url) handleDeepLink(url, source)
}

/**
 * 供渲染进程拉取缓存的深链（仅主窗口可消费）
 * 登录窗口阶段不消费，等登录完成、主窗口挂载后再拉取
 * @param {Electron.BrowserWindow|null} requestingWin - 发起请求的窗口
 */
export function consumePendingDeepLink(requestingWin) {
  if (!pendingDeepLink) return null
  const mainWin = getMainWindow()
  if (!mainWin || mainWin.isDestroyed()) return null
  if (!requestingWin || requestingWin.id !== mainWin.id) return null

  const payload = pendingDeepLink
  pendingDeepLink = null
  return payload
}

/**
 * 初始化 Deep Link 支持（⚠️ 需在 app.whenReady() 之前调用）
 * - 注册为 lightning:// 的默认协议处理程序
 * - 注册 macOS open-url 监听（冷启动时事件可能早于 ready 触发）
 * - 处理 Windows/Linux 冷启动参数中的链接
 */
export function setupDeepLink() {
  if (app.isPackaged) {
    app.setAsDefaultProtocolClient(DEEPLINK_PROTOCOL)
  } else {
    // 开发环境：需显式传入 electron 可执行文件与入口路径，
    // 否则系统无法通过协议正确拉起开发实例
    app.setAsDefaultProtocolClient(DEEPLINK_PROTOCOL, process.execPath, [
      path.resolve(process.argv[1] || '.')
    ])
  }

  // macOS：无论应用是否在运行，协议链接都通过 open-url 事件派发
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleDeepLink(url, 'open-url')
  })

  // Windows / Linux：冷启动时链接位于启动参数中
  handleDeepLinkFromArgv(process.argv, 'argv')
}

/**
 * Deep Link 相关 IPC 频道（在 ipc/index.js 中统一注册）
 */
export const deepLinkIpc = [
  {
    channel: DEEPLINK_PENDING_CHANNEL,
    type: 'handle',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      return consumePendingDeepLink(win)
    }
  }
]
