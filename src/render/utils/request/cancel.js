/**
 * 请求取消队列
 * 通过 MD5 哈希生成请求标识，防止同一时间段内重复请求
 * 仅在 Mock 模式（axios）下使用
 */
import axios from 'axios'
import md5 from 'md5'

const { CancelToken } = axios
const pendingRequests = new Map()

/**
 * 生成请求唯一标识
 * 包含 method、url、params、data 和时间戳
 */
function generateKey(config) {
  const { method, url, params, data } = config
  const timestamp = Date.now()
  return md5(
    `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}:${timestamp}`
  )
}

/**
 * 将请求加入取消队列
 * config.cancelRequest = false 可跳过此逻辑
 */
export function addRequest(config) {
  if (config.cancelRequest === false) return

  const key = generateKey(config)
  config.cancelToken = new CancelToken((cancel) => {
    if (!pendingRequests.has(key)) {
      pendingRequests.set(key, cancel)
    }
  })
}

/**
 * 从取消队列中移除请求（完成或失败时调用）
 */
export function removeRequest(config) {
  if (config.cancelRequest === false) return

  const key = generateKey(config)
  if (pendingRequests.has(key)) {
    pendingRequests.get(key)(key)
    pendingRequests.delete(key)
  }
}

/**
 * 清空所有待取消请求（页面切换时调用）
 */
export function clearAllRequests() {
  pendingRequests.forEach((cancel, key) => cancel(key))
  pendingRequests.clear()
}

/**
 * 判断是否为被取消的请求
 */
export function isCancel(error) {
  return axios.isCancel(error)
}
