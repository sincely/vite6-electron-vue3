/**
 * Mock 模式 — axios 请求服务
 * 仅在 VITE_USE_MOCK=true 时激活，由 vite-plugin-mock 拦截请求
 */
import axios from 'axios'
import { useUserStore } from '@/store/modules/user'
import { addRequest, removeRequest } from './cancel'
import { startLoading, stopLoading } from './loading'
import { parseResponse, handleAxiosError } from './response'

// 根据环境设置 baseURL
const baseURL =
  process.env.NODE_ENV === 'production'
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:3200'

const service = axios.create({
  baseURL,
  timeout: 5000
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

// ── 响应拦截器 ──────────────────────────────────────
service.interceptors.response.use(
  (response) => {
    const { config } = response

    removeRequest(config)
    stopLoading(config)

    return parseResponse(response.data, config)
  },
  (error) => {
    const config = error.config || {}

    removeRequest(config)
    stopLoading(config)

    return handleAxiosError(error, config)
  }
)

export default service
