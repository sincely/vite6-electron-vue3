/**
 * 统一请求入口
 *
 * 根据 VITE_USE_MOCK / VITE_MOCK_LOGIN 环境变量自动选择请求通道：
 *   - 模拟登录 (VITE_MOCK_LOGIN=true) → simulatedLoginService（仅处理鉴权 4 个接口，跳过任何后端）
 *   - Mock 模式 (VITE_USE_MOCK=true)  → 渲染进程 axios → Nitro mock 服务（src/backend）
 *   - 真实模式 (fallback)             → IPC → 主进程 axios → 后端 API
 *
 * 三种模式对外接口完全一致，API 层无需关心底层差异。
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
import simulatedLoginService from './request/simulatedLoginService'
import { ipcRequest } from './request/ipcService'
import { clearAllRequests } from './request/cancel'

// 是否走模拟登录（生产环境无后端时开启，优先级最高）
const useMockLogin = import.meta.env.VITE_MOCK_LOGIN === 'true'
// 是否使用 Mock 模式
const useMock = import.meta.env.VITE_USE_MOCK === 'true'

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
  if (useMockLogin) {
    return simulatedLoginService(config)
  }
  if (useMock) {
    return mockService(config)
  }
  return ipcRequest(config)
}

export { clearAllRequests }
export default request
