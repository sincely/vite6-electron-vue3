// 全局并发槽位控制：限制同一时刻处于「请求中」的分片数。
// 模块级单例状态，确保多个上传任务之间也能共享并发额度。

let activeRequests = 0
const slotWaiters = []

/**
 * 申请一个并发槽位；超额时进入等待队列。
 * @returns {Promise<boolean>} 返回 false 表示任务已取消，无需再发起请求。
 */
export const acquireSlot = (task, concurrency) => {
  if (task.cancelled) return Promise.resolve(false)
  if (activeRequests < Math.max(1, concurrency)) {
    activeRequests += 1
    return Promise.resolve(true)
  }
  return new Promise((resolve) => slotWaiters.push({ task, resolve }))
}

const drainSlots = (concurrency) => {
  while (activeRequests < Math.max(1, concurrency) && slotWaiters.length) {
    const waiter = slotWaiters.shift()
    if (waiter.task.cancelled || waiter.task.failed) {
      waiter.resolve(false)
      continue
    }
    activeRequests += 1
    waiter.resolve(true)
  }
}

/** 释放一个并发槽位，并尝试唤醒等待队列 */
export const releaseSlot = (concurrency) => {
  activeRequests = Math.max(0, activeRequests - 1)
  drainSlots(concurrency)
}

/** 组件卸载时拒绝所有仍在等待的槽位请求，避免泄漏 */
export const flushSlotWaiters = () => {
  slotWaiters.splice(0).forEach((waiter) => waiter.resolve(false))
}
