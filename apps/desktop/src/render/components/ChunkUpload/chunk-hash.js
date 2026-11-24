// 文件指纹计算主线程入口：
// - 默认在 Web Worker 中跑（依赖 Vite 的 `?worker` 解析），切片读取 + WASM 哈希都在子线程，不阻塞 UI；
// - Worker 不可用 / 初始化失败时回退到主线程，保证基本可用；
// - 支持算法：md5 / sha1 / sha-1 / sha256 / sha-256，不支持的算法会抛错；
// - 暂停 / 取消通过 AbortSignal 传入：中止时立即终止 Worker，并以 AbortError 结束。

import { createMD5, createSHA1, createSHA256 } from 'hash-wasm'
import HashWorker from './chunk-hash.worker.js?worker'
import { createAbortError, throwIfAborted } from './helpers'

const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024

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

// 主线程降级路径：浏览器禁用 Worker / 资源加载失败时仍能完成哈希
const hashOnMainThread = async (file, { signal, chunkSize, algorithm, onProgress }) => {
  const hasher = await resolveAlgorithm(algorithm)()
  hasher.init()
  let offset = 0
  while (offset < file.size) {
    throwIfAborted(signal)
    const buffer = await file.slice(offset, offset + chunkSize).arrayBuffer()
    hasher.update(new Uint8Array(buffer))
    offset += buffer.byteLength
    onProgress(Math.min(100, (offset / file.size) * 100))
  }
  return hasher.digest('hex')
}

const hashInWorker = (file, options) =>
  new Promise((resolve, reject) => {
    const { signal, chunkSize, algorithm, onProgress } = options
    let worker
    try {
      worker = new HashWorker()
    } catch {
      // Worker 创建失败（隐私模式 / CSP）→ 退回主线程
      hashOnMainThread(file, options).then(resolve, reject)
      return
    }

    const onAbort = () => finish(reject, createAbortError())
    const finish = (settle, value) => {
      signal?.removeEventListener('abort', onAbort)
      worker.terminate()
      settle(value)
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    worker.onmessage = ({ data }) => {
      if (data.error) finish(reject, new Error(data.error))
      else if (data.type === 'progress') onProgress(data.percent)
      else if (data.type === 'done') finish(resolve, data.hex)
    }
    worker.onerror = (event) => finish(reject, new Error(event.message || 'Worker 计算失败'))
    worker.postMessage({ file, chunkSize, algorithm })
  })

/**
 * 计算文件指纹。
 * @param {File} file 原始文件
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] 中止信号，触发后以 AbortError 拒绝
 * @param {number} [options.chunkSize] 单次读取字节数，默认 2 MB
 * @param {'md5' | 'sha1' | 'sha-1' | 'sha256' | 'sha-256'} [options.algorithm] 哈希算法，默认 md5
 * @param {(percent: number) => void} [options.onProgress] 0-100 进度回调
 * @returns {Promise<string>} 十六进制摘要
 */
export const calculateHash = (
  file,
  { signal, chunkSize = DEFAULT_CHUNK_SIZE, algorithm = 'md5', onProgress = () => {} } = {}
) => {
  throwIfAborted(signal)
  resolveAlgorithm(algorithm) // 不支持的算法立即抛错，而不是等到 Worker 里才失败
  const options = { signal, chunkSize: Math.max(1, chunkSize), algorithm, onProgress }
  return typeof Worker === 'undefined' ? hashOnMainThread(file, options) : hashInWorker(file, options)
}
