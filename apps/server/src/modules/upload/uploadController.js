/**
 * @module 文件上传 Controller
 * @description HTTP 适配层，业务逻辑委托给 uploadService。协议：
 *   POST /upload/verify  JSON → 秒传 / 已上传分片
 *   POST /upload/chunk   query 带元信息，请求体为分片二进制流
 *   POST /upload/merge   JSON → 合并并返回文件地址
 *   POST /upload/cancel  JSON → 清理临时分片
 */

import * as uploadService from './uploadService.js'
import { businessCode, businessMsg } from '../../config/businessCode.js'
import { createSuccessResponse, createFailResponse } from '../../core/response.js'
import { uploadConfig } from '../../config/upload.js'

const respondFail = (ctx, result) => {
  ctx.body = createFailResponse(result.code, result.msg || businessMsg[result.code], result.data)
}

/** 成品经静态目录对外访问，需返回含域名的绝对地址（渲染进程与服务端不同源）；Koa 3 的 ctx.origin 是 Origin 请求头，不能用 */
const buildFileUrl = (ctx, storedName) =>
  `${ctx.protocol}://${ctx.host}${uploadConfig.filePublicPath}/${encodeURIComponent(storedName)}`

/**
 * 秒传 / 断点续传校验
 */
const verify = async (ctx) => {
  const result = await uploadService.verifyUpload(ctx.state.user.userId, ctx.request.body)
  if (!result.success) {
    return respondFail(ctx, result)
  }
  const { exists, storedName, uploadedChunks } = result.data
  ctx.body = createSuccessResponse(businessCode.success, exists ? '文件已存在，秒传成功' : '校验成功', {
    exists,
    url: exists ? buildFileUrl(ctx, storedName) : undefined,
    uploadedChunks
  })
}

/**
 * 上传单个分片：请求体即分片本身，直接以流写盘，不经过 body 解析
 */
const uploadChunk = async (ctx) => {
  const { chunkIndex, ...meta } = ctx.state.data
  const result = await uploadService.saveChunk(ctx.state.user.userId, meta, chunkIndex, ctx.req)
  if (!result.success) {
    return respondFail(ctx, result)
  }
  ctx.body = createSuccessResponse(businessCode.success, '分片上传成功', result.data)
}

/**
 * 合并分片
 */
const merge = async (ctx) => {
  const result = await uploadService.mergeUpload(ctx.state.user.userId, ctx.request.body)
  if (!result.success) {
    return respondFail(ctx, result)
  }
  const { storedName, size } = result.data
  ctx.body = createSuccessResponse(businessCode.success, '文件合并成功', { url: buildFileUrl(ctx, storedName), size })
}

/**
 * 取消上传
 */
const cancel = async (ctx) => {
  await uploadService.cancelUpload(ctx.state.user.userId, ctx.request.body.fileHash)
  ctx.body = createSuccessResponse(businessCode.success, '已取消上传')
}

export default { verify, uploadChunk, merge, cancel }
