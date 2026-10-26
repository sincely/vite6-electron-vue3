/**
 * 服务启动与优雅关闭
 *
 * 负责进程级生命周期：外部依赖连通性校验 → 监听端口 → 收到信号后释放资源。
 * 与 `core/createApp.js` 分离，保证「装配」与「启动」职责单一。
 */
import logger from '../config/logger.js'
import { Port } from '../config/server.js'
import { redisEnabled } from '../config/database.js'
import { verifyMySQLConnection, closeMySQL } from '../infrastructure/database/connection.js'
import { connectRedis, closeRedis } from '../infrastructure/redis/client.js'

/**
 * 启动 HTTP 服务
 * @param {import('koa')} app
 */
export const startServer = async (app) => {
  // ── 启动前：验证数据库连接 ──
  logger.info('正在验证数据库连接...')

  // MySQL：必须成功，否则进程退出
  try {
    await verifyMySQLConnection()
  } catch (err) {
    logger.fatal({ err: { message: err.message } }, 'MySQL 连接失败，服务无法启动')
    process.exit(1)
  }

  // Redis：根据配置决定是否启用，失败时降级（不阻塞启动）
  if (redisEnabled) {
    try {
      await connectRedis()
    } catch (err) {
      logger.warn({ err: { message: err.message } }, 'Redis 连接失败，服务将降级运行（任务队列/缓存不可用）')
    }
  } else {
    logger.info('Redis 未启用（REDIS_ENABLED !== true）')
  }

  // ── 启动 HTTP 服务器 ──
  const server = app.listen(Port)

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`端口 ${Port} 已被占用，尝试使用备用端口 ${Port + 1}`)
      setTimeout(() => {
        server.close()
        server.listen(Port + 1)
      }, 1500)
    } else {
      logger.fatal({ err }, '服务器启动失败')
      process.exit(1)
    }
  })

  server.on('listening', () => {
    const port = server.address().port
    const isFallback = port !== Port
    logger.info(`服务器启动在 http://localhost:${port}${isFallback ? '（备用端口）' : ''}`)
  })

  // ── 优雅关闭 ──
  const gracefulShutdown = async (signal) => {
    logger.info(`收到 ${signal} 信号，开始优雅关闭...`)

    // 1. 停止接收新请求
    server.close(() => {
      logger.info('HTTP 服务器已关闭，不再接收新请求')
    })

    // 2. 关闭数据库连接
    await Promise.allSettled([closeMySQL(), closeRedis()])

    logger.info('所有资源已释放，进程退出')
    process.exit(0)
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}

/**
 * 注册进程级未捕获异常处理
 * 与 HTTP 服务无关，任何部署形态（含 Vercel serverless）都需要生效。
 */
export const registerProcessHandlers = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, 'Unhandled Rejection')
    process.exit(1)
  })

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught Exception')
    process.exit(1)
  })
}
