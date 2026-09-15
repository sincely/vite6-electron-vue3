import { query, getConnection } from '../../db/connection.js'

const NOTIFICATION_LIST_COLUMNS = `
  id,
  title,
  content,
  type,
  target_type,
  sender_id,
  sender_name,
  status,
  expire_time,
  create_time
`

const buildNotificationFilters = ({ title, type, status } = {}) => {
  const where = []
  const params = []

  if (title) {
    where.push('title like ?')
    params.push(`%${title}%`)
  }

  if (type !== undefined && type !== null && type !== '') {
    where.push('type = ?')
    params.push(Number(type))
  }

  if (status !== undefined && status !== null && status !== '') {
    where.push('status = ?')
    params.push(Number(status))
  }

  return {
    whereSql: where.length > 0 ? ` where ${where.join(' and ')}` : '',
    params
  }
}

/**
 * 用户侧公告的可见性过滤条件
 * 全部可见（target_type=1）或定向命中当前用户，且未过期
 * @param {number} userId 当前用户ID
 * @returns {{ whereSql: string, params: number[] }}
 */
const buildUserVisibleFilters = (userId) => {
  return {
    whereSql: `
      n.status = 1
      and (n.target_type = 1 or exists (
        select 1 from NotificationTarget t where t.notification_id = n.id and t.user_id = ?
      ))
      and (n.expire_time is null or n.expire_time > now())
    `,
    params: [userId]
  }
}

/**
 * 分页查询公告列表（管理端）
 */
const listNotifications = async ({ page = 1, pageSize = 10, title = '', type, status } = {}) => {
  const { whereSql, params } = buildNotificationFilters({ title, type, status })
  const offset = (Number(page) - 1) * Number(pageSize)
  const sql = `
    select ${NOTIFICATION_LIST_COLUMNS}
    from Notification
    ${whereSql}
    order by id desc
    limit ? offset ?
  `

  return query(sql, [...params, Number(pageSize), offset])
}

/**
 * 统计公告总数（管理端）
 */
const countNotifications = async ({ title = '', type, status } = {}) => {
  const { whereSql, params } = buildNotificationFilters({ title, type, status })
  const sql = `select count(*) as total from Notification${whereSql}`
  const rows = await query(sql, params)
  return rows[0]?.total || 0
}

/**
 * 根据 ID 查询公告
 */
const findNotificationById = async (id) => {
  const sql = `select ${NOTIFICATION_LIST_COLUMNS} from Notification where id = ? limit 1`
  const rows = await query(sql, [id])
  return rows[0] || null
}

/**
 * 创建公告（需在事务内调用）
 */
const createNotification = async ({ title, content, type, target_type, sender_id, sender_name, expire_time }) => {
  const result = await query(
    `insert into Notification (title, content, type, target_type, sender_id, sender_name, status, expire_time)
     values (?, ?, ?, ?, ?, ?, 1, ?)`,
    [title, content, Number(type), Number(target_type), sender_id, sender_name, expire_time]
  )
  return { id: result.insertId, affectedRows: result.affectedRows }
}

/**
 * 批量写入定向受众
 * @param {number} notificationId 公告ID
 * @param {number[]} userIds 目标用户ID数组
 */
const createNotificationTargets = async (notificationId, userIds) => {
  if (!userIds.length) {
    return { affectedRows: 0 }
  }
  const values = userIds.map((userId) => `(${notificationId}, ${Number(userId)})`).join(', ')
  const result = await query(`insert into NotificationTarget (notification_id, user_id) values ${values}`)
  return { affectedRows: result.affectedRows }
}

/**
 * 发送公告（事务）：写入公告 + 定向受众
 * @param {{ title, content, type, target_type, sender_id, sender_name, expire_time, userIds }} payload
 */
