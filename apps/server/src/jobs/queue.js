/**
 * 任务队列定义
 *
 * 基于 Bull 的定时任务队列，与主进程共用同一 Redis 实例。
 * 仅供 Worker 进程（`src/worker.js`）使用。
 */
import Bull from 'bull'
import { redisConfig } from '../config/database.js'

/**
 * 定时任务队列
 * @type {import('bull').Queue}
 */
export const cronQueue = new Bull('cron-queue', {
  redis: {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
    db: redisConfig.db
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200
  }
})

export default cronQueue
