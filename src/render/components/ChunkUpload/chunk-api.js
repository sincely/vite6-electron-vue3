// 与服务端交互的四类接口：verify / uploadChunk / merge / cancel。
//
// 默认 HTTP 协议（详见 README）：
//   POST ${action}/verify  JSON                    → 秒传 / 已上传分片
//   POST ${action}/chunk   query 带元信息，请求体为分片二进制流
//   POST ${action}/merge   JSON                    → 合并并返回文件地址
//   POST ${action}/cancel  JSON                    → 清理服务端临时分片
// 任意一类都可由 props.api 接管，以适配其他后端或云存储。

import { createAbortError } from './helpers'

const buildUrl = (base, suffix) => (base ? `${base.replace(/\/$/, '')}${suffix}` : '')

/** props.data：附加到每个请求的额外参数，可为对象或返回对象的函数 */
const resolveExtra = (data, context) => {
  const extra = typeof data === 'function' ? data(context) : data
  return extra && typeof extra === 'object' ? extra : {}
}

/** 带 retryable 标记的请求错误：客户端错误（4xx，408 / 429 除外）与业务失败重试也不会成功 */
const createRequestError = (message, { status, business = false } = {}) => {
  const clientError = status >= 400 && status < 500 && status !== 408 && status !== 429
  return Object.assign(new Error(message), { status, retryable: !business && !clientError })
}

const parseJson = (text) => {
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return {}
  }
}

/** 后端业务信封 { code, msg, data }：code 非 200 即失败（HTTP 状态码可能仍是 200） */
const assertBusinessOk = (payload) => {
  if (payload && typeof payload === 'object' && 'code' in payload && payload.code !== 200) {
    throw createRequestError(payload.msg || '请求失败', { business: true })
  }
  return payload
}

const postJson = async (url, body, context, options) => {
  if (!url) throw new Error('未配置上传接口，请传入 action 或 api')
  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: options.withCredentials ? 'include' : 'same-origin',
      body: JSON.stringify({ ...resolveExtra(options.data, context), ...body }),
      signal: context.signal
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw createRequestError('网络异常，请检查网络连接')
  }
  const payload = parseJson(await response.text())
  if (!response.ok) {
    throw createRequestError(payload?.msg || `请求失败（${response.status}）`, { status: response.status })
  }
  return assertBusinessOk(payload)
}

const fileMeta = ({ file, fileHash, totalChunks, chunkSize }) => ({
  fileHash,
  fileName: file.name,
  fileSize: file.size,
  totalChunks,
  chunkSize
})

/** 校验秒传 / 已上传分片。期望返回 { exists?, url?, uploadId?, uploadedChunks? } */
export const callVerify = (context, options) => {
  if (typeof options.api?.verify === 'function') return options.api.verify(context)
  return postJson(options.verifyUrl || buildUrl(options.action, '/verify'), fileMeta(context), context, options)
}

/** 通知服务端合并分片。期望返回 { url? }（亦兼容 fileUrl / downloadUrl） */
export const callMerge = (context, options) => {
  if (typeof options.api?.merge === 'function') return options.api.merge(context)
  return postJson(options.mergeUrl || buildUrl(options.action, '/merge'), fileMeta(context), context, options)
}

/** 通知服务端清理临时分片；未配置任何地址时静默跳过 */
export const callCancel = (context, options) => {
  if (typeof options.api?.cancel === 'function') return options.api.cancel(context)
  const url = options.cancelUrl || buildUrl(options.action, '/cancel')
  return url ? postJson(url, { fileHash: context.fileHash }, context, options) : Promise.resolve()
}

/**
 * 上传单个分片：请求体直接是分片二进制，元信息放 query。
 * 用 XMLHttpRequest 是为了拿到 upload.onprogress 进度；api.uploadChunk 可整体替换（如对象存储 SDK）。
 */
export const callUploadChunk = (context, options) => {
  if (typeof options.api?.uploadChunk === 'function') return options.api.uploadChunk(context)

  const base = options.chunkUrl || buildUrl(options.action, '/chunk')
  if (!base) return Promise.reject(new Error('未配置分片上传接口，请传入 action 或 api.uploadChunk'))

  return new Promise((resolve, reject) => {
    const { signal, chunk, index } = context
    if (signal.aborted) {
      reject(createAbortError())
      return
    }

    const query = new URLSearchParams({
      ...resolveExtra(options.data, context),
      ...fileMeta(context),
      chunkIndex: index
    })
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${base}${base.includes('?') ? '&' : '?'}${query}`)
    xhr.withCredentials = Boolean(options.withCredentials)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    Object.entries(options.headers || {}).forEach(([key, value]) => xhr.setRequestHeader(key, value))

    const onAbort = () => xhr.abort()
    const settle = (callback, value) => {
      signal.removeEventListener('abort', onAbort)
      callback(value)
    }
    signal.addEventListener('abort', onAbort, { once: true })

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) context.onProgress(event.loaded, event.total)
    }
    xhr.onload = () => {
      const payload = parseJson(xhr.responseText)
      if (xhr.status < 200 || xhr.status >= 300) {
        const message = payload?.msg || `分片 ${index + 1} 上传失败（${xhr.status}）`
        settle(reject, createRequestError(message, { status: xhr.status }))
        return
      }
      try {
        settle(resolve, assertBusinessOk(payload))
      } catch (error) {
        settle(reject, error)
      }
    }
    xhr.onerror = () => settle(reject, createRequestError(`分片 ${index + 1} 网络异常`))
    xhr.onabort = () => settle(reject, createAbortError())
    xhr.send(chunk)
  })
}