const sendNotification = async ({
  title,
  content,
  type,
  target_type,
  sender_id,
  sender_name,
  expire_time,
  userIds
}) => {
  const connection = await getConnection()
  try {
    await connection.beginTransaction()

    const [result] = await connection.execute(
      `insert into Notification (title, content, type, target_type, sender_id, sender_name, status, expire_time)
       values (?, ?, ?, ?, ?, ?, 1, ?)`,
      [title, content, Number(type), Number(target_type), sender_id, sender_name, expire_time]
    )

    if (Number(target_type) === 2 && userIds?.length) {
      const values = userIds.map((userId) => `(${result.insertId}, ${Number(userId)})`).join(', ')
      await connection.execute(`insert into NotificationTarget (notification_id, user_id) values ${values}`)
    }

    await connection.commit()
    return { id: result.insertId }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

/**
 * 分页查询当前用户可见的公告列表（用户侧）
 * @param {{ userId: number, page?: number, pageSize?: number, isRead?: string }} options
 *  - isRead: '1'=已读 '2'=未读，不传则全部
 */
const listUserNotifications = async ({ userId, page = 1, pageSize = 10, isRead } = {}) => {
  const { whereSql, params } = buildUserVisibleFilters(userId)
  const where = [`${whereSql}`]
  const queryParams = [...params]

  if (isRead === '1') {
    where.push('exists (select 1 from NotificationRead r where r.notification_id = n.id and r.user_id = ?)')
    queryParams.push(userId)
  } else if (isRead === '2') {
    where.push('not exists (select 1 from NotificationRead r where r.notification_id = n.id and r.user_id = ?)')
    queryParams.push(userId)
  }

  const offset = (Number(page) - 1) * Number(pageSize)
  const sql = `
    select
      n.id,
      n.title,
      n.content,
      n.type,
      n.sender_name,
      n.create_time,
      exists (select 1 from NotificationRead r where r.notification_id = n.id and r.user_id = ?) as is_read
    from Notification n
    where ${where.join(' and ')}
    order by n.id desc
    limit ? offset ?
  `

  const rows = await query(sql, [...queryParams, userId, Number(pageSize), offset])
  return rows
}

/**
 * 统计当前用户可见的公告总数（用户侧）
 * @param {{ userId: number, isRead?: string }} options
 */
const countUserNotifications = async ({ userId, isRead } = {}) => {
  const { whereSql, params } = buildUserVisibleFilters(userId)
  const where = [`${whereSql}`]
  const queryParams = [...params]

  if (isRead === '1') {
    where.push('exists (select 1 from NotificationRead r where r.notification_id = n.id and r.user_id = ?)')
    queryParams.push(userId)
  } else if (isRead === '2') {
    where.push('not exists (select 1 from NotificationRead r where r.notification_id = n.id and r.user_id = ?)')
    queryParams.push(userId)
  }

  const sql = `select count(*) as total from Notification n where ${where.join(' and ')}`
  const rows = await query(sql, queryParams)
  return rows[0]?.total || 0
}

/**
 * 统计当前用户未读公告数（用户侧）
 */
const countUnread = async (userId) => {
  const { whereSql, params } = buildUserVisibleFilters(userId)
  const sql = `
    select count(*) as total
    from Notification n
    where ${whereSql}
      and not exists (select 1 from NotificationRead r where r.notification_id = n.id and r.user_id = ?)
  `
  const rows = await query(sql, [...params, userId])
  return rows[0]?.total || 0
}

/**
 * 标记单条公告已读（幂等）
 */
const markAsRead = async (userId, notificationId) => {
  const result = await query('insert ignore into NotificationRead (notification_id, user_id) values (?, ?)', [
    notificationId,
    userId
  ])
  return { affectedRows: result.affectedRows }
}

/**
 * 标记当前用户全部公告已读
 */
const markAllAsRead = async (userId) => {
  // 为当前用户可见且未读的公告批量写入已读记录
  const { whereSql, params } = buildUserVisibleFilters(userId)
  const sql = `
    insert into NotificationRead (notification_id, user_id)
    select n.id, ?
    from Notification n
    where ${whereSql}
      and not exists (select 1 from NotificationRead r where r.notification_id = n.id and r.user_id = ?)
  `
  const result = await query(sql, [userId, ...params, userId])
  return { affectedRows: result.affectedRows }
}

/**
 * 删除公告（依赖外键级联删除 target/read）
 */
const deleteNotification = async (id) => {
  const result = await query('delete from Notification where id = ?', [id])
  return { affectedRows: result.affectedRows }
}

/**
 * 清理过期公告：删除过期且全部收件人均已读的公告，以及孤立的受众/已读记录
 * @param {string} nowTime 当前时间（SQL 参数，便于测试）
 */
const deleteExpiredNotifications = async (nowTime) => {
  const connection = await getConnection()
  try {
    await connection.beginTransaction()

    // 1. 找出过期公告及其受众类型
    const [candidates] = await connection.query(
      `
        select n.id, n.target_type
        from Notification n
        where n.expire_time is not null and n.expire_time < ?
      `,
      [nowTime]
    )

    let removed = 0
    for (const { id, target_type } of candidates) {
      // 计算未读收件人数：全员=所有启用用户；定向=NotificationTarget 用户
      const pendingSql =
        Number(target_type) === 2
          ? `
            select count(*) as pending
            from NotificationTarget t
            where t.notification_id = ?
              and not exists (
                select 1 from NotificationRead r
                where r.notification_id = t.notification_id and r.user_id = t.user_id
              )
          `
          : `
            select count(*) as pending
            from Users u
            where u.status = 1
              and not exists (
                select 1 from NotificationRead r
                where r.notification_id = ? and r.user_id = u.id
              )
          `

      const [pending] = await connection.query(pendingSql, [id])

      if (Number(pending[0]?.pending || 0) === 0) {
        await connection.query('delete from Notification where id = ?', [id])
        removed += 1
      }
    }

    // 2. 清理孤儿数据（公告已删除但残留的 target/read 记录）
    await connection.query(
      `delete t from NotificationTarget t left join Notification n on n.id = t.notification_id where n.id is null`
    )
    await connection.query(
      `delete r from NotificationRead r left join Notification n on n.id = r.notification_id where n.id is null`
    )

    await connection.commit()
    return { affectedRows: removed }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default {
  listNotifications,
  countNotifications,
  findNotificationById,
  sendNotification,
  createNotificationTargets,
  listUserNotifications,
  countUserNotifications,
  countUnread,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteExpiredNotifications
}
