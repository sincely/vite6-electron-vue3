import { net } from 'electron'
import logger from './log'

// 默认配置（远端配置拉取失败时的兜底值，保证不影响现有功能）
const DEFAULT_CONFIG = Object.freeze({
  schemaVersion: 1, // 配置结构版本
  eligible: true, // 更新资格总开关：false 时禁止检查更新
  disabledClientVersions: [], // 禁用版本列表：命中则强制升级，支持精确("1.0.1")与前缀("1.0")
  autoDownload: false, // 是否自动下载（兜底保持用户确认后再下载）
  checkOnFocus: true, // 窗口聚焦时是否检查更新
  minCheckIntervalMinutes: 30 // 聚焦触发的最小检查间隔（分钟），防频繁请求
})

// 配置轮询间隔
const POLL_INTERVAL = 2 * 60 * 1000 // 10 分钟（对齐 QoderWork 600s 轮询）

let config = { ...DEFAULT_CONFIG } // 当前生效配置（内存缓存）
let lastConfigJson = '' // 上次成功配置的序列化结果，用于检测变化
let configChangeHandler = null // 配置变化回调（由 update.js 注入，用于推送渲染层）
let pollingTimer = null

// 规范配置地址（与 update.js 中 normalizeUpdateUrl 保持一致）
function normalizeUrl(url) {
  return url ? (url.endsWith('/') ? url : `${url}/`) : ''
}

// 生成远端配置文件地址：{更新服务器}/update-config.json
function getConfigUrl() {
  return `${normalizeUrl(process.env.VITE_UPDATE_URL)}update-config.json`
}

/**
 * 校验并规范化远端配置
 * 只提取已知字段，未知字段忽略，非法类型回退默认值
 */
function normalizeConfig(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_CONFIG }
  }
  return {
    schemaVersion:
      typeof raw.schemaVersion === 'number'
        ? raw.schemaVersion
        : DEFAULT_CONFIG.schemaVersion,
    eligible:
      typeof raw.eligible === 'boolean'
        ? raw.eligible
        : DEFAULT_CONFIG.eligible,
    disabledClientVersions: Array.isArray(raw.disabledClientVersions)
      ? raw.disabledClientVersions
      : DEFAULT_CONFIG.disabledClientVersions,
    autoDownload:
      typeof raw.autoDownload === 'boolean'
        ? raw.autoDownload
        : DEFAULT_CONFIG.autoDownload,
    checkOnFocus:
      typeof raw.checkOnFocus === 'boolean'
        ? raw.checkOnFocus
        : DEFAULT_CONFIG.checkOnFocus,
    minCheckIntervalMinutes:
      typeof raw.minCheckIntervalMinutes === 'number' &&
      raw.minCheckIntervalMinutes > 0
        ? raw.minCheckIntervalMinutes
        : DEFAULT_CONFIG.minCheckIntervalMinutes
  }
}

// 获取当前配置（返回副本，防止外部直接修改内部缓存）
export function getUpdateConfig() {
  return { ...config }
}

// 设置配置变化回调（由 update.js 注入，用于推送渲染层）
export function setConfigChangeHandler(handler) {
  configChangeHandler = handler
}

/**
 * 刷新远端配置
 * 成功：更新内存缓存，配置发生变化时触发回调
 * 失败：保留上次成功配置；无缓存则用默认配置（不影响现有功能）
 */
export async function refreshUpdateConfig() {
  const url = getConfigUrl()
  if (!url) {
    logger.warn('[update-config] 未配置更新服务地址，跳过远端配置拉取')
    return false
  }
  try {
    // 服务端未下发 Cache-Control，Chromium 会对同一 URL 做启发式缓存，
    // 导致轮询拿到旧响应。追加时间戳 + no-cache 头强制每次回源。
    const cacheBustUrl = `${url}${url.includes('?') ? '&' : '?'}_=${Date.now()}`
    const res = await net.fetch(cacheBustUrl, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      signal: AbortSignal.timeout(5000) // 5s 超时，避免阻塞启动
    })
    if (!res.ok) {
      logger.warn(`[update-config] 拉取失败 HTTP ${res.status}: ${url}`)
      return false
    }
    const raw = await res.json()
    const next = normalizeConfig(raw)
    const nextJson = JSON.stringify(next)
    const changed = nextJson !== lastConfigJson
    lastConfigJson = nextJson
    config = next
    logger.info('[update-config] 远端配置已更新', next)
    if (changed) {
      configChangeHandler?.(getUpdateConfig())
    }
    return true
  } catch (error) {
    logger.warn('[update-config] 拉取远端配置出错：', error.message)
    return false
  }
}

/**
 * 判断指定版本是否被禁用
 * 支持精确匹配（"1.0.1"）与前缀匹配（"1.0" 命中 1.0.x 系列）
 */
export function isVersionDisabled(
  version,
  disabledList = config.disabledClientVersions
) {
  if (!version || !Array.isArray(disabledList) || disabledList.length === 0) {
    return false
  }
  return disabledList.some((item) => {
    const target = String(item).trim()
    if (!target) return false
    return version === target || version.startsWith(`${target}.`)
  })
}

// 启动配置轮询（每 10 分钟拉取一次，感知远端配置变化）
export function startConfigPolling() {
  if (pollingTimer) return
  pollingTimer = setInterval(() => {
    refreshUpdateConfig()
  }, POLL_INTERVAL)
  pollingTimer.unref?.()
}
