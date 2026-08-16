/**
 * axios 请求服务（浏览器端）
 * 通过 VITE_API_BASE_URL 指定真实后端地址；未指定时回退到 Nitro mock 服务。
 */
import axios from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ResultEnum } from '@/enums/httpEnum'
import { addRequest, removeRequest } from './cancel'
import { startLoading, stopLoading } from './loading'
import { parseResponse, handleAxiosError } from './response'

// 后端地址：优先 VITE_API_BASE_URL（真实后端），其次 VITE_MOCK_SERVER_URL，最后默认 Nitro mock 服务
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_MOCK_SERVER_URL ||
  '/api'

const service = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true // 携带 httpOnly 的 refresh token cookie
})

// ── 请求拦截器 ──────────────────────────────────────
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    startLoading(config)
    removeRequest(config)
    addRequest(config)

    // 注入 token
    if (userStore.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${userStore.token}`
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── 401 无感刷新 ────────────────────────────────────
// 并发 401 共享同一次刷新请求
let refreshPromise = null

// 登录 / 刷新接口本身不参与刷新重试
function isAuthRequest(config = {}) {
  return config._isRefresh || /\/auth\/(login|refresh)$/.test(config.url || '')
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = service
      .post('/auth/refresh', null, {
        showLoading: false,
        showErrorMessage: false,
        _isRefresh: true
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

// ── 响应拦截器 ──────────────────────────────────────
service.interceptors.response.use(
  (response) => {
    const { config } = response

    removeRequest(config)
    stopLoading(config)

    return parseResponse(response.data, config)
  },
  async (error) => {
    const config = error.config || {}

    // 401 时先尝试刷新 token 并重试一次原请求
    if (
      error.response?.status === ResultEnum.TOKEN_EXPIRED &&
      !isAuthRequest(config) &&
      !config._isRetryWithRefresh
    ) {
      try {
        const accessToken = await refreshAccessToken()
        const userStore = useUserStore()

        userStore.setToken(accessToken)
        config._isRetryWithRefresh = true
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`
        }
        return service(config)
      } catch {
        // 刷新失败，走下方统一的未授权处理
      }
    }

    removeRequest(config)
    stopLoading(config)

    return handleAxiosError(error, config)
  }
)

export default service
