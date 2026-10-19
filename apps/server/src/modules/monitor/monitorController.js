/**
 * @module 系统监控 Controller
 * @description HTTP 适配层，业务逻辑委托给 monitorService
 */

import * as monitorService from './monitorService.js'
import { businessCode, businessMsg } from '../../config/businessCode.js'
import { createSuccessResponse, createFailResponse } from '../../utils/createResponse.js'

/**
 * 监控总览
 */
const getOverview = async (ctx) => {
  const data = await monitorService.getOverview()
  ctx.body = createSuccessResponse(businessCode.success, '获取监控总览成功', data)
}

/**
 * 在线用户列表
 */
const listOnlineUsers = async (ctx) => {
  const data = await monitorService.listOnlineUsers(ctx.query, ctx.state.user?.sessionId)
  ctx.body = createSuccessResponse(businessCode.success, '获取在线用户成功', data)
}

/**
 * 强制下线指定会话
 */
const forceLogout = async (ctx) => {
  const result = await monitorService.forceLogout({
    sessionId: ctx.request.body.sessionId,
    operatorSessionId: ctx.state.user?.sessionId
  })

  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }

  ctx.body = createSuccessResponse(businessCode.success, `已强制下线 ${result.data.username}`)
}

export default { getOverview, listOnlineUsers, forceLogout }
