/**
 * Koa 应用工厂
 *
 * 只负责「装配」：按分层顺序注册中间件与路由，不负责监听端口与进程生命周期
 * （后者见 `core/bootstrap.js`）。
 *
 * 中间件分层（自外向内洋葱模型）：
 *   A. 基础设施层 —— 异常兜底、请求 ID、访问日志
 *   B. 安全层     —— 安全响应头、跨域、限流
 *   C. 请求处理层 —— 体解析、会话、静态资源
 *   D. 业务层     —— API 路由
 */
import Koa from 'koa'
import KoaStatic from 'koa-static'
import cors from 'koa2-cors'
import session from 'koa-session'
import KoaBodyParser from '@koa/bodyparser'

import { staticDir } from '../config/server.js'
import logger from '../config/logger.js'
import corsConfig from '../config/cors.js'
import { bodyParserConfig } from '../config/koaBodyConfig.js'
import { redisEnabled } from '../config/database.js'

import errorCatch from '../middleware/errorCatch.js'
import requestId from '../middleware/requestId.js'
import accessLog from '../middleware/accessLog.js'
import errorHandler from '../middleware/errorHandler.js'
import rewriteUrl from '../middleware/rewriteUrl.js'
import compress from '../middleware/compress.js'
import { securityHeaders } from '../middleware/securityHeaders.js'
import { rateLimiter } from '../middleware/rateLimiter.js'
import { redisRateLimiter } from '../middleware/rateLimiterRedis.js'

import Routers from './router.js'

import { getRedisClient } from '../infrastructure/redis/client.js'
import { createRedisSessionStore } from '../infrastructure/session/redis-store.js'

/**
 * 构建 Session 配置
 * Redis 可用时使用 Redis Store，否则回退到 Cookie 存储。
 * @returns {import('koa-session').SessionOptions}
 */
const buildSessionConfig = () => {
  const sessionConfig = {
    key: 'koa.sess',
    maxAge: 86400000, // 1 天
    httpOnly: true,
    signed: true,
    renew: true
  }

  if (redisEnabled) {
    const redis = getRedisClient()
    if (redis) {
      sessionConfig.store = createRedisSessionStore(redis)
      logger.info('Session 使用 Redis 存储')
    }
  } else {
    logger.info('Session 使用 Cookie 存储（Redis 未启用）')
  }

  return sessionConfig
}

/**
 * 创建并装配 Koa 应用实例
 * @returns {import('koa')}
 */
export const createApp = () => {
  const app = new Koa()

  // 信任反向代理（Vite dev proxy / Nginx），使 ctx.ip 读取 X-Forwarded-For
  app.proxy = true
  app.keys = [process.env.SESSION_SECRET || process.env.JWT_SECRET || 'koa-app-template-session-secret']

  // ========== 阶段 A：基础设施层 ==========
  // 1. 全局异常捕获中间件 - 使用 AsyncLocalStorage 绑定请求上下文（洋葱模型最外层）
  app.use(errorCatch)

  // 2. 应用级错误监听 - 统一处理所有未捕获异常日志
  app.on('error', errorHandler())

  // 3. 请求 ID 中间件（确保后续所有中间件都能读取到 requestId）
  app.use(requestId)

  // 4. HTTP 请求日志中间件
  app.use(accessLog)

  // ========== 阶段 B：安全层 ==========
  // 5. 安全响应头（HSTS、CSP、X-Frame-Options 等）
  app.use(securityHeaders)

  // 6. 跨域处理
  app.use(cors(corsConfig))

  // 7. 限流（在请求体解析前执行，快速拒绝超限请求）
  app.use(redisEnabled ? redisRateLimiter : rateLimiter)

  // ========== 阶段 C：请求处理层 ==========
  // 8. 请求体解析（JSON、表单、文本、XML）
  app.use(KoaBodyParser(bodyParserConfig))

  // 9. 会话管理（Redis Store 或 Cookie-based）
  app.use(session(buildSessionConfig(), app))

  // 10. 为静态资源请求重写 URL（去除 /public 前缀）
  app.use(rewriteUrl)

  // 11. 响应压缩（gzip/deflate）
  app.use(compress)

  // 12. 静态资源服务
  app.use(KoaStatic(staticDir))

  // 13. Session 回退传播（仅当 Session 有值且 JWT 认证尚未设置 ctx.state.user 时生效）
  // 注意：实际认证由 authenticate 中间件统一处理（JWT 优先 → Session 回退）
  app.use(async (ctx, next) => {
    if (!ctx.state.user && ctx.session?.user) {
      ctx.state.user = { userId: ctx.session.user.userId }
    }
    await next()
  })

  // ========== 阶段 D：业务层 ==========
  // 14. API 路由
  app.use(Routers.routes()).use(Routers.allowedMethods())

  // 15. Swagger API 文档
  // registerSwagger(app)

  return app
}

export default createApp
