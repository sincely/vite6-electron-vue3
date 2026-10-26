import Router from '@koa/router'
import notificationController from './notificationController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validation.js'
import { errorControllerWrapper } from '../../core/errors.js'
import {
  NotificationCreateBodyDto,
  NotificationDeleteBodyDto,
  NotificationListQueryDto,
  MessageListQueryDto,
  MessageReadBodyDto
} from './notificationDto.js'

/**
 * 管理端公告管理路由（挂载到 systemManageRouter 下）
 */
export const notificationManageRouter = new Router()

const useNotificationManagePermission = [authenticate, authorizeRoute('/manage/notification')]

// 获取公告列表
notificationManageRouter.get(
  '/systemManage/getNotificationList',
  ...useNotificationManagePermission,
  validateQuery(NotificationListQueryDto),
  errorControllerWrapper(notificationController.listNotifications)
)

// 发送公告
notificationManageRouter.post(
  '/systemManage/saveNotification',
  ...useNotificationManagePermission,
  validateBody(NotificationCreateBodyDto),
  errorControllerWrapper(notificationController.sendNotification)
)

// 删除公告
notificationManageRouter.post(
  '/systemManage/deleteNotification',
  ...useNotificationManagePermission,
  validateBody(NotificationDeleteBodyDto),
  errorControllerWrapper(notificationController.deleteNotification)
)

export default notificationManageRouter

/**
 * 用户侧消息路由（仅需登录，无需菜单权限）
 */
export const notificationUserRouter = new Router()

// 获取当前用户消息列表
notificationUserRouter.get(
  '/message/getMessageList',
  authenticate,
  validateQuery(MessageListQueryDto),
  errorControllerWrapper(notificationController.listUserNotifications)
)

// 获取当前用户未读消息数
notificationUserRouter.get(
  '/message/getMessageUnreadCount',
  authenticate,
  errorControllerWrapper(notificationController.getUnreadCount)
)

// 标记单条消息已读
notificationUserRouter.post(
  '/message/readMessage',
  authenticate,
  validateBody(MessageReadBodyDto),
  errorControllerWrapper(notificationController.markAsRead)
)

// 标记全部消息已读
notificationUserRouter.post(
  '/message/readAllMessage',
  authenticate,
  errorControllerWrapper(notificationController.markAllAsRead)
)
