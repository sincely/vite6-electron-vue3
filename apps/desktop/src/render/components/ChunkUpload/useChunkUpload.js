// 文件列表 + 上传队列的状态管理（相当于参考实现里的 useBigFileUpload，并支持多文件）。
//
// 逻辑分三层，各管一件事：
//   队列  本文件           哪些文件在传、哪些排队；暂停 / 继续 / 移除 / 批量操作；v-model 同步与对外事件
//   任务  upload-task.js   单个文件的 hash → verify → 分片上传 → merge
//   接口  chunk-api.js     与服务端的具体协议
// 视图（index.vue）只消费这里返回的状态与方法，不含任何上传逻辑。

import { computed, onBeforeUnmount, reactive, ref, toRaw, watch } from 'vue'

import { callCancel, callMerge, callUploadChunk, callVerify } from './chunk-api'
import { createUploadTask } from './upload-task'
import { acceptFile, canPause, fileKey, isWorking, normalizeItem, publicModel } from './helpers'

// 进度类更新的 v-model 回写间隔；状态切换则立即回写
const PROGRESS_EMIT_INTERVAL = 200
const FEEDBACK_DURATION = 4200
const STARTABLE_STATUSES = ['ready', 'paused', 'error']

/**
 * @param {object} props 组件 props（需包含 modelValue / action / api / chunkSize / concurrency 等，见 index.vue）
 * @param {Function} emit 组件 emit
 */
