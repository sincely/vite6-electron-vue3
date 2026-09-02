/**
 * 统一请求入口（浏览器端）
 *
 * 与 Electron 版（渲染进程 → IPC → 主进程 axios 代理）对应，
 * Web 版没有主进程，直接在本模块用 axios 承担真实 HTTP 调用：
 *   - baseURL / token 注入 / 表单构造
 *   - 二进制响应透传（blob / arraybuffer）
 *   - 结果归一化为 { code, data, message }
 *
 * 返回 { code, data }，其中 data 为后端响应体
 * （约定为 { code, data, error, message }）—— 由调用方决定如何剥层使用。
 *
 * token 注入：默认从 useUserStore().token 自动注入；调用方可在 config.token 显式覆盖。
 * 本模块不做：loading / toast / 401 刷新 / 取消去重 —— 由调用方决定。
 *
 * @example
 * import request from '@/utils/request'
 * const result = await request({ url: '/user/info', method: 'get' })
 * // result = { code, data: { code, data, error, message }, message }
 */
import axios from 'axios'
import { useUserStore } from '@/store/modules/user'

// 后端地址：优先 VITE_API_BASE_URL（真实后端），其次 VITE_MOCK_SERVER_URL，最后默认 Nitro mock 服务
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_MOCK_SERVER_URL ||
  '/api'

const DEFAULT_TIMEOUT = 15000

const service = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true // 携带 httpOnly 的 refresh token cookie
})

// ── 请求拦截器 ──────────────────────────────────────
service.interceptors.request.use((config) => {
  config.headers = config.headers || {}

  // 调用方通过 config.token 显式传入 token 时，自动注入 Bearer 头
  if (config.token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${config.token}`
  }

  // isForm: 统一构造 URLSearchParams + 设置 Content-Type，
  // 调用方只需要在 config 里写 isForm: true，普通对象照传。
  if (config.isForm && config.data) {
    config.data = new URLSearchParams(config.data)
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  } else {
    // JSON 请求
    config.headers['Content-Type'] = 'application/json;charset=UTF-8'
  }
  return config
})

// ── 响应拦截器 ──────────────────────────────────────
// 成功：归一化为 { code: HTTP 状态, data: 响应体, message }
// 失败：错误对象上挂载归一化 payload，由调用方统一 try/catch
service.interceptors.response.use(
  (response) => ({
    code: response.status,
    data: response.data,
    message: '请求成功'
  }),
  (err) => {
    const payload = {
      code: err.response?.status,
      data: err.response?.data,
      message: err.response?.data?.message || err.message || '网络异常'
    }
    return Promise.reject(Object.assign(err, { payload }))
  }
)

/**
 * @param {Object} config 请求配置
 * @param {string} config.url          请求路径
 * @param {string} [config.method]     请求方法，默认 'get'
 * @param {Object} [config.params]     URL 查询参数（始终序列化为查询串）
 * @param {Object} [config.data]       请求体
 * @param {Object} [config.headers]    自定义请求头
 * @param {boolean} [config.isForm]    是否表单请求（构造 URLSearchParams）
 * @param {string} [config.responseType] 响应类型（json / text / blob / arraybuffer）
 * @param {number} [config.timeout]    超时时间（ms）
 * @param {string} [config.token]      显式覆盖 Bearer token（默认读 userStore.token）
 * @returns {Promise<{code, data, message}>}
 */
async function request(config = {}) {
  const { url, method, params, data, headers, isForm, responseType, timeout } =
    config

  if (!url) {
    throw new Error('[request] url is required')
  }

  const userStore = useUserStore()
  const token = config.token !== undefined ? config.token : userStore.token

  return service.request({
    url,
    method: String(method || 'get').toLowerCase(),
    params,
    data,
    headers,
    isForm,
    responseType: responseType || 'json',
    timeout,
    token // 透传给请求拦截器，自动注入 Authorization: Bearer xxx
  })
}

export default request
