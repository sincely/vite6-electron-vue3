// 文件状态归一化与 model 同步：把传入数组（URL 字符串 / Element Plus 文件对象）统一为内部结构。

import { getFileNameFromUrl, makeStableUid } from './helpers'
import { getResponseUrl, releaseObjectUrl } from './file-url'

/** 把单条 v-model 项规范成内部统一结构；非法值返回 null 由调用方过滤 */
export const normalizeFile = (item, index, responseUrlKey) => {
  if (typeof item === 'string') {
    return {
      name: getFileNameFromUrl(item) || `文件${index + 1}`,
      url: item,
      status: 'success',
      uid: makeStableUid(item, index)
    }
  }

  if (!item || typeof item !== 'object') return null

  const file = { ...item }
  file.uid = makeStableUid(file, index)
  file.url = file.url || getResponseUrl(file.response, responseUrlKey)
  file.name = file.name || getFileNameFromUrl(file.url) || `文件${index + 1}`
  file.status = file.status || (file.url ? 'success' : 'ready')
  return file
}

/** 在已有列表中找「同一文件」：按 uid / url / raw 引用 / 名称+大小 任一字段匹配 */
export const findSameFile = (file, candidates) =>
  candidates.find(
    (candidate) =>
      candidate.uid === file.uid ||
      (candidate.url && file.url && candidate.url === file.url) ||
      (candidate.raw && file.raw && candidate.raw === file.raw) ||
      (candidate.name === file.name && candidate.size === file.size)
  )

/**
 * 把传入的 v-model 同步为内部 fileList：
 * - 规范化每项；
 * - 限制在 limit 范围内；
 * - 复用已有对象（保留 uid / 引用 / 状态），避免 v-model 反复变更引发重新上传；
 * - 清理掉被丢弃项对应的对象 URL，避免内存泄漏。
 *
 * @returns {Array} 归一化后的新列表
 */
export const syncFromModel = (
  value,
  currentFiles,
  limit,
  objectUrlMap,
  responseUrlKey
) => {
  const source = Array.isArray(value) ? value : value ? [value] : []
  const normalized = source
    .map((item, index) => normalizeFile(item, index, responseUrlKey))
    .filter(Boolean)
  const limited = limit ? normalized.slice(0, limit) : normalized

  const next = limited.map((file) => {
    const sameFile = findSameFile(file, currentFiles)
    if (!sameFile) return file
    Object.assign(sameFile, file)
    return sameFile
  })

  const nextUids = new Set(next.map((file) => file.uid))
  currentFiles.forEach((file) => {
    if (!nextUids.has(file.uid)) releaseObjectUrl(file.uid, objectUrlMap)
  })

  return next
}
