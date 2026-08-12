/**
 * IPC 模式 — 通过主进程发起真实 HTTP 请求
 * VITE_USE_MOCK≠true 时激活，彻底规避跨域
 *
 * 数据流：渲染进程 → IPC invoke → 主进程 axios → 后端 API
 */
import { useUserStore } from '@/store/modules/user'
import { startLoading, stopLoading, resetLoading } from './loading'
import { parseResponse, handleIpcError } from './response'

/**
 * 发起 IPC 请求
 *
 * @param {Object} config - 请求配置（url, method, params, data, headers 等）
 * @returns {Promise<*>} 业务数据（已解析的 result 字段）
 */
export async function ipcRequest(config) {
  startLoading(config)

  try {
    const userStore = useUserStore()

    // 通过 preload 暴露的 IPC 通道调用主进程
    const result = await window.httpRequest.request({
      url: config.url,
      method: config.method || 'get',
      params: config.params,
      data: config.data,
      headers: config.headers || {},
      token: userStore.token || '',
      responseType: config.responseType,
      timeout: config.timeout
    })

    stopLoading(config)

    if (result.success) {
      return parseResponse(result.data, config)
    }

    return handleIpcError(result, config)
  } catch (error) {
    resetLoading()
    throw error
  }
}
