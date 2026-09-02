// 纯工具函数：与组件状态无关，可在多模块间复用。

/** 字节数 → 可读文本（B / KB / MB） */
export const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

/** 取文件名后缀（含点号，统一小写）；没有则返回空字符串 */
export const getExtension = (name) => {
  const cleanName = String(name || '').split(/[?#]/)[0]
  const index = cleanName.lastIndexOf('.')
  return index > -1 ? cleanName.slice(index).toLowerCase() : ''
}

/** 从 URL 中解析文件名（处理 URL 编码） */
export const getFileNameFromUrl = (url) => {
  if (!url || typeof url !== 'string') return ''
  try {
    const pathname = new URL(url, window.location.origin).pathname
    const name = pathname.split('/').pop()
    return decodeURIComponent(name || '')
  } catch {
    return url.split('/').pop()?.split('?')[0] || ''
  }
}

/** 按 `a.b.c` 形式读取嵌套字段 */
export const getValueByPath = (value, path) => {
  if (!path) return undefined
  return String(path)
    .split('.')
    .reduce((current, key) => current?.[key], value)
}

/**
 * 生成稳定的 uid：
 * - 优先沿用已有 uid；
 * - 没有则用「URL/名称/大小/下标」算 32-bit 哈希 + 下标，确保同一项多次回显 uid 不变。
 */
export const makeStableUid = (item, index) => {
  if (item?.uid !== undefined && item.uid !== null) return item.uid
  const identity =
    typeof item === 'string'
      ? item
      : `${item?.url || ''}-${item?.name || ''}-${item?.size || ''}-${index}`
  let hash = 0
  for (let i = 0; i < identity.length; i += 1) {
    hash = (hash << 5) - hash + identity.charCodeAt(i)
    hash |= 0
  }
  return `file-${Math.abs(hash)}-${index}`
}

/** 浅拷贝文件列表（避免外部修改组件内部状态） */
export const cloneFileList = (files = []) => files.map((file) => ({ ...file }))
