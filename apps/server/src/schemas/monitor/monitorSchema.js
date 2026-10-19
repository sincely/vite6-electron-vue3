import { z } from 'zod'
import { createPaginatedQuerySchema } from '../common/paginationSchema.js'

// 在线用户列表查询参数
export const OnlineUserListQuerySchema = createPaginatedQuerySchema({
  username: z.string().max(50).optional(),
  ipAddress: z.string().max(45).optional()
})

// 强制下线请求体
export const ForceLogoutBodySchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空').max(64)
})
