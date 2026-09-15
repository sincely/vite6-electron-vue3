/**
 * @module 站内消息通知 Service
 * @description 封装公告发送、消息列表、未读数、已读标记等业务逻辑
 */

import notificationDao from './notificationDao.js'
import { businessCode } from '../../config/businessCode.js'
import { normalizePagination } from '../../schemas/common/paginationSchema.js'

const toDbType = (value) => Number(value)

const formatNotificationRow = (notification) => ({
  id: notification.id,
  notificationId: notification.id,
  title: notification.title,
  content: notification.content ?? '',
  type: notification.type,
  targetType: notification.target_type,
  senderId: notification.sender_id,
  senderName: notification.sender_name ?? '',
  status: notification.status,
  expireTime: notification.expire_time,
  createTime: notification.create_time
})

const formatMessageRow = (message) => ({
  id: message.id,
  notificationId: message.id,
  title: message.title,
  content: message.content ?? '',
  type: message.type,
  senderName: message.sender_name ?? '',
  createTime: message.create_time,
  isRead: Number(message.is_read)
})

/**
 * 发送公告
 * @param {number} senderId 发送人用户ID
 * @param {string} senderName 发送人用户名
 * @param {{title, content, type, targetType, userIds, expireTime}} body
 */
export const sendNotification = async (senderId, senderName, body) => {
  const { title, content, type, targetType, userIds = [], expireTime } = body
  const normalizedTargetType = toDbType(targetType)

  if (normalizedTargetType === 2 && userIds.length === 0) {
    return { success: false, code: businessCode.notificationTargetEmpty }
  }

  const result = await notificationDao.sendNotification({
    title,
    content,
    type: toDbType(type),
    target_type: normalizedTargetType,
    sender_id: senderId,
    sender_name: senderName,
    expire_time: expireTime,
    userIds
  })

  return { success: true, data: { id: result.id } }
}

/**
 * 获取公告列表（管理端）
 */
export const listNotifications = async (query) => {
  const { current, size, page, pageSize, title, type, status } = query
  const { actualPage, actualPageSize } = normalizePagination({ current, size, page, pageSize })

  const filterParams = {
    title: title || '',
    type,
    status
  }

  const [notifications, total] = await Promise.all([
    notificationDao.listNotifications({ page: actualPage, pageSize: actualPageSize, ...filterParams }),
    notificationDao.countNotifications(filterParams)
  ])

  return {
    records: notifications.map(formatNotificationRow),
    current: actualPage,
    size: actualPageSize,
    total: Number(total)
  }
}

/**
 * 删除公告
 */
export const deleteNotification = async (idOrNotificationId) => {
  const notificationId = Number(idOrNotificationId)

  const currentNotification = await notificationDao.findNotificationById(notificationId)
  if (!currentNotification) {
    return { success: false, code: businessCode.notificationNotFound }
  }

  await notificationDao.deleteNotification(notificationId)
  return { success: true }
}

/**
 * 获取当前用户可见的消息列表（用户侧）
 */
export const listUserNotifications = async (userId, query) => {
  const { current, size, page, pageSize, isRead } = query
  const { actualPage, actualPageSize } = normalizePagination({ current, size, page, pageSize })

  const [messages, total] = await Promise.all([
    notificationDao.listUserNotifications({ userId, page: actualPage, pageSize: actualPageSize, isRead }),
    notificationDao.countUserNotifications({ userId, isRead })
  ])

  return {
    records: messages.map(formatMessageRow),
    current: actualPage,
    size: actualPageSize,
    total: Number(total)
  }
}

/**
 * 获取当前用户未读消息数
 */
export const getUnreadCount = async (userId) => {
  const total = await notificationDao.countUnread(userId)
  return { unreadCount: Number(total) }
}

/**
 * 标记单条消息已读
 */
export const markAsRead = async (userId, idOrNotificationId) => {
  const notificationId = Number(idOrNotificationId)

  const currentNotification = await notificationDao.findNotificationById(notificationId)
  if (!currentNotification) {
    return { success: false, code: businessCode.notificationNotFound }
  }

  await notificationDao.markAsRead(userId, notificationId)
  return { success: true }
}

/**
 * 标记当前用户全部消息已读
 */
export const markAllAsRead = async (userId) => {
  await notificationDao.markAllAsRead(userId)
  return { success: true }
}
