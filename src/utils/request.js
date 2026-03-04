// 封装 axios 需要具备以下几个功能：

// 请求超时时间设置。
// 根据项目环境设置请求路径。
// 请求拦截器：自动添加 Token。
// 响应拦截器：处理响应状态码或数据格式化。
// 请求队列实现 loading 效果。
// 取消请求功能：页面切换时取消未完成的请求
// 解决 相同url和相同方式的请求取消掉，使用md5生成唯一key,存储在Map中
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import md5 from 'md5'

// 设置取消请求的 token
const { CancelToken } = axios
const pendingRequests = new Map() // 用于存储请求队列

// 生成请求 MD5 值的函数
const generateRequestKey = (config) => {
  const { method, url, params, data } = config
  const requestKey = `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(data)}`
  return md5(requestKey)
}

// 添加请求到队列
const addRequestToQueue = (config) => {
  const requestKey = generateRequestKey(config)
  config.cancelToken = new CancelToken((cancel) => {
    // 如果请求队列中没有该请求，则添加
    if (!pendingRequests.has(requestKey)) {
      pendingRequests.set(requestKey, cancel)
    }
  })

  console.log('pendingRequests', pendingRequests)
}

// 移除队列中的请求
const removeRequestFromQueue = (config) => {
  const requestKey = generateRequestKey(config)
  // 如果请求队列中有该请求，则取消
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey)
    cancel(requestKey)
    pendingRequests.delete(requestKey)
  }
}

// 清空请求队列（用于页面切换时取消请求）
export const clearRequestQueue = () => {
  pendingRequests.forEach((cancel, key) => {
    cancel(key)
  })
  pendingRequests.clear()
}

// 根据环境变量设置基础URL
const baseURL = process.env.NODE_ENV === 'production' ? import.meta.env.VITE_BASE_URL : import.meta.env.VITE_BASE_URL

// 创建 axios 实例
const service = axios.create({
  baseURL, // 根据环境变量设置基础URL
  timeout: 5000 // 超时时间
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 启动进度条
    NProgress.start()
    // 添加请求到队列，防止重复请求
    removeRequestFromQueue(config)
    addRequestToQueue(config)
    return config
  },
  (error) => {
    // 关闭进度条
    NProgress.done()
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 关闭进度条
    NProgress.done()
    // 请求成功后移除队列中的该请求
    removeRequestFromQueue(response.config)
    // 处理文件流blob类型的响应
    if (response.data instanceof Blob) return response.data
    const res = response.data
    // 这里使用的是自定义 Code 码来做统一的错误处理
    return res // 返回处理过的数据
  },
  (error) => {
    // 关闭进度条
    NProgress.done()
    // 请求失败时清除队列中的该请求
    removeRequestFromQueue(error.config || {})
    return Promise.reject(error)
  }
)

export default service
