/**
 * 示例任务处理器
 *
 * 作为新增任务的参考实现：接收 job，按 job.data.task 分派实际工作。
 */

/**
 * @param {import('bull').Job} job
 * @returns {Promise<object>}
 */
export default async function exampleTaskProcessor(job) {
  const payload = job.data?.payload ?? null

  return {
    processedAt: new Date().toISOString(),
    payload
  }
}
