/**
 * @module 文件上传 Service
 * @description 大文件分片上传的业务规则：
 *   verify（秒传 / 断点续传）→ saveChunk（分片落盘）→ mergeUpload（合并并校验哈希）→ cancelUpload（清理）
 *   服务端不保存会话状态，每个请求自带完整元信息，分片是否已上传以磁盘实际内容为准。
 */

import path from 'path'
import uploadDao from './uploadDao.js'
import { uploadConfig } from '../../config/upload.js'
import { businessCode } from '../../config/businessCode.js'

const MB = 1024 * 1024
const KB = 1024

// 哈希长度 → 算法，与前端 hash-wasm 输出一致
const HASH_ALGORITHMS = { 32: 'md5', 40: 'sha1', 64: 'sha256' }

// 经静态目录直出时会被浏览器当作可执行内容的类型，一律落为 .bin（按下载处理），避免同源存储型 XSS
const ACTIVE_CONTENT_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.xhtml',
  '.shtml',
  '.svg',
  '.svgz',
  '.xml',
  '.xsl',
  '.xslt',
  '.js',
  '.mjs',
  '.cjs'
])

// 客户端主动断开（暂停 / 取消 / 断网）时 pipeline 抛出的错误码
const ABORTED_CODES = new Set(['ERR_STREAM_PREMATURE_CLOSE', 'ECONNRESET', 'ERR_STREAM_DESTROYED'])

const ok = (data) => ({ success: true, data })

const fail = (code, msg, data) => ({ success: false, code, msg, data })

/** 成品文件名：<哈希><安全扩展名>，原始文件名不参与落盘 */
const buildStoredName = ({ fileHash, fileName }) => {
  const extension = path.extname(fileName).toLowerCase()
  if (!/^\.[a-z0-9]{1,10}$/.test(extension)) {
    return fileHash
  }
  return `${fileHash}${ACTIVE_CONTENT_EXTENSIONS.has(extension) ? '.bin' : extension}`
}

/** 第 index 片应有的字节数（最后一片可能不足 chunkSize） */
const expectedChunkLength = ({ fileSize, chunkSize, totalChunks }, index) =>
  index < totalChunks - 1 ? chunkSize : fileSize - chunkSize * (totalChunks - 1)

/** 校验元信息边界；通过返回 null，否则返回可直接响应的失败结果 */
const validateMeta = ({ fileSize, chunkSize, totalChunks }) => {
  if (fileSize > uploadConfig.maxFileSize) {
    return fail(businessCode.uploadFileTooLarge, `文件超过 ${uploadConfig.maxFileSize / MB} MB 的大小限制`)
  }
  if (chunkSize < uploadConfig.minChunkSize || chunkSize > uploadConfig.maxChunkSize) {
    return fail(
      businessCode.paramError,
      `分片大小需在 ${uploadConfig.minChunkSize / KB} KB ~ ${uploadConfig.maxChunkSize / MB} MB 之间`
    )
  }
  if (totalChunks !== Math.max(1, Math.ceil(fileSize / chunkSize))) {
    return fail(businessCode.paramError, '分片总数与文件大小、分片大小不匹配')
  }
  return null
}

const listUploadedChunks = (userId, meta) =>
  uploadDao.listChunks(
    uploadDao.resolveSessionDir(userId, meta.fileHash, meta.chunkSize),
    (index) => expectedChunkLength(meta, index),
    meta.totalChunks
  )

/**
 * 秒传 / 断点续传校验：成品已存在则秒传，否则返回已落盘的分片下标
 * @returns {Promise<{success: boolean, code?: number, msg?: string, data?: {exists: boolean, storedName?: string, uploadedChunks: number[]}}>}
 */
export const verifyUpload = async (userId, meta) => {
  const invalid = validateMeta(meta)
  if (invalid) {
    return invalid
  }

  const storedName = buildStoredName(meta)
  if (await uploadDao.hasFinalFile(storedName, meta.fileSize)) {
    return ok({ exists: true, storedName, uploadedChunks: [] })
  }

  await uploadDao.touchSession(uploadDao.resolveSessionDir(userId, meta.fileHash, meta.chunkSize))
  return ok({ exists: false, uploadedChunks: await listUploadedChunks(userId, meta) })
}

/**
 * 保存一个分片（幂等：重复上传同一分片会原子替换）
 * @param {number} userId
 * @param {object} meta 文件元信息（fileHash / fileSize / chunkSize / totalChunks）
 * @param {number} chunkIndex
 * @param {import('stream').Readable} source 分片二进制流
 */
export const saveChunk = async (userId, meta, chunkIndex, source) => {
  const invalid = validateMeta(meta)
  if (invalid) {
    return invalid
  }
  if (chunkIndex >= meta.totalChunks) {
    return fail(businessCode.paramError, '分片序号超出范围')
  }

  const sessionDir = uploadDao.resolveSessionDir(userId, meta.fileHash, meta.chunkSize)
  try {
    await uploadDao.writeChunk(sessionDir, chunkIndex, source, expectedChunkLength(meta, chunkIndex))
  } catch (error) {
    if (error.code === 'CHUNK_SIZE_MISMATCH') {
      return fail(businessCode.uploadChunkInvalid)
    }
    if (ABORTED_CODES.has(error.code)) {
      return fail(businessCode.error, '分片上传已中断')
    }
    throw error
  }
  return ok({ index: chunkIndex })
}

/**
 * 合并分片为成品并校验哈希（幂等：成品已存在直接返回）
 * @returns {Promise<{success: boolean, code?: number, msg?: string, data?: {storedName: string, size: number}}>}
 */
export const mergeUpload = async (userId, meta) => {
  const invalid = validateMeta(meta)
  if (invalid) {
    return invalid
  }

  const storedName = buildStoredName(meta)
  const merged = ok({ storedName, size: meta.fileSize })
  if (await uploadDao.hasFinalFile(storedName, meta.fileSize)) {
    return merged
  }

  const uploaded = await listUploadedChunks(userId, meta)
  if (uploaded.length !== meta.totalChunks) {
    return fail(
      businessCode.uploadChunkMissing,
      `缺少 ${meta.totalChunks - uploaded.length} 个分片，请重新校验后继续上传`
    )
  }

  const sessionDir = uploadDao.resolveSessionDir(userId, meta.fileHash, meta.chunkSize)
  try {
    await uploadDao.mergeChunksToFile({
      sessionDir,
      totalChunks: meta.totalChunks,
      storedName,
      algorithm: HASH_ALGORITHMS[meta.fileHash.length],
      expectedHash: meta.fileHash
    })
  } catch (error) {
    if (error.code === 'HASH_MISMATCH') {
      // 分片内容已不可信，整体丢弃，让客户端从头重传
      await uploadDao.removeSession(sessionDir)
      return fail(businessCode.uploadHashMismatch)
    }
    // 并发合并：另一个请求已先产出成品并清理了分片
    if (await uploadDao.hasFinalFile(storedName, meta.fileSize)) {
      return merged
    }
    throw error
  }

  await uploadDao.removeSession(sessionDir)
  return merged
}

/** 取消上传：清理当前用户该文件的全部临时分片（幂等） */
export const cancelUpload = async (userId, fileHash) => {
  await uploadDao.removeSessionsByHash(userId, fileHash)
  return ok(null)
}

/** 清理超过保留时长仍未合并的分片目录，供定时任务调用 */
export const cleanupExpiredChunks = async () => {
  const removed = await uploadDao.removeExpiredSessions(uploadConfig.chunkTtlMs)
  return ok({ removed })
}
