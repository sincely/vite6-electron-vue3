/**
 * 统一响应解析
 * 提取公共的业务码判断、401 处理、超时处理逻辑
 * 浏览器端通过 axios 请求，仅保留 axios 错误处理
 */
import { useUserStore } from '@/store/modules/user'
import { showToast } from '@/utils/toast'
import { ResultEnum } from '@/enums/httpEnum'

/**
 * 处理 401 未授权
 * 清除用户状态 → 提示 → 触发路由回到登录页
 */
function handleUnauthorized() {
  const userStore = useUserStore()
  userStore.resetUserState()
  showToast({ message: '登录已过期，请重新登录', type: 'warning' })
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
 * 兼容两种后端格式：
 *   - 旧：{ code, result, message }
 *   - 新（Nitro mock 服务）：{ code, data, message }
 *
 * @param {Object} data - 响应体
 * @param {Object} config - 请求配置
 * @returns {*} 成功返回业务数据（result ?? data），失败抛错
 */
export function parseResponse(data, config) {
  // 二进制响应直接返回
  if (config.responseType === 'blob' || config.responseType === 'arraybuffer') {
    return data
  }

  const { code, result, data: bodyData, message } = data

  if (code !== ResultEnum.SUCCESS && code !== 0) {
    showError(config, message || '请求失败')
    return Promise.reject(new Error(message || '请求失败'))
  }

  return result ?? bodyData
}

/**
 * 处理 axios 异常
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

  // 其他网络错误（优先展示后端返回的业务错误信息）
  const serverMessage = error.response?.data?.message
  showError(config, serverMessage || error.message || '请求失败')
  return Promise.reject(error)
}
