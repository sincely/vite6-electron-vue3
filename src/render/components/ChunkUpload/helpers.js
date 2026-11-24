// 纯工具函数集合：与组件状态无关，方便独立维护与复用。

/** 文件大小转可读文本 */
export const formatSize = (size = 0) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  return `${(size / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

/** 生成文件项 uid */
export const createUid = () => `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

/** 是否图片文件 */
export const isImageFile = (file) =>
  Boolean(file?.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file?.name || ''))

/** 用于去重的文件指纹 */
export const fileKey = (file) => `${file.name}_${file.size}_${file.lastModified || 0}`

/** 从远端 URL 中解析文件名 */
export const getRemoteName = (url) => {
  try {
    const pathname = new URL(url, window.location.origin).pathname
    return decodeURIComponent(pathname.split('/').pop() || '远程文件')
  } catch {
    return url.split('/').pop()?.split('?')[0] || '远程文件'
  }
}

/** 文件图标，按扩展名分类 */
export const fileIcon = (item) => {
  if (item.isImage) return 'lucide:image'
  const extension = item.name?.split('.').pop()?.toLowerCase()
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'lucide:archive'
  if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'lucide:film'
  if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) return 'lucide:music-2'
  if (['pdf'].includes(extension)) return 'lucide:file-text'
  return 'lucide:file'
}

// ─── 文件项状态机 ───────────────────────────────────────────────
// ready ─► queued ─► hashing ─► verifying ─► uploading ─► merging ─► success
// 除 merging 外的阶段均可 paused（继续后回到 queued）；任一阶段失败进入 error（重试后回到 queued）
const RUNNING_STATUSES = ['hashing', 'verifying', 'uploading', 'merging']
const PAUSABLE_STATUSES = ['queued', 'hashing', 'verifying', 'uploading']

/** 正在占用上传流水线 */
export const isRunning = (item) => RUNNING_STATUSES.includes(item.status)

/** 任务尚未结束（排队 / 运行 / 暂停） */
export const isWorking = (item) => isRunning(item) || item.status === 'queued' || item.status === 'paused'

/** 可暂停：合并阶段由服务端完成，无法中断 */
export const canPause = (item) => PAUSABLE_STATUSES.includes(item.status)

/** 是否展示进度条 */
export const showProgress = (item) => item.status !== 'ready' && item.status !== 'queued'

/** 状态文案映射 */
export const statusText = (item) => {
  const labels = {
    ready: '待上传',
    queued: '排队中',
    hashing: '计算文件指纹',
    verifying: '检查上传记录',
    uploading: '上传中',
    merging: '合并文件',
    paused: '已暂停',
    success: '上传成功',
    error: '上传失败'
  }
  return labels[item.status] || '待上传'
}

/** 解析服务端返回，统一取 data 字段（兼容 { code, data } 信封与裸对象） */
export const unwrap = (result) => result?.data ?? result ?? {}

/** 把分片列表（数组 / 0-1 字符串）归一化为分片下标数组 */
export const normalizeChunkList = (value, totalChunks) => {
  if (Array.isArray(value)) return value.map(Number).filter((index) => index >= 0 && index < totalChunks)
  if (typeof value === 'string' && /^[01]+$/.test(value)) {
    return [...value].reduce((result, flag, index) => (flag === '1' ? [...result, index] : result), [])
  }
  return []
}

/** 暴露给外部 v-model / 事件的快照：浅拷贝，避免外部持有内部响应式对象 */
export const publicModel = (item) => ({ ...item })

/** 计算第 index 个分片实际字节数（最后一个分片可能不足 chunkSize） */
export const chunkLength = (file, index, chunkSize) => Math.min(chunkSize, Math.max(0, file.size - index * chunkSize))

/** 按 accept 规则判定当前文件是否合法 */
export const acceptFile = (file, accept) => {
  if (!accept) return true
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
  return accept.split(',').some((item) => {
    const token = item.trim().toLowerCase()
    if (!token) return false
    if (token.startsWith('.')) return token === extension
    if (token.endsWith('/*')) return file.type.toLowerCase().startsWith(token.slice(0, -1))
    return token === file.type.toLowerCase()
  })
}

/**
 * 把外部传入的值（File / 远端 URL 字符串 / 回显对象）归一化为文件项。
 * 外部回传的“进行中”状态没有对应的运行任务：有源文件视为已暂停（可继续），否则视为失败。
 */
export const normalizeItem = (value) => {
  const source =
    typeof value === 'string'
      ? { url: value, name: getRemoteName(value) }
      : value instanceof File
        ? { raw: value, name: value.name }
        : value || {}
  const raw = source.raw instanceof File ? source.raw : undefined
  const isRemote = !raw && Boolean(source.url || source.previewUrl)
  const interrupted = source.status === 'queued' || RUNNING_STATUSES.includes(source.status)

  let status = source.status || (isRemote ? 'success' : 'ready')
  let error = source.error || ''
  if (interrupted) {
    status = raw ? 'paused' : 'error'
    error = raw ? error : '文件已失效，请重新选择'
  }

  return {
    ...source,
    uid: source.uid || createUid(),
    raw,
    name: source.name || raw?.name || '未命名文件',
    size: source.size ?? raw?.size ?? 0,
    type: source.type || raw?.type || '',
    status,
    percent: typeof source.percent === 'number' ? source.percent : isRemote ? 100 : 0,
    isImage: source.isImage ?? isImageFile(raw || source),
    previewUrl: source.previewUrl || source.url || '',
    uploadedChunks: source.uploadedChunks || 0,
    totalChunks: source.totalChunks || 0,
    error,
    method: source.method || (isRemote ? '已回显' : ''),
    fileKey: source.fileKey || (raw ? fileKey(raw) : `${source.name || ''}_${source.size || 0}`)
  }
}

// ─── 中止信号 ───────────────────────────────────────────────────
// 暂停 / 取消统一用 AbortSignal 传递：fetch、XHR、Worker、重试等待都据此提前结束。

/** 与 fetch 抛出的 DOMException 同名，便于 isAbortError 统一判断 */
export const createAbortError = () => Object.assign(new Error('上传已中止'), { name: 'AbortError' })

export const isAbortError = (error) => error?.name === 'AbortError'

export const throwIfAborted = (signal) => {
  if (signal?.aborted) throw createAbortError()
}

/** 可被中止的延时，用于分片失败后的重试等待 */
export const delay = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError())
      return
    }
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(createAbortError())
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
