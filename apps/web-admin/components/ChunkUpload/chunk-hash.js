// 文件指纹计算主线程入口：
// - 默认在 Web Worker 中跑（依赖 Vite 的 `?worker` 解析），切片读取 + WASM 哈希都在子线程；
// - 当 Worker 不可用 / 初始化失败时，回退到主线程执行，保证基本可用。
// - 支持算法：md5 / sha1 / sha-1 / sha256 / sha-256，算法不匹配会抛错。
// 进度回调只在主线程触发，避免组件订阅 Worker 细节；调用方仍按原签名传入 task 用于取消。

import { createMD5, createSHA1, createSHA256 } from 'hash-wasm'
import HashWorker from './chunk-hash.worker.js?worker'

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

// 主线程降级路径：浏览器禁用 Worker / 资源加载失败时仍能完成哈希。
const calculateHashOnMainThread = async (
  file,
  task,
  chunkSize,
  onProgress,
  algorithm
) => {
  const factory = resolveAlgorithm(algorithm)
  const hasher = await factory()
  hasher.init()
  const size = Math.max(1, chunkSize)
  let offset = 0
  while (offset < file.size) {
    if (task?.cancelled) throw new Error('上传已取消')
    const end = Math.min(offset + size, file.size)
    const buffer = await file.slice(offset, end).arrayBuffer()
    hasher.update(new Uint8Array(buffer))
    offset += buffer.byteLength
    onProgress(Math.min(100, (offset / file.size) * 100))
  }
  return hasher.digest('hex')
}

const calculateHashInWorker = (file, task, chunkSize, onProgress, algorithm) =>
  new Promise((resolve, reject) => {
    let worker
    try {
      worker = new HashWorker()
    } catch (error) {
      // Worker 创建失败（隐私模式 / CSP）→ 退回主线程
      calculateHashOnMainThread(
        file,
        task,
        chunkSize,
        onProgress,
        algorithm
      ).then(resolve, reject)
      return
    }

    const cleanup = () => {
      worker.onmessage = null
      worker.onerror = null
      worker.terminate()
    }

    worker.onmessage = (event) => {
      const data = event.data
      if (data.error) {
        cleanup()
        reject(new Error(data.error))
        return
      }
      if (data.type === 'progress') {
        // 每次进度回报时顺手检查 task.cancelled：
        // - 立即终止子线程，释放 CPU；
        // - 主线程在最大一个分片大小之后感知取消，延迟可控。
        if (task?.cancelled) {
          cleanup()
          reject(new Error('上传已取消'))
          return
        }
        onProgress(data.percent)
      } else if (data.type === 'done') {
        cleanup()
        resolve(data.hex)
      }
    }

    worker.onerror = (event) => {
      cleanup()
      reject(new Error(event.message || 'Worker 计算失败'))
    }

    worker.postMessage({
      file,
      chunkSize: Math.max(1, chunkSize),
      algorithm: algorithm || 'md5'
    })
  })

/**
 * 计算文件指纹。
 * @param {File} file 原始文件
 * @param {{ cancelled?: boolean }} task 任务对象，外部置 cancelled=true 会终止计算
 * @param {number} hashChunkSize 单片读取字节数，默认 2 MB
 * @param {(percent: number) => void} onProgress 0-100 进度回调
 * @param {'md5' | 'sha1' | 'sha-1' | 'sha256' | 'sha-256'} [algorithm='md5'] 哈希算法
 * @returns {Promise<string>} 十六进制摘要
 */
export const calculateHash = (
  file,
  task,
  hashChunkSize = 2 * 1024 * 1024,
  onProgress = () => {},
  algorithm = 'md5'
) => {
  const runner =
    typeof Worker !== 'undefined'
      ? calculateHashInWorker
      : calculateHashOnMainThread
  return runner(file, task, hashChunkSize, onProgress, algorithm)
}
