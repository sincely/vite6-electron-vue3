import { z } from 'zod'
import { createPaginatedQueryDto } from '../../shared/pagination.js'

// 在线用户列表查询参数
export const OnlineUserListQueryDto = createPaginatedQueryDto({
  username: z.string().max(50).optional(),
  ipAddress: z.string().max(45).optional()
})

// 强制下线请求体
export const ForceLogoutBodyDto = z.object({
  sessionId: z.string().min(1, '会话ID不能为空').max(64)
})