export const useChunkUpload = (props, emit) => {
  const items = ref([]) // 文件项：视图直接渲染，字段即 v-model 的元素
  const feedback = ref(null) // 校验失败等一次性提示 { message, type }

  const tasks = new Map() // uid → 正在运行的上传任务
  const queue = [] // 等待运行的文件项（先进先出）
  const previewUrls = new Map() // uid → 本地预览 objectURL，移除时需 revoke

  // ─── 接口：每次调用时读取最新 props，host 动态改 headers（如刷新 token）即刻生效 ───
  const apiOptions = () => ({
    action: props.action,
    verifyUrl: props.verifyUrl,
    chunkUrl: props.chunkUrl,
    mergeUrl: props.mergeUrl,
    cancelUrl: props.cancelUrl,
    api: props.api,
    headers: props.headers,
    data: props.data,
    withCredentials: props.withCredentials
  })
  const api = {
    verify: (context) => callVerify(context, apiOptions()),
    uploadChunk: (context) => callUploadChunk(context, apiOptions()),
    merge: (context) => callMerge(context, apiOptions()),
    cancel: (context) => callCancel(context, apiOptions())
  }

  // ─── v-model：内部持有状态，只发出快照；自己发出的快照回流时不再对账 ───
  const emittedSnapshots = new WeakSet()
  let emitTimer = 0

  const emitModel = () => {
    window.clearTimeout(emitTimer)
    emitTimer = 0
    const snapshot = items.value.map(publicModel)
    emittedSnapshots.add(snapshot)
    emit('update:modelValue', snapshot)
    emit('change', snapshot)
  }

  const scheduleEmit = () => {
    if (!emitTimer) emitTimer = window.setTimeout(emitModel, PROGRESS_EMIT_INTERVAL)
  }

  // ─── 文件项 ───
  const createItem = (value) => {
    const item = reactive(normalizeItem(value))
    if (item.raw && item.isImage && !item.previewUrl) {
      const url = URL.createObjectURL(item.raw)
      previewUrls.set(item.uid, url)
      item.previewUrl = url
    }
    return item
  }

  const revokePreview = (item) => {
    const url = previewUrls.get(item.uid)
    if (!url) return
    URL.revokeObjectURL(url)
    previewUrls.delete(item.uid)
  }

  // 所有对文件项的修改都经过这里：写入字段 → 回写 v-model → 派发 progress 事件
  const update = (item, fields) => {
    Object.assign(item, fields)
    if ('status' in fields) emitModel()
    else scheduleEmit()
    if ('percent' in fields) {
      emit('progress', {
        item: publicModel(item),
        percent: item.percent,
        uploadedChunks: item.uploadedChunks,
        phase: item.status
      })
    }
  }

  // ─── 提示 ───
  let feedbackTimer = 0
  const notify = (message, type = 'error') => {
    feedback.value = { message, type }
    window.clearTimeout(feedbackTimer)
    feedbackTimer = window.setTimeout(() => {
      feedback.value = null
    }, FEEDBACK_DURATION)
  }

  // ─── 添加文件：校验 → beforeUpload 钩子 → 入列 → （autoUpload）开始 ───
  const validateFile = (file, knownKeys) => {
    if (!acceptFile(file, props.accept)) return `「${file.name}」不是允许的文件类型`
    if (props.maxSize > 0 && file.size > props.maxSize * 1024 * 1024) {
      return `「${file.name}」超过 ${props.maxSize} MB 大小限制`
    }
    if (knownKeys.has(fileKey(file))) return `「${file.name}」已经在列表中`
    return ''
  }

  // 返回可入列的文件；未通过校验或被钩子拒绝时返回 null
  const admitFile = async (source, candidates, knownKeys) => {
    const reject = (file, phase, message, extra) => {
      notify(message)
      emit('error', { file, phase, message, ...extra })
      return null
    }

    const sourceMessage = validateFile(source, knownKeys)
    if (sourceMessage) return reject(source, 'validate', sourceMessage)

    let file = source
    try {
      emit('before-upload', source)
      const result = props.beforeUpload ? await props.beforeUpload(source, candidates) : undefined
      if (result === false) return null
      if (result instanceof File) file = result
    } catch (error) {
      return reject(source, 'before-upload', error?.message || '上传前校验未通过', { error })
    }

    // 钩子可能换了一个文件，需要再校验一次
    const finalMessage = validateFile(file, knownKeys)
    return finalMessage ? reject(file, 'validate', finalMessage) : file
  }

  const addFiles = async (files) => {
    if (!files.length || props.disabled) return
    const candidates = props.multiple ? files : files.slice(0, 1)
    const knownKeys = new Set(items.value.map((item) => item.fileKey))
    // 单文件模式下新文件会替换旧文件，旧文件不占名额
    const occupied = props.multiple ? items.value.length : 0
    const accepted = []

    for (const source of candidates) {
      if (props.limit > 0 && occupied + accepted.length >= props.limit) {
        notify(`最多只能添加 ${props.limit} 个文件`)
        break
      }
      const file = await admitFile(source, candidates, knownKeys)
      if (file) {
        accepted.push(file)
        knownKeys.add(fileKey(file))
      }
    }
    if (!accepted.length) return

    if (!props.multiple) {
      items.value.forEach(abandon)
      items.value = []
    }
    const added = accepted.map(createItem)
    items.value.push(...added)
    emitModel()
    if (props.autoUpload) added.forEach(start)
  }

  // ─── 队列调度：同时运行的文件数不超过 fileConcurrency，其余保持 queued 按先后顺序等待 ───
  const start = (item) => {
    if (!item.raw || props.disabled || !STARTABLE_STATUSES.includes(item.status)) return
    update(item, { status: 'queued', error: '' })
    queue.push(item)
    pump()
  }

  const pump = () => {
    while (tasks.size < Math.max(1, props.fileConcurrency) && queue.length) {
      run(queue.shift())
    }
  }

  const run = async (item) => {
    const task = createUploadTask({
      item,
      api,
      options: {
        chunkSize: Math.max(1, props.chunkSize),
        concurrency: Math.max(1, props.concurrency),
        maxRetry: Math.max(0, props.maxRetry),
        retryDelay: props.retryDelay,
        hashChunkSize: props.hashChunkSize,
        hashAlgorithm: props.hashAlgorithm
      },
      update: (fields) => update(item, fields)
    })
    tasks.set(item.uid, task)

    const result = await task.run()
    if (tasks.get(item.uid) === task) tasks.delete(item.uid)
    settle(item, result)
    pump()
  }

  // 'pause' 的状态在 pause() 时已即时置位，'cancel' 的文件项已被移除，这里只处理成功与失败
  const settle = (item, result) => {
    if (result.type === 'success') finish(item, result)
    else if (result.type === 'error') fail(item, result.error)
  }

  const finish = (item, { method, url, response }) => {
    const remoteUrl = url || item.url || ''
    update(item, {
      status: 'success',
      percent: 100,
      error: '',
      uploadedChunks: item.totalChunks,
      method: method === 'fast' ? '秒传成功' : item.method,
      url: remoteUrl,
      previewUrl: item.isImage && remoteUrl ? remoteUrl : item.previewUrl,
      response
    })
    emit('success', { item: publicModel(item), response, method })
  }

  const fail = (item, error) => {
    const message = error?.message || '上传失败，请重试'
    update(item, { status: 'error', error: message })
    emit('error', { item: publicModel(item), error, phase: 'upload', message })
  }

  // ─── 单个文件的控制 ───
  const dequeue = (item) => {
    const index = queue.indexOf(item)
    if (index >= 0) queue.splice(index, 1)
  }

  const pause = (item) => {
    if (!canPause(item)) return
    if (item.status === 'queued') dequeue(item)
    else tasks.get(item.uid)?.pause()
    update(item, { status: 'paused' })
  }

  // 仅停止本地任务并释放资源；服务端分片保留，之后选择同一文件仍可续传
  const release = (item) => {
    dequeue(item)
    tasks.get(item.uid)?.cancel()
    revokePreview(item)
  }

  // 主动放弃：除本地清理外，通知服务端删除临时分片
  const notifyServerCancel = async (item) => {
    try {
      await api.cancel({ file: item.raw, item: publicModel(item), fileHash: item.hash, uploadId: item.uploadId })
    } catch {
      // 清理失败不影响本地流程：服务端有过期清理兜底
    }
  }

  const abandon = (item) => {
    release(item)
    if (item.hash && item.status !== 'success') notifyServerCancel(item)
  }

  const remove = (item) => {
    abandon(item)
    items.value = items.value.filter((current) => current !== item)
    emitModel()
    emit('remove', publicModel(item))
  }

  // ─── 批量操作 ───
  const submit = () => items.value.filter((item) => item.status === 'ready').forEach(start)
  const pauseAll = () => items.value.filter(canPause).forEach(pause)
  const resumeAll = () => items.value.filter((item) => item.status === 'paused').forEach(start)
  const cancelAll = () => items.value.filter((item) => item.status !== 'success').forEach(remove)

  const stats = computed(() => {
    const result = { ready: 0, pausable: 0, paused: 0, working: 0, unfinished: 0 }
    for (const item of items.value) {
      if (item.status === 'ready') result.ready += 1
      if (item.status === 'paused') result.paused += 1
      if (canPause(item)) result.pausable += 1
      if (isWorking(item)) result.working += 1
      if (item.status !== 'success') result.unfinished += 1
    }
    return result
  })

  // ─── 与外部 v-model 对账：以 uid 为键，已有项保留（含运行中的任务），新增项归一化，缺失项释放 ───
  const reconcile = (incoming) => {
    const current = new Map(items.value.map((item) => [item.uid, item]))
    const next = incoming.map((value) => current.get(value?.uid) ?? createItem(value))
    items.value.filter((item) => !next.includes(item)).forEach(release)
    items.value = next
  }

  // 必须放在所有函数声明之后：immediate 会在 setup 阶段同步执行
  watch(
    () => props.modelValue,
    (value) => {
      if (emittedSnapshots.has(toRaw(value))) return
      reconcile(Array.isArray(value) ? value : [])
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    window.clearTimeout(emitTimer)
    window.clearTimeout(feedbackTimer)
    items.value.forEach(release)
  })

  return { items, feedback, stats, addFiles, start, pause, remove, submit, pauseAll, resumeAll, cancelAll }
}
