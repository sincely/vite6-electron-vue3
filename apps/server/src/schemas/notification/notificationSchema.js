import { z } from 'zod'
import { createPaginatedQuerySchema } from '../common/paginationSchema.js'

const notificationTypeEnum = z.enum(['1', '2', '3'])

const targetTypeEnum = z.enum(['1', '2'])

const notificationStatusEnum = z.enum(['1', '2'])

// 公告列表查询参数（管理端）
export const NotificationListQuerySchema = createPaginatedQuerySchema({
  title: z.string().max(200).optional(),
  type: notificationTypeEnum.optional(),
  status: notificationStatusEnum.optional()
})

// 发送公告请求体
export const NotificationCreateBodySchema = z.object({
  title: z.string().min(1, '公告标题不能为空').max(200, '公告标题最长 200 位'),
  content: z.string().max(10000, '公告内容最长 10000 位').optional().default(''),
  type: notificationTypeEnum.default('1'),
  targetType: targetTypeEnum.default('1'),
  userIds: z.array(z.coerce.number().int().positive()).optional().default([]),
  expireTime: z.string().datetime({ offset: true }).nullable().optional().default(null)
})

// 删除公告请求体
export const NotificationDeleteBodySchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    notificationId: z.coerce.number().int().positive().optional()
  })
  .refine((data) => Boolean(data.id || data.notificationId), {
    message: '公告ID不能为空'
  })

// 消息中心查询参数（用户侧）
export const MessageListQuerySchema = createPaginatedQuerySchema({
  isRead: z.enum(['1', '2']).optional()
})

// 标记已读请求体
export const MessageReadBodySchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    notificationId: z.coerce.number().int().positive().optional()
  })
  .refine((data) => Boolean(data.id || data.notificationId), {
    message: '公告ID不能为空'
  })
