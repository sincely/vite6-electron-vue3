/**
 * 定时任务调度
 *
 * 在 Worker 进程启动时注册周期性任务。
 * 任务本身入队后由 `src/worker.js` 分发到对应处理器执行。
 */
import { cronQueue } from './queue.js'

/**
 * 任务标识与 cron 表达式的注册表
 * 新增定时任务时在此登记即可，无需改动 Worker 的分发逻辑。
 * @type {Array<{task: string, cron: string, description: string}>}
 */
export const CRON_JOBS = [
  {
    task: 'notification-cleanup',
    // 每天 03:10 清理一次过期公告
    cron: '10 3 * * *',
    description: '清理已过期的站内公告'
  }
]

/**
 * 初始化调度器：把已登记的定时任务写入队列。
 * @returns {Promise<void>}
 */
export const initScheduler = async () => {
  for (const job of CRON_JOBS) {
    // repeat 会为每个 cron 表达式生成唯一的 repeatable job key，重复注册是幂等的
    await cronQueue.add(job.task, { task: job.task }, { repeat: { cron: job.cron } })
  }
}

export default initScheduler
