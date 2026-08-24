/**
 * 主进程 HTTP 代理（带拦截器 · 含完整报文日志 · 同步转发渲染端）
 *
 * 职责：接收渲染进程通过 IPC 传来的请求配置，调用 axios 发起真实 HTTP，返回响应。
 *
 * 拦截器：
 *   - 请求：输出 method/url/params(URL)/data(Body)/headers，并转发到渲染端
 *   - 响应成功：输出 status/url/响应体，并转发到渲染端
 *   - 响应失败：输出 message/url/status/响应体，并转发到渲染端
 *
 * 双端日志：
 *   - 主进程终端：ANSI 颜色（黄/绿/红）
 *   - 渲染端 DevTools console：%c CSS 颜色（amber/green/red），与终端同步
 *
 * 协议（params 与 data 严格分桶）：
 *   入参 config = {
 *     url, method,
 *     params,   // → 始终序列化为 URL 查询串
 *     data,     // → 作为请求体发送（POST/PUT/PATCH）
 *     headers, isForm, responseType, timeout
 *   }
 *   返回 = { status, headers, data }
 *   抛错：axios 原始错误
 */
import axios from 'axios'
import logger from '../log'

// 终端 ANSI 颜色码
const RED = '\u001b[31m'
const GREEN = '\u001b[32m'
const YELLOW = '\u001b[33m'
const RESET = '\u001b[0m'

// DevTools console %c 样式（与终端色板对应）
const CSS = {
  request: 'color:#ca8a04;font-weight:bold', // amber-600
  success: 'color:#16a34a;font-weight:bold', // green-600
  error: 'color:#dc2626;font-weight:bold', // red-600
  warn: 'color:#ca8a04;font-weight:bold'
}

// 把日志镜像到发起请求的那个渲染窗口
function logToRenderer(sender, level, message, css, data) {
  if (!sender || sender.isDestroyed?.()) return
  try {
    sender.send('http:log', { level, message, css, data })
  } catch {
    /* sender 已失效则忽略 */
  }
}

const BASE_URL = process.env.VITE_SERVER_URL || 'http://localhost:5320/api'

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
})

// 仅允许携带 body 的方法集合（HTTP/1.1 规范层面 GET/HEAD 不能有 body）
const BODY_ALLOWED_METHODS = new Set(['post', 'put', 'patch'])

// 把 URLSearchParams / FormData 等不可读对象转成 plain object 再日志
function readableBody(data) {
  if (data == null) return data
  if (data instanceof URLSearchParams) return Object.fromEntries(data)
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return Object.fromEntries(data.entries())
  }
  return data
}

// ── 请求拦截器 ──────────────────────────────────────
service.interceptors.request.use((config) => {
  const method = String(config.method).toLowerCase()

  // isForm: 在主进程统一构造 URLSearchParams + 设置 Content-Type，
  // 渲染端只需要在 config 里写 isForm: true，普通对象照传。
  if (config.isForm && config.data && typeof config.data === 'object') {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(config.data)) {
      if (v !== undefined && v !== null) {
        params.append(k, String(v))
      }
    }
    config.data = params
    config.headers = config.headers || {}
    config.headers['Content-Type'] =
      'application/x-www-form-urlencoded;charset=UTF-8'
  }

  const msg = `[http] → ${method.toUpperCase()} ${config.url}`
  const detail = {
    params: config.params,
    body: readableBody(config.data),
    headers: config.headers,
    isForm: config.isForm,
    timeout: config.timeout
  }

  logToRenderer(config.__sender, 'request', msg, CSS.request, detail)

  return config
})

// ── 响应拦截器 ──────────────────────────��───────────
service.interceptors.response.use(
  (response) => {
    const msg = `[http] ← ${response.status} ${response.config.url}`
    const detail = { data: readableBody(response.data) }

    logToRenderer(response.config.__sender, 'success', msg, CSS.success, detail)

    return {
      status: response.status,
      headers: response.headers,
      data: response.data
    }
  },
  (err) => {
    const msg = `[http] ✗ ${err.message} ${err.config?.url || ''}`
    const detail = {
      status: err.response?.status,
      data: readableBody(err.response?.data)
    }
    logToRenderer(err.config?.__sender, 'error', msg, CSS.error, detail)

    return Promise.reject(err)
  }
)

/**
 * 处理来自渲染进程的 HTTP 请求
 *
 * params 与 data 按 HTTP 方法分桶：
 *   - GET/HEAD/DELETE：通常只传 params；传 data 会发出警告
 *   - POST/PUT/PATCH：通常传 data；params 仍可附加为 URL 查询串
 *
 * 通过 __sender 把发起请求的 webContents 透传给拦截器，用于镜像日志到渲染端
 */
export async function handleHttpRequest(event, config = {}) {
  const {
    url,
    method: rawMethod,
    params, // → URL 查询串
    data, // → 请求体
    headers,
    responseType,
    timeout
  } = config

  if (!url) {
    throw new Error('[http] url is required')
  }

  const method = String(rawMethod || 'get').toLowerCase()
  const sender = event?.sender

  // 异常组合给出提示，但不阻塞 —— 由调用方决定
  if (data != null && !BODY_ALLOWED_METHODS.has(method)) {
    const msg = `[http] ⚠ ${method.toUpperCase()} ${url} 携带了请求体（按 HTTP 规范不推荐）`
    logToRenderer(sender, 'warn', msg, CSS.warn)
  }

  return service.request({
    url,
    method,
    params,
    data,
    headers,
    responseType,
    timeout,
    __sender: sender // 透传给拦截器，用于把日志镜像回渲染端
  })
}

export default { handleHttpRequest }
