/**
 * 渲染进程请求模块（简单版）
 *
 * 只负责把请求参数透传给主进程 axios 代理，由主进程统一处理：
 *   - baseURL / token 注入 / 表单构造
 *   - 二进制响应回传（ArrayBuffer → Blob）
 *   - 错误归一化（status / code / data）
 *
 * 渲染端不做：loading / toast / 401 刷新 / 取消去重 —— 全部由调用方决定。
 *
 * @example
 * import request from '@/utils/request'
 *
 * const result = await request({ url: '/user/info', method: 'get' })
 * // result = { status, headers, dataType, data, mimeType?, filename? }
 */

import { toRaw } from 'vue'

function genRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * @param {Object} config 请求配置（普通对象，字段透传给主进程）
 * @param {string} config.url          请求路径
 * @param {string} [config.method]     请求方法，默认 'get'
 * @param {Object} [config.params]     URL 查询参数
 * @param {Object} [config.data]       请求体
 * @param {Object} [config.headers]    自定义请求头
 * @param {boolean} [config.isForm]    是否表单请求（主进程构造 URLSearchParams）
 * @param {string} [config.responseType] 响应类型（json / text / blob / arraybuffer）
 * @param {number} [config.timeout]    超时时间（ms）
 * @param {string} [config.token]      显式覆盖 Bearer token
 * @param {string} [config.requestId]  取消标识（不传时自动生成）
 * @returns {Promise<{status, headers, dataType, data, mimeType?, filename?}>}
 */
async function request(config = {}) {
  // Vue reactive() 返回的 Proxy 无法被 Electron IPC 结构化克隆，
  // toRaw 仅剥离 Proxy 包装，保留原始数据结构（Date / 嵌套对象等不变）。
  return window.request.send({
    url: config.url,
    method: (config.method || 'get').toLowerCase(),
    params: toRaw(config.params),
    data: toRaw(config.data),
    headers: toRaw(config.headers),
    isForm: !!config.isForm,
    responseType: config.responseType || 'json',
    timeout: config.timeout,
    token: config.token,
    requestId: config.requestId || genRequestId()
  })
}

export default request
