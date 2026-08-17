import axios from 'axios'
import logger from '../log'

// 根据环境变量设置基础URL（开发环境使用后端服务器地址，生产环境使用 API 基础地址）
const baseURL =
  process.env.VITE_SERVER_URL || process.env.VITE_API_BASE_URL || ''

// 创建主进程 axios 实例
const service = axios.create({
  baseURL,
  timeout: 5000
})

/**
 * 执行 HTTP 请求
 * 由 IPC 处理器调用，接收渲染进程传来的配置
 *
 * @param {Object} config - 请求配置
 * @param {string} config.url - 请求路径
 * @param {string} config.method - 请求方法
 * @param {Object} [config.params] - URL 查询参数
 * @param {Object} [config.data] - 请求体数据
 * @param {Object} [config.headers] - 自定义请求头
 * @param {string} [config.token] - Bearer token（由渲染进程传入）
 * @param {string} [config.responseType] - 响应类型（blob/arraybuffer）
 * @param {number} [config.timeout] - 超时时间
 * @returns {Promise<Object>} { success, data, error }
 */
export async function mainRequest(config) {
  try {
    const requestConfig = {
      url: config.url,
      method: config.method || 'get',
      params: config.params,
      data: config.data,
      timeout: config.timeout,
      responseType: config.responseType
    }

    // 注入 token
    if (config.token) {
      requestConfig.headers = {
        ...config.headers,
        Authorization: `Bearer ${config.token}`
      }
    } else {
      requestConfig.headers = config.headers || {}
    }

    const response = await service(requestConfig)

    // 处理二进制数据（直接返回 buffer）
    if (
      requestConfig.responseType === 'blob' ||
      requestConfig.responseType === 'arraybuffer'
    ) {
      return {
        success: true,
        data: response.data
      }
    }

    // 返回完整的响应数据，由渲染进程统一处理业务逻辑
    return {
      success: true,
      data: response.data,
      status: response.status
    }
  } catch (error) {
    logger.warn('[http] 请求失败：', error.message, config.url)

    // 区分不同类型的错误，便于渲染进程做针对性处理
    if (error.response) {
      // 服务端返回了错误状态码
      return {
        success: false,
        error: {
          type: 'http',
          status: error.response.status,
          data: error.response.data,
          message: error.response.statusText || '请求失败'
        }
      }
    } else if (error.message.includes('timeout')) {
      return {
        success: false,
        error: {
          type: 'timeout',
          message: '请求超时，请稍后重试'
        }
      }
    } else {
      // 网络错误等
      return {
        success: false,
        error: {
          type: 'network',
          message: error.message || '网络请求失败'
        }
      }
    }
  }
}
