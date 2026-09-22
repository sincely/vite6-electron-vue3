/**
 * @module AI 网关路由
 * @description 仅需登录，无需菜单权限；/ai/chat 为 SSE 长连接，不走操作日志中间件
 */

import Router from '@koa/router'
import AiController from './aiController.js'
import authenticate from '../../middleware/authenticate.js'
import { validateBody } from '../../middleware/validationMiddleware.js'
import { AiChatBodySchema } from '../../schemas/ai/aiSchema.js'
import { errorControllerWrapper } from '../../utils/errorHandler.js'

const aiRouter = new Router()

// 获取网关状态（前端状态栏展示）
aiRouter.get('/ai/status', authenticate, errorControllerWrapper(AiController.status))

// 流式会话（SSE）：错误以 error 事件帧下发，不走统一错误包装
aiRouter.post('/ai/chat', authenticate, validateBody(AiChatBodySchema), AiController.chat)

export default aiRouter
