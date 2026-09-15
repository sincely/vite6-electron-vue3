import Router from '@koa/router'
import NotificationController from './notificationController.js'
import authenticate from '../../middleware/authenticate.js'
import authorizeRoute from '../../middleware/authorize.js'
import { validateBody, validateQuery } from '../../middleware/validationMiddleware.js'
import { errorControllerWrapper } from '../../utils/errorHandler.js'
import {
  NotificationCreateBodySchema,
  NotificationDeleteBodySchema,
  NotificationListQuerySchema,
  MessageListQuerySchema,
  MessageReadBodySchema
} from '../../schemas/notification/notificationSchema.js'

/**
 * 管理端公告管理路由（挂载到 systemManageRouter 下）
 */
const notificationManageRouter = new Router()

const useNotificationManagePermission = [authenticate, authorizeRoute('/manage/notification')]

// 获取公告列表
notificationManageRouter.get(
  '/systemManage/getNotificationList',
  ...useNotificationManagePermission,
  validateQuery(NotificationListQuerySchema),
  errorControllerWrapper(NotificationController.listNotifications)
)

// 发送公告
notificationManageRouter.post(
  '/systemManage/saveNotification',
  ...useNotificationManagePermission,
  validateBody(NotificationCreateBodySchema),
  errorControllerWrapper(NotificationController.sendNotification)
)

// 删除公告
notificationManageRouter.post(
  '/systemManage/deleteNotification',
  ...useNotificationManagePermission,
  validateBody(NotificationDeleteBodySchema),
  errorControllerWrapper(NotificationController.deleteNotification)
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
  validateQuery(MessageListQuerySchema),
  errorControllerWrapper(NotificationController.listUserNotifications)
)

// 获取当前用户未读消息数
notificationUserRouter.get(
  '/message/getMessageUnreadCount',
  authenticate,
  errorControllerWrapper(NotificationController.getUnreadCount)
)

// 标记单条消息已读
notificationUserRouter.post(
  '/message/readMessage',
  authenticate,
  validateBody(MessageReadBodySchema),
  errorControllerWrapper(NotificationController.markAsRead)
)

// 标记全部消息已读
notificationUserRouter.post(
  '/message/readAllMessage',
  authenticate,
  errorControllerWrapper(NotificationController.markAllAsRead)
)
