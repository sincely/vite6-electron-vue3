/**
 * 统一响应解析
 * 提取公共的业务码判断、401 处理、超时处理逻辑
 * Mock 模式和 IPC 模式共用
 */
import { useUserStore } from '@/store/modules/user'
import { showToast } from '@/utils/toast'
import { ResultEnum } from '@/enums/httpEnum'

/**
 * 处理 401 未授权
 * 清除用户状态 → 提示 → 通知主进程切换登录窗口
 */
function handleUnauthorized() {
  const userStore = useUserStore()
  userStore.resetUserState()
  showToast({ message: '登录已过期，请重新登录', type: 'warning' })
  window.ipcRenderer?.send('logout')
}

/**
 * 显示错误提示（受 config.showErrorMessage 控制）
 */
function showError(config, message) {
  if (config.showErrorMessage !== false) {
    showToast({ message: message || '请求失败', type: 'error' })
  }
}

/**
 * 解析业务响应体
 * 期望后端返回 { code, result, message } 格式
 *
 * @param {Object} data - 响应体
 * @param {Object} config - 请求配置
 * @returns {*} 成功返回 result 字段，失败抛错
 */
export function parseResponse(data, config) {
  // 二进制响应直接返回
  if (config.responseType === 'blob' || config.responseType === 'arraybuffer') {
    return data
  }

  const { code, result, message } = data

  if (code !== ResultEnum.SUCCESS && code !== 0) {
    showError(config, message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  }

  return result
}

/**
 * 处理 axios 异常（Mock 模式下的网络层错误）
 *
 * @param {Error} error - axios 抛出的错误
 * @param {Object} config - 请求配置
 * @returns {Promise} reject
 */
export function handleAxiosError(error, config = {}) {
  // 取消请求不报错
  if (error.__CANCEL__) {
    return Promise.reject(error)
  }

  // 401 未授权
  if (error.response?.status === ResultEnum.TOKEN_EXPIRED) {
    handleUnauthorized()
    return Promise.reject(error)
  }

  // 超时
  if (error.message?.includes('timeout')) {
    showError(config, '请求超时，请稍后重试')
    return Promise.reject(new Error('请求超时，请稍后重试'))
  }

  // 其他网络错误
  showError(config, error.message || '请求失败')
  return Promise.reject(error)
}

/**
 * 处理 IPC 返回的错误结果
 *
 * @param {Object} result - 主进程返回的 { success, error } 结构
 * @param {Object} config - 请求配置
 * @returns {Promise} reject
 */
export function handleIpcError(result, config) {
  const error = result.error || {}

  // 401 未授权
  if (error.status === ResultEnum.TOKEN_EXPIRED) {
    handleUnauthorized()
    return Promise.reject(new Error('登录已过期'))
  }

  // 超时
  if (error.type === 'timeout') {
    showError(config, error.message || '请求超时，请稍后重试')
    return Promise.reject(new Error(error.message))
  }

  // 其他错误
  showError(config, error.message || '请求失败')
  return Promise.reject(new Error(error.message || '请求失败'))
}
