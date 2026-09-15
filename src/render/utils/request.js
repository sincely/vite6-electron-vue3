/**
 * 渲染进程请求模块
 *
 * 只负责把请求参数透传给主进程 axios 代理；并在此处统一拆业务信封，
 * 主进程代理只做通用 HTTP 转发，返回 { code: <HTTP status>, data: <后端响应体>, message }。
 * 后端约定的业务信封 { code, data, error, message } 由本模块识别：
 *   - 业务成功（code === 0）：resolve 业务本体（envelope.data）
 *   - 业务失败（code !== 0）：reject 一个 Error（带 message）
 *   - HTTP 失败 / 超时：reject 主进程抛出的错误
 */

import { toRaw } from 'vue'
import { useUserStore } from '@/store/modules/user'

function genRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 业务信封拆层：
 *   - 识别带 code 字段的对象视为业务信封
 *   - code === 0 → 返回业务本体（envelope.data）
 *   - 其他 → 抛带 message 的 Error，并把 businessCode / businessData 挂到 err 上便于调用方诊断
 *   - 非业务信封（后端直返非标准结构 / 第三方接口）原样透传
 */
function unwrapBusinessEnvelope(body) {
  if (body && typeof body === 'object' && 'code' in body) {
    if (body.code === 200) {
      return body.data ?? null
    } else {
      const err = new Error(body.message || '业务请求失败')
      err.businessCode = body.code
      err.businessData = body.data
      throw err
    }
  }
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
 * @param {string} [config.token]      显式覆盖 Bearer token（默认读 userStore.token）
 * @param {string} [config.requestId]  取消标识（不传时自动生成）
 * @returns {Promise<any>} 业务本体（envelope 已剥层）
 */
async function request(config = {}) {
  const userStore = useUserStore()
  // Vue reactive() 返回的 Proxy 无法被 Electron IPC 结构化克隆，
  // toRaw 仅剥离 Proxy 包装，保留原始数据结构（Date / 嵌套对象等不变）。
  const result = await window.request.send({
    url: config.url,
    method: (config.method || 'get').toLowerCase(),
    params: toRaw(config.params),
    data: toRaw(config.data),
    headers: toRaw(config.headers),
    isForm: !!config.isForm,
    responseType: config.responseType || 'json',
    timeout: config.timeout,
    token: config.token !== undefined ? config.token : userStore.token,
    requestId: config.requestId || genRequestId()
  })
  return unwrapBusinessEnvelope(result?.data)
}

export default request
