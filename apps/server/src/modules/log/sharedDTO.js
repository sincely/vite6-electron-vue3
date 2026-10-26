import { z } from 'zod'
import { createPaginatedQueryDto } from '../../shared/pagination.js'

const statusEnum = z.enum(['0', '1'])

// 操作日志列表查询参数
export const OperationLogListQueryDto = createPaginatedQueryDto({
  username: z.string().max(50).optional(),
  module: z.string().max(50).optional(),
  action: z.string().max(100).optional(),
  status: statusEnum.optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional()
})

// 登录日志列表查询参数
export const LoginLogListQueryDto = createPaginatedQueryDto({
  username: z.string().max(50).optional(),
  ipAddress: z.string().max(45).optional(),
  status: statusEnum.optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional()
})

// 批量删除日志请求体
export const LogBatchDeleteBodyDto = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, '至少选择一条日志')
})

// 单条删除日志请求体
export const LogSingleDeleteBodyDto = z.object({
  id: z.coerce.number().int().positive('日志ID必须为正整数')
})
