/**
 * 主进程 HTTP 代理
 *
 * 职责：
 *   1. 在主进程（Node.js）持有 axios 实例，绕开浏览器 CORS / cookie 域限制
 *   2. 接收渲染进程通过 IPC 传来的"普通对象"配置，按需构造请求体
 *      （表单 / JSON / 二进制响应），统一回传规范化结果
 *   3. 通过 axios 请求/响应拦截器统一处理：
 *      - Token 注入、表单构造（请求拦截器）
 *      - 完整请求/响应日志、错误归一化（响应拦截器）
 *   4. 维护 requestId → AbortController，支持外部取消正在进行的请求
 *
 * 协议：
 *   入参 config = {
 *     url, method, params, data, headers,
 *     isForm, responseType, timeout, token,
 *     requestId
 *   }
 *   返回 = {
 *     status, headers, dataType,
 *     data,                  // json → object|string；buffer → ArrayBuffer
 *     mimeType?, filename?   // 仅 buffer 响应
 *   }
 *   抛错：业务错误抛 Error 并附带 .status / .data / .code
 */
import axios from 'axios'
import logger from '../log'

const BASE_URL = process.env.VITE_SERVER_URL || 'http://localhost:5320/api'

// 主进程 axios 实例：baseURL 来自 .env 注入的 VITE_SERVER_URL
const service = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  // 关闭 axios 的自动 JSON 解析，文本类响应保持原样回传渲染端
  transformResponse: [(data) => data]
})

// requestId → AbortController，用于外部取消
const pendingRequests = new Map()

function buildFormBody(obj) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined && v !== null) {
      params.append(k, String(v))
    }
  }
  return params
}

function parseFilenameFromContentDisposition(disposition = '') {
  // 兼容 RFC 5987 / 简单 filename=
  const m = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i)
  if (!m) return null
  try {
    return decodeURIComponent(m[1])
  } catch {
    return m[1]
  }
}

// ── 请求拦截器 ─────────────────────────────────────
// 统一处理：Token 注入 / 表单构造 / 请求日志
service.interceptors.request.use(
  (config) => {
    const startedAt = Date.now()
    config._startedAt = startedAt

    // 自动注入 Bearer token（由渲染端从 userStore 取出后透传）
    if (config.token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${config.token}`
    }

    // 表单请求：在主进程构造 URLSearchParams，避免 IPC 序列化异常
    if (config.isForm && config.data && typeof config.data === 'object') {
      config.data = buildFormBody(config.data)
      config.headers = config.headers || {}
      config.headers['Content-Type'] =
        'application/x-www-form-urlencoded;charset=UTF-8'
    }

    // 请求日志（开发环境下保持简洁）
    logger.info(
      `[http] → ${String(config.method).toUpperCase()} ${config.url}` +
        (config.requestId ? `  #${config.requestId}` : ''),
      {
        params: config.params,
        data: config.isForm ? '(form)' : config.data,
        timeout: config.timeout,
        token: !!config.token
      }
    )
    return config
  },
  (error) => {
    logger.error('[http] request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ── 响应拦截器 ─────────────────────────────────────
// 统一处理：响应日志 / 二进制响应归一化 / JSON 手动解析 / 错误归一化
service.interceptors.response.use(
  (response) => {
    const config = response.config
    const elapsed = config._startedAt ? Date.now() - config._startedAt : 0

    // 清理 pending
    if (config.requestId) {
      pendingRequests.delete(config.requestId)
    }

    // 响应日志
    logger.info(
      `[http] ← ${response.status} ${config.url}` +
        (config.requestId ? `  #${config.requestId}` : '') +
        `  ${elapsed}ms`
    )

    // 二进制响应：返回 ArrayBuffer + 解析 Content-Disposition 文件名
    if (config.responseType === 'arraybuffer') {
      const raw = response.data
      const arrayBuffer =
        raw instanceof ArrayBuffer
          ? raw
          : ArrayBuffer.isView(raw)
            ? raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
            : Buffer.from(raw)
      const contentType =
        response.headers?.['content-type'] || 'application/octet-stream'
      const filename = parseFilenameFromContentDisposition(
        response.headers?.['content-disposition']
      )
      return {
        status: response.status,
        headers: response.headers,
        dataType: 'buffer',
        data: arrayBuffer,
        mimeType: contentType,
        filename
      }
    }

    // JSON 响应：axios 已禁用自动解析，这里手动解析
    let payload = response.data
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload)
      } catch {
        /* 保留原始字符串 */
      }
    }

    return {
      status: response.status,
      headers: response.headers,
      dataType: config.responseType || 'json',
      data: payload
    }
  },
  (err) => {
    const config = err.config || {}
    const elapsed = config._startedAt ? Date.now() - config._startedAt : 0

    // 清理 pending
    if (config.requestId) {
      pendingRequests.delete(config.requestId)
    }

    // axios 取消（AbortController 触发）
    if (
      err.name === 'CanceledError' ||
      err.name === 'AbortError' ||
      err.code === 'ERR_CANCELED'
    ) {
      logger.warn(
        `[http] ✗ canceled ${config.url}` +
          (config.requestId ? `  #${config.requestId}` : '') +
          `  ${elapsed}ms`
      )
      const e = new Error('Request canceled')
      e.code = 'CANCELED'
      throw e
    }

    logger.error(
      `[http] ✗ ${err.message} ${config.url}` +
        (config.requestId ? `  #${config.requestId}` : '') +
        `  ${elapsed}ms`,
      err.response
        ? { status: err.response.status, data: err.response.data }
        : undefined
    )

    // HTTP 业务错误：透传 status / 响应体
    if (err.response) {
      const e = new Error(err.message || `HTTP ${err.response.status}`)
      e.code = 'HTTP_ERROR'
      e.status = err.response.status
      e.data = err.response.data
      throw e
    }
    // 网络错误
    const e = new Error(err.message || 'Network Error')
    e.code = 'NETWORK_ERROR'
    throw e
  }
)

