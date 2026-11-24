import { z } from 'zod'

// 文件指纹：由长度区分算法（32 = MD5，40 = SHA-1，64 = SHA-256），统一小写
const fileHash = z
  .string()
  .regex(/^(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/i, '文件哈希格式不正确（支持 MD5 / SHA-1 / SHA-256 十六进制）')
  .transform((value) => value.toLowerCase())

const fileName = z.string().trim().min(1, '文件名不能为空').max(255, '文件名最长 255 位')

const intField = (label, min) =>
  z.coerce
    .number({ error: `${label}必须是数字` })
    .int(`${label}必须是整数`)
    .min(min, `${label}不合法`)

// 分片协议公共字段：每个请求自带完整元信息，服务端不保存会话状态
const uploadMetaShape = {
  fileHash,
  fileSize: intField('文件大小', 0),
  chunkSize: intField('分片大小', 1),
  totalChunks: intField('分片总数', 1)
}

// 秒传 / 断点续传校验请求体
export const UploadVerifyBodyDto = z.object({ ...uploadMetaShape, fileName })

// 分片上传 query（分片本体走请求体二进制流）
export const UploadChunkQueryDto = z.object({ ...uploadMetaShape, chunkIndex: intField('分片序号', 0) })

// 合并分片请求体
export const UploadMergeBodyDto = z.object({ ...uploadMetaShape, fileName })

// 取消上传请求体
export const UploadCancelBodyDto = z.object({ fileHash })
