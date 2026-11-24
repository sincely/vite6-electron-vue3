/**
 * 过期上传分片清理任务处理器
 *
 * 由 `src/worker.js` 按 `job.data.task === 'upload-chunk-cleanup'` 分发到本处理器。
 */
import { uploadService } from '../../modules/upload/index.js'

/**
 * @param {import('bull').Job} job
 * @returns {Promise<{removed: number}>}
 */
export default async function uploadChunkCleanupProcessor(job) {
  const result = await uploadService.cleanupExpiredChunks()

  return {
    removed: result.data?.removed ?? 0,
    processedAt: new Date().toISOString()
  }
}
