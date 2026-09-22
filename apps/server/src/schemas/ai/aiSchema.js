import { z } from 'zod'

// AI 流式会话请求体
export const AiChatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1, '消息内容不能为空').max(8000, '单条消息最长 8000 位')
      })
    )
    .min(1, '会话记录不能为空')
    .max(50, '会话记录最多 50 条'),
  // 会话标识（预留：后续做多轮会话持久化时使用）
  sessionId: z.string().max(64).optional()
})
