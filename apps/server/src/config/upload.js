/**
 * 大文件上传配置
 *
 * 目录均由静态资源目录推导：
 *   - 成品文件落在 public/uploads，可经 /uploads/<name> 直接访问；
 *   - 分片临时目录落在 public 同级的 storage/chunks，不对外暴露。
 */
import path from 'path'
import './env.js'
import { staticDir } from './server.js'

const MB = 1024 * 1024
const HOUR = 60 * 60 * 1000

const readPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const uploadConfig = {
  // 成品文件目录及其静态访问前缀（两者必须保持对应）
  fileDir: path.join(staticDir, 'uploads'),
  filePublicPath: '/uploads',
  // 分片临时目录
  chunkDir: path.resolve(staticDir, '../storage/chunks'),
  // 单文件上限，默认 10 GB
  maxFileSize: readPositiveInt(process.env.UPLOAD_MAX_FILE_SIZE_MB, 10 * 1024) * MB,
  // 单分片上限，默认 10 MB（需不大于 nginx 的 client_max_body_size）
  maxChunkSize: readPositiveInt(process.env.UPLOAD_MAX_CHUNK_SIZE_MB, 10) * MB,
  // 单分片下限，避免用极小分片制造海量文件
  minChunkSize: 256 * 1024,
  // 未合并分片的保留时长，默认 24 小时
  chunkTtlMs: readPositiveInt(process.env.UPLOAD_CHUNK_TTL_HOURS, 24) * HOUR
}

export default uploadConfig
