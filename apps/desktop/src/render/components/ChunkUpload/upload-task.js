// 单文件上传流水线：计算指纹 → 校验（秒传 / 断点续传）→ 分片并发上传 → 合并。
//
// 与 Vue 无关的纯异步逻辑：
//   - 进度与状态通过 update(fields) 回传，由调用方决定如何落到界面；
//   - 暂停 / 取消通过 AbortSignal 传递，run() 永不抛错，而是返回结果对象：
//       { type: 'success', method, url, response } | { type: 'pause' } | { type: 'cancel' } | { type: 'error', error }
//   - 暂停后“继续”就是重新 run() 一次：指纹复用 item.hash，已上传分片以服务端校验结果为准，只补传缺失的分片。

import { calculateHash } from './chunk-hash'
import { chunkLength, delay, isAbortError, normalizeChunkList, publicModel, throwIfAborted, unwrap } from './helpers'

const pickUrl = (result) => result.url || result.fileUrl || result.downloadUrl || ''

/**
 * @param {object} params
 * @param {object} params.item 文件项（只读）：取 raw 源文件，并通过 hash / uploadId 复用上次的断点信息
 * @param {object} params.options chunkSize / concurrency / maxRetry / retryDelay / hashChunkSize / hashAlgorithm
 * @param {{ verify: Function, uploadChunk: Function, merge: Function }} params.api 与服务端交互的三个接口
 * @param {(fields: object) => void} params.update 回传文件项变化，如 { status } / { percent } / { hash }
 */
export const createUploadTask = ({ item, options, api, update }) => {
  const controller = new AbortController()
  const { signal } = controller
  const file = item.raw
  const { chunkSize } = options
  let intent = null // 'pause' | 'cancel'：run() 据此区分“主动中止”与“真正失败”

  // 传给 api.* 的上下文（custom api 也依赖这个形状）
  const buildContext = (fileHash, totalChunks, uploadId) => ({
    file,
    item: publicModel(item),
    fileHash,
    totalChunks,
    chunkSize,
    uploadId,
    signal
  })

  // ① 文件指纹：计算过（暂停 / 重试）则直接复用
  const hashFile = async () => {
    if (item.hash) return item.hash
    update({ status: 'hashing', percent: 0 })
    const hash = await calculateHash(file, {
      signal,
      chunkSize: options.hashChunkSize,
      algorithm: options.hashAlgorithm,
      onProgress: (percent) => update({ percent })
    })
    update({ hash })
    return hash
  }

  // ② 校验：服务端已有成品 → 秒传；否则取回已落盘的分片下标
  const verify = async (fileHash, totalChunks) => {
    update({ status: 'verifying', percent: 0, totalChunks })
    const result = unwrap(await api.verify(buildContext(fileHash, totalChunks, item.uploadId)))
    throwIfAborted(signal)

    const uploadId = result.uploadId || result.taskId || item.uploadId
    if (uploadId !== item.uploadId) update({ uploadId })
    return {
      uploadId,
      fast: Boolean(result.exists || result.uploaded === true || result.fastUpload),
      url: pickUrl(result),
      response: result,
      uploaded: new Set(normalizeChunkList(result.uploadedChunks ?? result.chunks, totalChunks))
    }
  }

  // ③ 并发上传缺失的分片：concurrency 个 worker 轮流领取分片下标
  //    整体进度 = 已完成分片字节数 + 在途分片已发送字节数
  const uploadChunks = async (fileHash, totalChunks, uploadId, uploaded) => {
    const pending = Array.from({ length: totalChunks }, (_, index) => index).filter((index) => !uploaded.has(index))
    const inflight = new Map() // index → 已发送字节
    let doneBytes = [...uploaded].reduce((sum, index) => sum + chunkLength(file, index, chunkSize), 0)

    const report = () => {
      const partialBytes = [...inflight.values()].reduce((sum, loaded) => sum + loaded, 0)
      update({
        percent: file.size ? Math.min(100, ((doneBytes + partialBytes) / file.size) * 100) : 100,
        uploadedChunks: uploaded.size
      })
    }

    // 单个分片：失败自动重试 maxRetry 次；中止与不可重试的错误直接抛出
    const uploadOne = async (index) => {
      const chunk = file.slice(index * chunkSize, (index + 1) * chunkSize)
      for (let attempt = 0; ; attempt += 1) {
        throwIfAborted(signal)
        inflight.set(index, 0)
        try {
          await api.uploadChunk({
            ...buildContext(fileHash, totalChunks, uploadId),
            chunk,
            index,
            onProgress: (loaded, total) => {
              inflight.set(index, total ? Math.min(loaded, chunk.size) : chunk.size)
              report()
            }
          })
          break
        } catch (error) {
          inflight.delete(index)
          if (isAbortError(error) || error.retryable === false || attempt >= options.maxRetry) throw error
          await delay(options.retryDelay, signal)
        }
      }
      inflight.delete(index)
      uploaded.add(index)
      doneBytes += chunk.size
      report()
    }

    let cursor = 0
    const worker = async () => {
      while (cursor < pending.length) {
        throwIfAborted(signal)
        await uploadOne(pending[cursor++])
      }
    }

    update({ status: 'uploading', uploadedChunks: uploaded.size })
    report()
    await Promise.all(Array.from({ length: Math.min(options.concurrency, pending.length) }, worker))
  }

  // ④ 合并
  const merge = async (fileHash, totalChunks, uploadId) => {
    update({ status: 'merging', percent: 99, uploadedChunks: totalChunks })
    return unwrap(await api.merge(buildContext(fileHash, totalChunks, uploadId)))
  }

  const execute = async () => {
    update({ error: '', method: '分片上传' })
    const fileHash = await hashFile()
    const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize))

    const verified = await verify(fileHash, totalChunks)
    if (verified.fast) {
      return { method: 'fast', url: verified.url, response: verified.response }
    }

    await uploadChunks(fileHash, totalChunks, verified.uploadId, verified.uploaded)
    const merged = await merge(fileHash, totalChunks, verified.uploadId)
    return { method: 'chunk', url: pickUrl(merged), response: merged }
  }

  const run = async () => {
    try {
      const result = await execute()
      // 取消时即便自定义 api 没响应中止信号、流程仍跑完了，也不再对外报告成功
      return intent === 'cancel' ? { type: 'cancel' } : { type: 'success', ...result }
    } catch (error) {
      return { type: intent || 'error', error }
    } finally {
      // 不论成功、失败还是中止都掐掉仍在途的请求（例如某个分片重试耗尽时，其余分片可能还在传）
      controller.abort()
    }
  }

  const stop = (reason) => {
    intent = reason
    controller.abort()
  }

  return { run, pause: () => stop('pause'), cancel: () => stop('cancel') }
}
