// 纯工具函数集合：与组件状态无关，方便独立维护与复用。

/** 文件大小转可读文本 */
export const formatSize = (size = 0) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  )
  return `${(size / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

/** 生成文件项 uid */
export const createUid = () =>
  `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

/** 是否图片文件 */
export const isImageFile = (file) =>
  Boolean(
    file?.type?.startsWith('image/') ||
      /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file?.name || '')
  )

/** 用于去重的文件指纹 */
export const fileKey = (file) =>
  `${file.name}_${file.size}_${file.lastModified || 0}`

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
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension))
    return 'lucide:archive'
  if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'lucide:film'
  if (['mp3', 'wav', 'flac', 'aac'].includes(extension)) return 'lucide:music-2'
  if (['pdf'].includes(extension)) return 'lucide:file-text'
  return 'lucide:file'
}

/** 是否处于进行中的状态 */
export const isWorking = (item) =>
  ['hashing', 'verifying', 'uploading', 'merging', 'paused'].includes(
    item.status
  )

/** 是否展示进度条 */
export const showProgress = (item) =>
  item.status !== 'ready' && item.status !== 'cancelled'

/** 状态文案映射 */
export const statusText = (item) => {
  const labels = {
    ready: '待上传',
    hashing: '计算文件指纹',
    verifying: '检查上传记录',
    uploading: '上传中',
    merging: '合并文件',
    paused: '已暂停',
    success: '上传成功',
    error: '上传失败',
    cancelled: '已取消'
  }
  return labels[item.status] || '待上传'
}

/** 解析服务端返回，统一取 data 字段 */
export const unwrap = (result) => result?.data ?? result ?? {}

/** 把分片列表（数组 / 0-1 字符串）归一化为分片下标数组 */
export const normalizeChunkList = (value, totalChunks) => {
  if (Array.isArray(value))
    return value
      .map(Number)
      .filter((index) => index >= 0 && index < totalChunks)
  if (typeof value === 'string' && /^[01]+$/.test(value)) {
    return [...value].reduce(
      (result, flag, index) => (flag === '1' ? [...result, index] : result),
      []
    )
  }
  return []
}

/** 暴露给外部 v-model 的字段，避免内部 raw / previewUrl 被污染 */
export const publicModel = (item) => ({
  ...item,
  raw: item.raw,
  previewUrl: item.previewUrl
})

/** 计算第 index 个分片实际字节数（最后一个分片可能不足 chunkSize） */
export const chunkLength = (file, index, chunkSize) =>
  Math.min(chunkSize, Math.max(0, file.size - index * chunkSize))

/** 按 accept 规则判定当前文件是否合法 */
export const acceptFile = (file, accept) => {
  if (!accept) return true
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
  return accept.split(',').some((item) => {
    const token = item.trim().toLowerCase()
    if (!token) return false
    if (token.startsWith('.')) return token === extension
    if (token.endsWith('/*'))
      return file.type.toLowerCase().startsWith(token.slice(0, -1))
    return token === file.type.toLowerCase()
  })
}
