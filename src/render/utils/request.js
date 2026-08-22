/**
 * 渲染进程统一请求模块（IPC 版）
 *
 * 数据流：
 *   渲染进程 → IPC (http:request) → 主进程 axios → 后端 / Nitro mock
 *
 * 职责划分：
 *   - 渲染进程：只负责交互与参数传递（普通对象、loading / toast / 401 刷新策略）
 *   - 主进程：负责真实 HTTP、表单构造、token 注入、二进制响应回传
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
 * // 表单：data 传普通对象，isForm: true 由主进程构造 URLSearchParams
 * request({ url: '/auth/login', method: 'post', data: { ... }, isForm: true })
 *
 * // 自定义配置
 * request({
 *   url: '/export',
 *   method: 'get',
 *   responseType: 'blob',
 *   showLoading: false,
 *   showErrorMessage: false,
 *   loadingTarget: 'table'
 * })
 */
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { showToast } from '@/utils/toast'
import { ResultEnum } from '@/enums/httpEnum'

// ── 请求去重 / 取消 ───────────────────────────────
// requestId → true（占位，真实取消通过 window.request.cancel）
const pendingRequests = new Map()

function genRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function addPending(requestId) {
  pendingRequests.set(requestId, true)
}

function removePending(requestId) {
  pendingRequests.delete(requestId)
}

// 取消所有 pending 请求（页面切换时调用）
export function clearAllRequests() {
  if (!window.request?.cancel) {
    pendingRequests.clear()
    return
  }
  pendingRequests.forEach((_v, requestId) => {
    try {
      window.request.cancel(requestId)
    } catch {
      /* ignore */
    }
  })
  pendingRequests.clear()
}

// ── loading 状态 ───────────────────────────────────
function startLoading(config) {
  const appStore = useAppStore()
  if (config.showLoading !== false) {
    appStore.setLoading(true)
  }
  if (config.loadingTarget) {
    appStore.addLoadingTarget(config.loadingTarget)
  }
}

function stopLoading(config) {
  const appStore = useAppStore()
  if (config.showLoading !== false) {
    appStore.setLoading(false)
  }
  if (config.loadingTarget) {
    appStore.removeLoadingTarget(config.loadingTarget)
  }
}

// ── 401 无感刷新 ───────────────────────────────────
let refreshPromise = null

function isAuthPath(url = '') {
  return /\/auth\/(login|refresh)$/.test(url)
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = request({
      url: '/auth/refresh',
      method: 'post',
      showLoading: false,
      showErrorMessage: false,
      _isRefresh: true
    }).finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

// ── 错误提示 ───────────────────────────────────────
function handleUnauthorized() {
  const userStore = useUserStore()
  userStore.resetUserState()
  showToast({ message: '登录已过期，请重新登录', type: 'warning' })
  window.ipcRenderer?.send('logout')
}

function showError(config, message) {
  if (config.showErrorMessage !== false) {
    showToast({ message: message || '请求失败', type: 'error' })
  }
}

// ── 二进制响应还原 ─────────────────────────────────
function bufferToBlob(buffer, mimeType) {
  return new Blob([buffer], {
    type: mimeType || 'application/octet-stream'
  })
}

// ── 响应解析 ───────────────────────────────────────
function parseResponse(result, config) {
  const { dataType, data, mimeType } = result

  if (dataType === 'buffer') {
    return bufferToBlob(data, mimeType)
  }

  // 业务包：{ code, result, data, message }
  const body = data
  if (body && typeof body === 'object' && 'code' in body) {
    const { code, result: r, data: d, message } = body
    if (code !== ResultEnum.SUCCESS && code !== 0) {
      showError(config, message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
    return r ?? d
  }
  return body
}

/**
 * 统一请求函数
 *
 * @param {Object} config - 请求配置（普通对象，可安全 IPC 传输）
 * @param {string} config.url - 请求路径
 * @param {string} [config.method='get'] - 请求方法
 * @param {Object} [config.params] - URL 查询参数
 * @param {Object} [config.data] - 请求体
 * @param {Object} [config.headers] - 自定义请求头
 * @param {boolean} [config.isForm=false] - 表单请求（application/x-www-form-urlencoded）
 * @param {string} [config.responseType] - 响应类型（json / text / blob / arraybuffer）
 * @param {number} [config.timeout] - 超时时间（ms）
 * @param {string} [config.token] - 显式覆盖 Bearer token（不传时自动从 userStore 读取）
 * @param {string} [config.requestId] - 取消标识（不传时自动生成）
 * @param {boolean} [config.showLoading=true] - 是否显示全局 loading
 * @param {string} [config.loadingTarget] - 局部 loading 标识
 * @param {boolean} [config.showErrorMessage=true] - 是否自动弹出错误提示
 * @param {boolean} [config.cancelRequest=true] - 是否启用请求去重 / 取消
 * @returns {Promise<*>} 业务数据
 */
async function request(config) {
  if (!window.request?.send) {
    const e = new Error('[request] window.request.send is not available')
    e.code = 'IPC_MISSING'
    showError(config, '渲染进程 IPC 通道未就绪')
    return Promise.reject(e)
  }

  const userStore = useUserStore()
  const requestId = config.requestId || genRequestId()

  // 剔除渲染进程私有字段，避免 IPC 传输多余数据
  const {
    showLoading,
    loadingTarget,
    showErrorMessage,
    cancelRequest,
    token,
    ...rest
  } = config

  const payload = {
    url: rest.url,
    method: rest.method || 'get',
    params: rest.params,
    data: rest.data,
    headers: rest.headers,
    isForm: !!rest.isForm,
    responseType: rest.responseType || 'json',
    timeout: rest.timeout,
    // 显式传 token 时用显式值，否则自动从 userStore 读取
    token: token ?? userStore.token,
    requestId
  }

  if (cancelRequest !== false) {
    addPending(requestId)
  }
  startLoading({ showLoading, loadingTarget })

  try {
    const result = await window.request.send(payload)

    if (cancelRequest !== false) {
      removePending(requestId)
    }
    stopLoading({ showLoading, loadingTarget })

    return parseResponse(result, { ...config, showErrorMessage })
  } catch (err) {
    if (cancelRequest !== false) {
      removePending(requestId)
    }
    stopLoading({ showLoading, loadingTarget })

    // 取消（AbortController 触发）
    if (err.code === 'CANCELED' || err.message === 'Request canceled') {
      const e = new Error('canceled')
      e.__CANCEL__ = true
      return Promise.reject(e)
    }

    // 401 无感刷新（登录 / 刷新接口本身不走刷新逻辑，避免死循环）
    if (
      err.status === ResultEnum.TOKEN_EXPIRED &&
      !isAuthPath(rest.url) &&
      !config._isRetryWithRefresh
    ) {
      try {
        const newToken = await refreshAccessToken()
        userStore.setToken(newToken)
        // 复用原始 config，仅覆盖 token 与重试标记
        return request({
          ...config,
          token: newToken,
          _isRetryWithRefresh: true
        })
      } catch {
        // 刷新失败，继续走下方统一错误处理
      }
    }

    // 401（刷新失败或非可刷新场景）：强制登出
    if (err.status === ResultEnum.TOKEN_EXPIRED) {
      handleUnauthorized()
      return Promise.reject(err)
    }

    const message = err.data?.message || err.message || '请求失败'
    showError({ showErrorMessage }, message)
    return Promise.reject(new Error(message))
  }
}

export default request
