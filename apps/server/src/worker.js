/**
 * 后台任务 Worker 入口
 *
 * 与 HTTP 服务分离的独立进程（pm2: koa-worker-test / koa-worker-prod）。
 * 负责消费 `jobs/queue.js` 定义的队列任务，并按 `job.data.task` 分发到对应处理器。
 *
 * 注意：本文件路径被 `ecosystem.config.cjs` 引用，勿移动。
 */
import './config/env.js'
import { cronQueue } from './jobs/queue.js'
import exampleTaskProcessor from './jobs/processors/exampleTask.js'
import notificationCleanupProcessor from './jobs/processors/notificationCleanup.js'
import { initScheduler } from './jobs/scheduler.js'
import logger from './config/logger.js'

const nodeEnv = process.env.NODE_ENV || 'development'

logger.info(`Worker 启动中（${nodeEnv} 模式）`)

// 初始化定时任务
initScheduler().catch((err) => {
  logger.error({ err: { message: err.message } }, '初始化调度器失败')
})

// 处理任务：根据 job.data.task 分发到对应处理器
// 并发数设置为 2
cronQueue.process(2, async (job) => {
  const task = job.data?.task

  if (task === 'notification-cleanup') {
    return notificationCleanupProcessor(job)
  }

  // 默认示例任务
  return exampleTaskProcessor(job)
})

// 监听队列事件
cronQueue.on('completed', (job, result) => {
  logger.info({ jobId: job.id, result }, '任务执行完成')
})

cronQueue.on('failed', (job, err) => {
  logger.error({ jobId: job.id, err: { message: err.message } }, '任务执行失败')
})

logger.info('Worker 已启动，正在监听任务队列')
