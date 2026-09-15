/**
 * @module 站内消息通知 Controller
 * @description HTTP 适配层，业务逻辑委托给 notificationService
 */

import * as notificationService from './notificationService.js'
import { businessCode, businessMsg } from '../../config/businessCode.js'
import { createSuccessResponse, createFailResponse } from '../../utils/createResponse.js'

/**
 * 发送公告（管理端）
 */
const sendNotification = async (ctx) => {
  const senderId = ctx.state.user?.userId
  const senderName = ctx.state.user?.userName || ctx.state.user?.username || ''

  const result = await notificationService.sendNotification(senderId, senderName, ctx.request.body)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '发送公告成功', result.data)
}

/**
 * 获取公告列表（管理端）
 */
const listNotifications = async (ctx) => {
  const data = await notificationService.listNotifications(ctx.query)
  ctx.body = createSuccessResponse(businessCode.success, '获取公告列表成功', data)
}

/**
 * 删除公告（管理端）
 */
const deleteNotification = async (ctx) => {
  const notificationId = ctx.request.body.id || ctx.request.body.notificationId
  const result = await notificationService.deleteNotification(notificationId)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '删除公告成功')
}

/**
 * 获取当前用户消息列表（用户侧）
 */
const listUserNotifications = async (ctx) => {
  const userId = ctx.state.user?.userId
  const data = await notificationService.listUserNotifications(userId, ctx.query)
  ctx.body = createSuccessResponse(businessCode.success, '获取消息列表成功', data)
}

/**
 * 获取当前用户未读消息数（用户侧）
 */
const getUnreadCount = async (ctx) => {
  const userId = ctx.state.user?.userId
  const data = await notificationService.getUnreadCount(userId)
  ctx.body = createSuccessResponse(businessCode.success, '获取未读数成功', data)
}

/**
 * 标记单条消息已读（用户侧）
 */
const markAsRead = async (ctx) => {
  const userId = ctx.state.user?.userId
  const notificationId = ctx.request.body.id || ctx.request.body.notificationId
  const result = await notificationService.markAsRead(userId, notificationId)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '标记已读成功')
}

/**
 * 标记全部消息已读（用户侧）
 */
const markAllAsRead = async (ctx) => {
  const userId = ctx.state.user?.userId
  const result = await notificationService.markAllAsRead(userId)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '全部标记已读成功')
}

export default {
  sendNotification,
  listNotifications,
  deleteNotification,
  listUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}
