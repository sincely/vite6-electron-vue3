/**
 * 站内消息通知模块
 *
 * 职责：公告发送（管理端）、消息列表/未读数/已读（用户侧）
 */

export { default as notificationController } from './notificationController.js'

export * as notificationService from './notificationService.js'

export { default as notificationDao } from './notificationDao.js'

export { default as notificationManageRouter, notificationUserRouter } from './notificationRouter.js'
