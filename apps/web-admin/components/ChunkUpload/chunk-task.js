// 上传任务的生命周期管理：创建、查询、取消、暂停 / 恢复、暂停等待。
// 模块级 Map 作为单例任务注册表，避免每个组件实例各自维护一份。

const tasks = new Map()

/** 创建任务并加入注册表 */
export const createTask = (uid) => {
  const task = {
    cancelled: false,
    failed: false,
    paused: false,
    activeXhrs: new Set(),
    chunkProgress: new Map(),
    resumeResolvers: []
  }
  tasks.set(uid, task)
  return task
}

/** 通过 uid 取出任务对象 */
export const getTask = (uid) => tasks.get(uid)

/** 从注册表中移除任务（不影响已持有的 task 对象引用） */
export const deleteTask = (uid) => tasks.delete(uid)

/** 取消指定文件的上传任务，终止所有活跃 XHR 并唤醒暂停等待者 */
export const cancelTask = (item) => {
  const task = tasks.get(item.uid)
  if (!task) return
  task.cancelled = true
  task.resumeResolvers.splice(0).forEach((resolve) => resolve(false))
  task.activeXhrs.forEach((xhr) => xhr.abort())
  tasks.delete(item.uid)
}

/** 暂停任务：worker 会在下次循环检查 paused 后退出 */
export const pauseTask = (task) => {
  task.paused = true
}

/** 恢复任务并唤醒所有等待中的 worker */
export const resumeTask = (task) => {
  task.paused = false
  task.resumeResolvers.splice(0).forEach((resolve) => resolve(true))
}

/** 暂停期间阻塞当前调用，直到任务恢复或被取消 */
export const waitUntilResumed = (task) => {
  if (!task.paused) return Promise.resolve(true)
  return new Promise((resolve) => task.resumeResolvers.push(resolve))
}
