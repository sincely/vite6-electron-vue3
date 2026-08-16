/**
 * 统一请求入口（浏览器端）
 *
 * 浏览器环境无 Electron IPC 通道，统一走 axios → 后端 API；
 * 通过 VITE_API_BASE_URL 指定真实接口地址，未指定时回退到 Nitro mock 服务。
 *
 * @example
 * import request from '@/utils/request'
 *
 * // GET
 * request({ url: '/user/info', method: 'get' })
 *
 * // POST
 * request({ url: '/auth/login', method: 'post', data: { username, password } })
 *
 * // 自定义配置
 * request({
 *   url: '/export',
 *   method: 'get',
 *   responseType: 'blob',
 *   showLoading: false,       // 关闭全局 loading
 *   showErrorMessage: false,  // 关闭自动错误提示
 *   loadingTarget: 'table',   // 局部 loading 标识
 * })
 */
import mockService from './request/axiosService'
import { clearAllRequests } from './request/cancel'

/**
 * 统一请求函数
 *
 * @param {Object} config - 请求配置
 * @param {string} config.url - 请求路径
 * @param {string} [config.method='get'] - 请求方法
 * @param {Object} [config.params] - URL 查询参数
 * @param {Object} [config.data] - 请求体
 * @param {Object} [config.headers] - 自定义请求头
 * @param {string} [config.responseType] - 响应类型（blob / arraybuffer）
 * @param {number} [config.timeout] - 超时时间（ms）
 * @param {boolean} [config.showLoading=true] - 是否显示全局 loading
 * @param {string}  [config.loadingTarget] - 局部 loading 标识
 * @param {boolean} [config.showErrorMessage=true] - 是否自动弹出错误提示
 * @param {boolean} [config.cancelRequest=true] - 是否启用请求去重取消
 * @returns {Promise<*>} 业务数据
 */
function request(config) {
  return mockService(config)
}

export { clearAllRequests }
export default request
