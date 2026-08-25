// 分片上传的文件指纹计算：跑在独立 Worker 线程内，
// 通过 self.postMessage 把每片进度回报给主线程，避免阻塞 UI。

import { createMD5, createSHA1, createSHA256 } from 'hash-wasm'

const factories = {
  md5: createMD5,
  sha1: createSHA1,
  'sha-1': createSHA1,
  sha256: createSHA256,
  'sha-256': createSHA256
}

const resolveAlgorithm = (algorithm) => {
  const factory = factories[String(algorithm || 'md5').toLowerCase()]
  if (!factory) throw new Error(`不支持的哈希算法：${algorithm}`)
  return factory
}

self.onmessage = async (event) => {
  const { file, chunkSize, algorithm = 'md5' } = event.data
  if (!file) {
    self.postMessage({ error: '未提供文件' })
    return
  }

  try {
    const factory = resolveAlgorithm(algorithm)
    const hasher = await factory()
    hasher.init()

    const size = Math.max(1, chunkSize)
    let offset = 0
    while (offset < file.size) {
      const end = Math.min(offset + size, file.size)
      // File/Blob 在 Worker 中可直接 slice + arrayBuffer，无需把大文件整段拷贝到主线程。
      const buffer = await file.slice(offset, end).arrayBuffer()
      hasher.update(new Uint8Array(buffer))
      offset = end
      self.postMessage({
        type: 'progress',
        percent: Math.min(100, (offset / file.size) * 100)
      })
    }

    self.postMessage({ type: 'done', hex: hasher.digest('hex') })
  } catch (error) {
    self.postMessage({
      error: error?.message || String(error) || '哈希计算失败'
    })
  }
}
