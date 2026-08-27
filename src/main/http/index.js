/**
 * 主进程 HTTP 代理（带拦截器 · 终端日志）
 *
 * 职责：接收渲染进程通过 IPC 传来的请求配置，调用 axios 发起真实 HTTP，返回响应。
 *
 * 拦截器：
 *   - 请求：注入 Authorization（Bearer token）与 Content-Type，按 isForm 构造表单
 *   - 响应：统一归一化为 { status, headers, data }
 *   - 响应失败：原样 reject（由调用方处理）
 *
 * 日志（仅主进程终端，不镜像到渲染端）：
 *   每个事件输出多行分桶日志——首行为概览（方法/URL/状态），后续每行一个字段
 *   （params/body/headers/message…），字段标签左对齐，对象值经 JSON.stringify 完整序列化。
 *   请求 / 响应 / 错误三种事件共用同一格式，例如：
 *     [http] → GET /table/list
 *       params : {"pageNum":1,"pageSize":5}
 *       body   : {"name":"张三"}
 *       headers: {"Authorization":"Bearer eyJhbGciOi…"}
 *     [http] ← 200 GET /table/list
 *       body: {"code":0,"data":{"rows":[…],"total":100}}
 *     [http] ✗ 500 POST /login
 *       message: "timeout of 15000ms exceeded"
 *       body   : {"error":"…"}
 *
 * 协议（params 与 data 严格分桶）：
 *   入参 config = {
 *     url, method,
 *     params,   // → 始终序列化为 URL 查询串
 *     data,     // → 作为请求体发送（POST/PUT/PATCH）
 *     headers, isForm, responseType, timeout, token
 *   }
 *   返回 = { status, headers, data }
 *   抛错：axios 原始错误
 */
import axios from 'axios'
import { inspect } from 'util'
import logger from '../log'

const BASE_URL = process.env.VITE_SERVER_URL || 'http://localhost:5320/api'

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 15000
})

// 把 URLSearchParams / FormData / Blob / ArrayBuffer 等不可读对象
// 转成 plain object 或可读字符串后再日志
function readableBody(data) {
  if (data == null) return data
  if (data instanceof URLSearchParams) return Object.fromEntries(data)
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return Object.fromEntries(data.entries())
  }
  // Blob / File：打印类型与大小，不打印二进制内容
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return `[Blob size=${data.size} type=${data.type || 'unknown'}]`
  }
  if (data instanceof ArrayBuffer) {
    return `[ArrayBuffer length=${data.byteLength}]`
  }
  // Node.js Buffer / Uint8Array 等 TypedArray
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    return `[Buffer length=${data.length}]`
  }
  if (ArrayBuffer.isView(data)) {
    return `[${data.constructor.name} length=${data.byteLength}]`
  }
  // 可读流：打印类型标记，不尝试消费流
  if (typeof data.pipe === 'function') {
    return `[${data.constructor.name || 'ReadableStream'}]`
  }
  // 普通对象/数组：用 util.inspect 完整展开为字符串，
  // 绕过 electron-log console transport 最终调用 console.info 时
  // 默认 depth=2 导致嵌套对象被截断为 [Object] 的问题
  if (typeof data === 'object') {
    return inspect(data, { depth: null })
  }
  return data
}

// ── 请求拦截器 ──────────────────────────────────────
service.interceptors.request.use((config) => {
  const method = String(config.method).toLowerCase()
  config.headers = config.headers || {}

  // 调用方通过 config.token 显式传入 token 时，自动注入 Bearer 头
  if (config.token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${config.token}`
  }

  config.headers['Content-Type'] = 'application/json;charset=UTF-8'
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
    config.headers['Content-Type'] =
      'application/x-www-form-urlencoded;charset=UTF-8'
  }

  // 终端日志：方法 + URL + 请求参数 + 请求体 + 请求头
  logger.info(`[http] → ${method.toUpperCase()} ${config.url}`)
  logger.info('  params :', readableBody(config.params))
  logger.info('  body   :', readableBody(config.data))
  logger.info('  headers:', readableBody(config.headers))

  return config
})

// ── 响应拦截器 ──────────────────────────────────────
service.interceptors.response.use(
  (response) => {
    logger.info(`[http] ← ${response.status} ${response.config.url}`)
    logger.info('  response body:', readableBody(response.data))

    return {
      status: response.status,
      headers: response.headers,
      data: response.data
    }
  },
  (err) => {
    const status = err.response?.status
    const url = err.config?.url
    logger.error(`[http] ✗ ${err.message} ${url ? `(${url})` : ''}`)
    if (status != null) logger.error('  status :', status)
    logger.error('  response body:', readableBody(err.response?.data))

    return Promise.reject(err)
  }
)

/**
 * 处理来自渲染进程的 HTTP 请求
 *
 * params 与 data 按 HTTP 方法分桶：
 *   - GET/HEAD/DELETE：通常只传 params；传 data 会发出警告
 *   - POST/PUT/PATCH：通常传 data；params 仍可附加为 URL 查询串
 */
export async function handleHttpRequest(event, config = {}) {
  const {
    url,
    method: rawMethod,
    params, // → URL 查询串
    data, // → 请求体
    headers,
    responseType,
    timeout,
    token // → 由渲染端透传的访问令牌
  } = config

  if (!url) {
    throw new Error('[http] url is required')
  }

  const method = String(rawMethod || 'get').toLowerCase()
  return service.request({
    url,
    method,
    params,
    data,
    headers,
    responseType,
    timeout,
    token // 透传给请求拦截器，自动注入 Authorization: Bearer xxx
  })
}

export default { handleHttpRequest }
