// localStorage 中分片上传进度的持久化：浏览器重启后可继续断点续传。
// 注意：localStorage 可能因隐私模式或配额不足不可用，所有写入都被 try/catch 静默吞掉。

const buildKey = (hash, chunkSize) => `chunk-upload:${hash}:${chunkSize}`

/** 读取已上传完成的分片下标 */
export const readStoredChunks = (hash, chunkSize) => {
  try {
    const value = JSON.parse(
      localStorage.getItem(buildKey(hash, chunkSize)) || '[]'
    )
    return Array.isArray(value)
      ? value.map(Number).filter(Number.isInteger)
      : []
  } catch {
    return []
  }
}

/** 写入已上传完成的分片下标（排序后保存） */
export const storeChunks = (hash, chunkSize, chunks) => {
  try {
    localStorage.setItem(
      buildKey(hash, chunkSize),
      JSON.stringify([...chunks].sort((a, b) => a - b))
    )
  } catch {
    // localStorage 可能因隐私模式或配额不足不可用，不影响本次上传。
  }
}

/** 上传完成 / 主动取消时清理持久化记录 */
export const clearStoredChunks = (hash, chunkSize) => {
  try {
    localStorage.removeItem(buildKey(hash, chunkSize))
  } catch {
    // ignore storage errors
  }
}
