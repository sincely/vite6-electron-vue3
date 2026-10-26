/**
 * 过期公告清理任务处理器
 *
 * 由 `src/worker.js` 按 `job.data.task === 'notification-cleanup'` 分发到本处理器。
 */
import { notificationService } from '../../modules/notification/index.js'

/**
 * @param {import('bull').Job} job
 * @returns {Promise<{deleted: number}>}
 */
export default async function notificationCleanupProcessor(job) {
  const result = await notificationService.deleteExpiredNotifications()

  return {
    deleted: result.data?.deleted ?? 0,
    processedAt: new Date().toISOString()
  }
}
