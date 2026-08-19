/**
 * 模拟登录服务 — 生产环境无后端时启用
 * 仅在 VITE_MOCK_LOGIN=true 时激活，处理鉴权链路的 4 个接口。
 * 数据形态对齐 apps/backend Nitro mock 返回的"内层数据"，
 * 由 parseResponse 在调用方统一提取；这里直接返回业务字段。
 */
import { startLoading, stopLoading } from './loading'

const MOCK_ADMIN = {
  id: 0,
  realName: '模拟管理员',
  avatar: '',
  username: 'admin',
  phone: '13800138000',
  roles: ['admin'],
  permissions: ['*:*:*']
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export default async function simulatedLoginService(config) {
  startLoading(config)
  try {
    await delay(250)

    switch (config.url) {
      case '/auth/login':
        return {
          ...MOCK_ADMIN,
          accessToken: `simulated-token-${Date.now()}`
        }

      case '/user/info':
        return { ...MOCK_ADMIN }

      case '/auth/logout':
        // 与 Nitro mock 一致：useResponseSuccess('') 经 parseResponse 解析后为 ''
        return ''

      case '/auth/refresh':
        return `simulated-token-${Date.now()}`

      default:
        throw new Error(`[simulatedLogin] 未实现: ${config.url}`)
    }
  } finally {
    stopLoading(config)
  }
}
