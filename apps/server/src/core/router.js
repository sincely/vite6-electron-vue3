/**
 * 根路由装配
 *
 * 统一挂载所有业务模块路由，API 前缀固定为 `/api`。
 *
 * 挂载顺序有业务含义，不可随意调整：
 *   1. health       —— 健康探针最先匹配
 *   2. auth         —— 登录 / 用户信息 / 登出
 *   3. notification —— 用户侧消息（轻量写操作，不记录操作日志）
 *   4. ai           —— AI 网关（SSE 流式会话，不记录操作日志）
 *   5. operationLog —— 操作日志中间件（其后的写操作会被记录）
 *   6. route        —— 动态路由
 *   7. systemManage —— 后台管理控制台
 *   8. log          —— 操作日志 / 登录日志查询
 *   9. monitor      —— 系统监控
 */
import Router from '@koa/router'
import authRouter from '../modules/auth/authRouter.js'
import routeRouter from '../modules/route/routeRouter.js'
import systemManageRouter from './routers/systemManageRouter.js'
import operationLogRouter from '../modules/log/operationLog/operationLogRouter.js'
import loginLogRouter from '../modules/log/loginLog/loginLogRouter.js'
import monitorRouter from '../modules/monitor/monitorRouter.js'
import { notificationUserRouter } from '../modules/notification/notificationRouter.js'
import aiRouter from '../modules/ai/aiRouter.js'
import { operationLogMiddleware } from '../middleware/operationLog.js'
import { checkMySQL } from '../infrastructure/database/connection.js'
import { checkRedis } from '../infrastructure/redis/client.js'

const router = new Router({ prefix: '/api' })

/**
 * 健康检查端点
 *
 * GET /api/health        → 快速检查（仅返回进程状态）
 * GET /api/health?deep   → 深度检查（探测 MySQL + Redis）
 */
router.get('/health', async (ctx) => {
  const isDeep = ctx.query.deep !== undefined

  const base = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }
  }

  if (!isDeep) {
    ctx.body = base
    return
  }

  // 深度探针：并行检测 MySQL 和 Redis
  const [mysql, redis] = await Promise.all([checkMySQL(), checkRedis()])

  const allUp = mysql.status === 'up' && (redis.status === 'up' || redis.status === 'disabled')

  ctx.status = allUp ? 200 : 503
  ctx.body = {
    ...base,
    status: allUp ? 'healthy' : 'degraded',
    services: { mysql, redis }
  }
})

router.use(authRouter.routes(), authRouter.allowedMethods())

// 用户侧消息路由（挂载在操作日志中间件之前，已读等轻量写操作不记录操作日志）
router.use(notificationUserRouter.routes(), notificationUserRouter.allowedMethods())

// AI 网关路由（SSE 流式会话不记录操作日志）
router.use(aiRouter.routes(), aiRouter.allowedMethods())

// 应用操作日志中间件（记录所有写操作）
router.use(operationLogMiddleware)

router.use(routeRouter.routes(), routeRouter.allowedMethods())
router.use(systemManageRouter.routes(), systemManageRouter.allowedMethods())
router.use(operationLogRouter.routes(), operationLogRouter.allowedMethods())
router.use(loginLogRouter.routes(), loginLogRouter.allowedMethods())
router.use(monitorRouter.routes(), monitorRouter.allowedMethods())

export default router
