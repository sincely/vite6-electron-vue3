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
 *   （baseURL/timeout/params/body/headers…），字段标签左对齐，对象值完整序列化。
 *   成功响应为绿色日志，错误响应为红色日志（ANSI 色码写文件前由 log.js 剥离）。
 *   请求 / 响应 / 错误三种事件共用同一格式，例如：
 *     GET /table/list
 *       baseURL     : http://localhost:5320/api
 *       timeout     : 15000ms
 *       responseType: json
 *       isForm      : false
 *       token       : eyJhbGciO…(172 chars)
 *       params      : {"pageNum":1,"pageSize":5}
 *       body        : -
 *       headers     : {"Authorization":"Bearer eyJhbGciOi…"}
 *     ✓ 200 GET /table/list        （绿色）
 *       body   : {"code":0,"data":{"rows":[…],"total":100}}
 *     ✗ 500 POST /login - timeout of 15000ms exceeded        （红色）
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
import { httpConfig } from '../config/http'

// 终端 ANSI 颜色：成功绿色 / 错误红色
// 仅作用于终端输出，写入日志文件前由 log.js 的 hooks.logMessage 剥离
const green = (text) => `\x1b[32m${text}\x1b[0m`
const red = (text) => `\x1b[31m${text}\x1b[0m`

const service = axios.create({
  baseURL: httpConfig.baseURL,
  timeout: httpConfig.timeout
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
  // isForm: 在主进程统一构造 URLSearchParams + 设置 Content-Type，
  // 渲染端只需要在 config 里写 isForm: true，普通对象照传。
  if (config.isForm && config.data) {
    const formData = new URLSearchParams(config.data)
    config.data = formData
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  } else {
    // JSON 请求
    config.headers['Content-Type'] = 'application/json'
  }
  // 终端日志（绿色）：方法 + URL + 关键配置 + 请求参数 + 请求体 + 请求头
  logger.info(green(`请求前参数: ${method.toUpperCase()} ${config.url}`))
  logger.info(green('baseURL     :'), readableBody(config.baseURL))
  logger.info(
    green('timeout     :'),
    `${config.timeout ?? `default(${httpConfig.timeout})`}ms`
  )
  logger.info(green('responseType:'), config.responseType || 'json')
  logger.info(green('isForm      :'), String(Boolean(config.isForm)))
  logger.info(green('token       :'), readableBody(config.token))
  logger.info(green('params      :'), readableBody(config.params))
  logger.info(green('body        :'), readableBody(config.data))
  logger.info(green('headers     :'), readableBody(config.headers))

  return config
})

// ── 响应拦截器 ──────────────────────────────────────
service.interceptors.response.use(
  (response) => {
    // 成功：绿色日志
    const okMethod = String(response.config.method || 'get').toUpperCase()
    logger.info(
      green(`响应成功 ✓: ${response.status} ${okMethod} ${response.config.url}`)
    )
    logger.info(green('body   :'), readableBody(response.data))

    return {
      code: response.status,
      data: response.data,
      message: '请求成功'
    }
  },
  (err) => {
    // 错误：红色日志
    const code = err.response?.status
    const url = err.config?.url
    const method = String(err.config?.method || 'get').toUpperCase()
    logger.error(
      red(
        `响应失败 ✗ ${code ?? 'ERR'} ${method} ${url ?? '-'} - ${err.message}`
      )
    )
    logger.error(red('body   :'), readableBody(err.response?.data))

    return {
      code,
      data: err.response?.data,
      message: error.message || '网络异常'
    }
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
