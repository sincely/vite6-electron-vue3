/**
 * 主进程 HTTP 代理配置
 *
 * baseURL：优先取构建时注入的 VITE_SERVER_URL（vite.config 通过 define
 * 注入到主进程 process.env），缺省回退本地 mock 服务（apps/backend）。
 * 各环境实际取值见 .env.development / .env.test / .env.production。
 */
export const httpConfig = {
  // 后端接口基础地址
  baseURL: process.env.VITE_SERVER_URL || 'http://localhost:5320/api',
  // 默认请求超时（ms）
  timeout: 15000
}