/**
 * 处理来自渲染进程的 HTTP 请求
 * 把 IPC 参数原样透传给 axios 拦截器，由拦截器完成 token / 表单 / 日志 / 取消
 *
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {Object} config
 */
export async function handleHttpRequest(_event, config = {}) {
  const {
    url,
    method = 'get',
    params,
    data,
    headers = {},
    isForm = false,
    responseType = 'json',
    timeout,
    token,
    requestId
  } = config

  if (!url) {
    const e = new Error('[http] url is required')
    e.code = 'INVALID_CONFIG'
    throw e
  }

  const axiosConfig = {
    url,
    method: String(method).toLowerCase(),
    params,
    data,
    headers: { ...headers },
    isForm,
    responseType:
      responseType === 'blob' || responseType === 'arraybuffer'
        ? 'arraybuffer'
        : responseType,
    timeout: timeout ?? undefined,
    token,
    requestId
  }

  // 取消支持：注册 AbortController
  if (requestId) {
    const controller = new AbortController()
    axiosConfig.signal = controller.signal
    pendingRequests.set(requestId, controller)
  }

  // 拦截器返回的已是规范化结果，直接回传渲染进程
  return service.request(axiosConfig)
}

/**
 * 取消正在进行的请求
 * @param {Electron.IpcMainEvent} _event
 * @param {string} requestId
 */
export function handleHttpCancel(_event, requestId) {
  const controller = pendingRequests.get(requestId)
  if (controller) {
    try {
      controller.abort()
    } catch {
      /* ignore */
    }
    pendingRequests.delete(requestId)
  }
}

/** 清空所有 pending 请求（应用退出前调用，避免悬挂的 AbortController） */
export function clearAllHttpRequests() {
  pendingRequests.forEach((controller) => {
    try {
      controller.abort()
    } catch {
      /* ignore */
    }
  })
  pendingRequests.clear()
}

export default {
  handleHttpRequest,
  handleHttpCancel,
  clearAllHttpRequests
}
