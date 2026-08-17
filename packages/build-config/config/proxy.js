import { loadEnv } from 'vite'

const viteEnv = loadEnv('development', process.cwd())
const serverUrl = viteEnv.VITE_SERVER_URL
console.log('serverUrl:', serverUrl)
const proxyServer = {
  // 拦截以/dev-api开头的请求
  '/dev-api': {
    target: serverUrl, // 转发到环境变量指定的后端地址
    changeOrigin: true, // 修改请求头中的Origin为目标地址
    rewrite: (path) => path.replace(/^\/dev-api/, '') // 移除请求路径中的/dev-api前缀
  }
}

export { proxyServer }
