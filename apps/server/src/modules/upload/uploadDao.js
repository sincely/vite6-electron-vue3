/**
 * @module 文件上传 Dao
 * @description 数据访问层，存储介质为文件系统：
 *
 *   <chunkDir>/<userId>/<fileHash>_<chunkSize>/<index>   已落盘的完整分片（写入中的 .tmp 文件不计入）
 *   <fileDir>/<fileHash><ext>                            成品文件，内容寻址：同一内容只存一份
 *
 * 所有写入都先落临时文件再 rename，保证对外可见的分片 / 成品一定完整。
 * 业务含义由 Service 赋予，这里只抛出带 `code` 的存储层错误。
 */
import { createReadStream, createWriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { createHash, randomUUID } from 'crypto'
import { Transform } from 'stream'
import { pipeline } from 'stream/promises'
import { uploadConfig } from '../../config/upload.js'

const createStorageError = (code, message) => Object.assign(new Error(message), { code })

const isMissing = (error) => error?.code === 'ENOENT' || error?.code === 'ENOTDIR'

const readDirSafe = async (dir) => {
  try {
    return await fs.readdir(dir)
  } catch (error) {
    if (isMissing(error)) {
      return []
    }
    throw error
  }
}

const statSafe = async (target) => {
  try {
    return await fs.stat(target)
  } catch (error) {
    if (isMissing(error)) {
      return null
    }
    throw error
  }
}

const removeEmptyDir = async (dir) => {
  try {
    await fs.rmdir(dir)
  } catch {
    // 目录非空或已被并发清理，保持原状即可
  }
}

const toSafeSegment = (value) => String(value).replace(/[^\w-]/g, '_')

/** 分片会话目录：按用户隔离，并带上分片大小（分片大小不同则下标含义不同） */
const resolveSessionDir = (userId, fileHash, chunkSize) =>
  path.join(uploadConfig.chunkDir, toSafeSegment(userId), `${fileHash}_${chunkSize}`)

const resolveFilePath = (storedName) => path.join(uploadConfig.fileDir, storedName)

/** 成品是否已存在（大小一致才算，防御残留的异常文件） */
const hasFinalFile = async (storedName, expectedSize) => {
  const stat = await statSafe(resolveFilePath(storedName))
  return Boolean(stat?.isFile() && stat.size === expectedSize)
}

/** 刷新会话目录的修改时间，避免仍在使用的会话被过期清理 */
const touchSession = async (sessionDir) => {
  const now = new Date()
  try {
    await fs.utimes(sessionDir, now, now)
  } catch (error) {
    if (!isMissing(error)) {
      throw error
    }
  }
}

/**
 * 列出会话中已完整落盘的分片下标（升序）
 * @param {string} sessionDir
 * @param {(index: number) => number} expectedLengthOf 第 index 片应有的字节数，不符的视为未上传
 * @param {number} totalChunks
 * @returns {Promise<number[]>}
 */
const listChunks = async (sessionDir, expectedLengthOf, totalChunks) => {
  const indexes = (await readDirSafe(sessionDir))
    .filter((name) => /^\d+$/.test(name))
    .map(Number)
    .filter((index) => index < totalChunks)

  const checked = await Promise.all(
    indexes.map(async (index) => {
      const stat = await statSafe(path.join(sessionDir, String(index)))
      return stat?.isFile() && stat.size === expectedLengthOf(index) ? index : -1
    })
  )
  return checked.filter((index) => index >= 0).sort((a, b) => a - b)
}

/**
 * 把请求体二进制流写成一个分片；长度必须恰好等于 expectedLength
 * @throws {Error} code = CHUNK_SIZE_MISMATCH | 流中断相关错误
 */
const writeChunk = async (sessionDir, index, source, expectedLength) => {
  await fs.mkdir(sessionDir, { recursive: true })
  // 临时名带随机串：同一分片被并发重传时互不覆盖，最终由 rename 原子替换
  const tmpPath = path.join(sessionDir, `${index}.${randomUUID()}.tmp`)

  let received = 0
  const lengthGuard = new Transform({
    transform(data, _encoding, callback) {
      received += data.length
      callback(received > expectedLength ? createStorageError('CHUNK_SIZE_MISMATCH', '分片超出声明大小') : null, data)
    }
  })

  try {
    await pipeline(source, lengthGuard, createWriteStream(tmpPath))
    if (received !== expectedLength) {
      throw createStorageError('CHUNK_SIZE_MISMATCH', '分片小于声明大小')
    }
    await fs.rename(tmpPath, path.join(sessionDir, String(index)))
  } catch (error) {
    await fs.rm(tmpPath, { force: true })
    throw error
  }
}

/**
 * 按下标顺序流式拼接全部分片为成品，同时计算哈希并与 expectedHash 比对
 * @throws {Error} code = HASH_MISMATCH
 */
const mergeChunksToFile = async ({ sessionDir, totalChunks, storedName, algorithm, expectedHash }) => {
  await fs.mkdir(uploadConfig.fileDir, { recursive: true })
  // 点号开头的文件不会被静态服务对外暴露；与成品同目录，rename 才能保证原子替换
  const tmpPath = path.join(uploadConfig.fileDir, `.${storedName}.${randomUUID()}.tmp`)
  const hash = createHash(algorithm)

  const concatChunks = async function* () {
    for (let index = 0; index < totalChunks; index += 1) {
      for await (const data of createReadStream(path.join(sessionDir, String(index)))) {
        hash.update(data)
        yield data
      }
    }
  }

  try {
    await pipeline(concatChunks, createWriteStream(tmpPath))
    if (hash.digest('hex') !== expectedHash) {
      throw createStorageError('HASH_MISMATCH', '合并结果与文件哈希不一致')
    }
    await fs.rename(tmpPath, resolveFilePath(storedName))
  } catch (error) {
    await fs.rm(tmpPath, { force: true })
    throw error
  }
}

const removeSession = (sessionDir) => fs.rm(sessionDir, { recursive: true, force: true })

/** 删除某用户名下同一文件的全部会话（不论分片大小） */
const removeSessionsByHash = async (userId, fileHash) => {
  const userDir = path.join(uploadConfig.chunkDir, toSafeSegment(userId))
  const prefix = `${fileHash}_`
  const sessions = (await readDirSafe(userDir)).filter((name) => name.startsWith(prefix))
  await Promise.all(sessions.map((name) => removeSession(path.join(userDir, name))))
}

/** 删除超过 ttlMs 未更新的会话，返回清理数量 */
const removeExpiredSessions = async (ttlMs) => {
  const threshold = Date.now() - ttlMs
  let removed = 0

  for (const userName of await readDirSafe(uploadConfig.chunkDir)) {
    const userDir = path.join(uploadConfig.chunkDir, userName)
    for (const sessionName of await readDirSafe(userDir)) {
      const sessionDir = path.join(userDir, sessionName)
      const stat = await statSafe(sessionDir)
      if (stat && stat.mtimeMs < threshold) {
        await removeSession(sessionDir)
        removed += 1
      }
    }
    await removeEmptyDir(userDir)
  }
  return removed
}

export default {
  resolveSessionDir,
  hasFinalFile,
  touchSession,
  listChunks,
  writeChunk,
  mergeChunksToFile,
  removeSession,
  removeSessionsByHash,
  removeExpiredSessions
}
