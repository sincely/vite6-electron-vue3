// 与服务端交互的三类接口：verify / uploadChunk / merge。
// 默认走 `${action}`、`${action}/verify`、`${action}/merge` 协议；
// 调用方可通过 props.api 完全接管，适配任意后端或云存储。

const collectHeaders = (headers) => ({ ...headers })

const collectExtraData = (data, context) => {
  const result = typeof data === 'function' ? data(context) : data
  return result && typeof result === 'object' ? result : {}
}

const requestJson = async (
  url,
  headers,
  body,
  withCredentials,
  context,
  data
) => {
  if (!url) throw new Error('未配置上传接口，请传入 action 或 api')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...collectHeaders(headers) },
    credentials: withCredentials ? 'include' : 'same-origin',
    body: JSON.stringify({ ...collectExtraData(data, context), ...body })
  })
  if (!response.ok) throw new Error(`请求失败（${response.status}）`)
  const text = await response.text()
  return text ? JSON.parse(text) : {}
}

const buildUrl = (base, suffix) =>
  base ? `${base.replace(/\/$/, '')}${suffix}` : ''

/**
 * 校验文件秒传 / 已上传分片信息。
 * 默认协议：POST `${verifyUrl || action}/verify`
 * 期望返回字段：{ exists?, url?, uploadId?, uploadedChunks? }
 */
export const callVerify = (context, options) => {
  const { action, verifyUrl, api, headers, data, withCredentials } = options
  if (typeof api?.verify === 'function') return api.verify(context)
  const url = verifyUrl || buildUrl(action, '/verify')
  return requestJson(
    url,
    headers,
    {
      fileHash: context.fileHash,
      fileName: context.file.name,
      fileSize: context.file.size,
      totalChunks: context.totalChunks,
      chunkSize: context.chunkSize
    },
    withCredentials,
    context,
    data
  )
}

/**
 * 通知服务端合并分片。
 * 默认协议：POST `${mergeUrl || action}/merge`
 * 期望返回字段：{ url?, fileUrl?, downloadUrl? }
 */
export const callMerge = (context, options) => {
  const { action, mergeUrl, api, headers, data, withCredentials } = options
  if (typeof api?.merge === 'function') return api.merge(context)
  const url = mergeUrl || buildUrl(action, '/merge')
  return requestJson(
    url,
    headers,
    {
      uploadId: context.uploadId,
      fileHash: context.fileHash,
      fileName: context.file.name,
      fileSize: context.file.size,
      totalChunks: context.totalChunks,
      chunkSize: context.chunkSize
    },
    withCredentials,
    context,
    data
  )
}

/**
 * 上传单个分片。
 * 默认走 XMLHttpRequest（为了拿到 upload.onprogress 进度回调）。
 * 调用方可通过 api.uploadChunk 自行实现，例如改用对象存储 SDK。
 */
export const callUploadChunk = (context, options) => {
  const { action, chunkUrl, api, headers, data, withCredentials, chunkField } =
    options
  if (typeof api?.uploadChunk === 'function') return api.uploadChunk(context)

  const url = chunkUrl || action
  if (!url)
    return Promise.reject(
      new Error('未配置分片上传接口，请传入 action 或 api.uploadChunk')
    )

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    context.task.activeXhrs.add(xhr)
    xhr.open('POST', url, true)
    xhr.withCredentials = withCredentials
    Object.entries(collectHeaders(headers)).forEach(([key, value]) =>
      xhr.setRequestHeader(key, value)
    )
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) context.onProgress(event.loaded, event.total)
    }
    xhr.onload = () => {
      context.task.activeXhrs.delete(xhr)
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : {})
        } catch {
          resolve({})
        }
      } else {
        reject(new Error(`分片 ${context.index + 1} 上传失败（${xhr.status}）`))
      }
    }
    xhr.onerror = () => {
      context.task.activeXhrs.delete(xhr)
      reject(new Error(`分片 ${context.index + 1} 网络异常`))
    }
    xhr.onabort = () => {
      context.task.activeXhrs.delete(xhr)
      reject(new Error('上传已取消'))
    }

    const formData = new FormData()
    const extra = collectExtraData(data, context)
    Object.entries(extra).forEach(([key, value]) => formData.append(key, value))
    formData.append(chunkField, context.chunk, context.file.name)
    formData.append('fileHash', context.fileHash)
    formData.append('fileName', context.file.name)
    formData.append('fileSize', String(context.file.size))
    formData.append('chunkIndex', String(context.index))
    formData.append('totalChunks', String(context.totalChunks))
    formData.append('chunkSize', String(context.chunkSize))
    if (context.uploadId) formData.append('uploadId', context.uploadId)
    xhr.send(formData)
  })
}
