import { query } from '../../infrastructure/database/connection.js'

/**
 * 系统监控 DAO
 */

// 有效在线会话：存在 session_id 且未过期（与 authenticate 中间件判定保持一致）
const ONLINE_CONDITION = `
  u.deleted = '0'
  AND u.session_id IS NOT NULL
  AND u.session_id <> ''
  AND (u.session_expire IS NULL OR u.session_expire > NOW())
`

const buildOnlineFilters = ({ username, ipAddress }) => {
  const where = [ONLINE_CONDITION]
  const params = []

  if (username) {
    where.push('u.username LIKE ?')
    params.push(`%${username}%`)
  }

  if (ipAddress) {
    where.push('u.last_login_ip LIKE ?')
    params.push(`%${ipAddress}%`)
  }

  return { whereSql: where.join(' AND '), params }
}

/**
 * 分页查询在线会话（含账号归属、角色、登录设备信息）
 */
const listOnlineSessions = async ({ page, pageSize, username, ipAddress }) => {
  const { whereSql, params } = buildOnlineFilters({ username, ipAddress })
  const offset = (page - 1) * pageSize

  const sql = `
    SELECT
      u.id AS user_id,
      u.username,
      u.nick_name,
      u.avatar,
      u.session_id,
      u.session_expire,
      u.last_login_ip,
      u.last_login_time,
      roleAgg.roleNames,
      ll.location,
      ll.browser,
      ll.os,
      ll.user_agent,
      ll.ip_address AS login_ip
    FROM sys_user u
    LEFT JOIN (
      SELECT ur.user_id, GROUP_CONCAT(DISTINCT r.role_name ORDER BY r.role_name ASC) AS roleNames
      FROM sys_user_role ur
      LEFT JOIN sys_role r ON r.role_id = ur.role_id
      GROUP BY ur.user_id
    ) roleAgg ON roleAgg.user_id = u.id
    LEFT JOIN sys_login_log ll ON ll.session_id = u.session_id AND ll.status = '1'
    WHERE ${whereSql}
    ORDER BY u.last_login_time DESC, u.id DESC
    LIMIT ?, ?
  `

  return query(sql, [...params, offset, pageSize])
}

const countOnlineSessions = async ({ username, ipAddress }) => {
  const { whereSql, params } = buildOnlineFilters({ username, ipAddress })
  const rows = await query(`SELECT COUNT(*) AS total FROM sys_user u WHERE ${whereSql}`, params)
  return rows[0]?.total || 0
}

/**
 * 按 sessionId 查询有效在线会话所属账号
 */
const findOnlineUserBySessionId = async (sessionId) => {
  const rows = await query(
    `SELECT u.id, u.username FROM sys_user u WHERE ${ONLINE_CONDITION} AND u.session_id = ? LIMIT 1`,
    [sessionId]
  )
  return rows[0] || null
}

/**
 * 清除会话（使 JWT 与 refreshToken 同时失效），返回受影响行数
 */
const clearSessionById = async (sessionId) => {
  const result = await query(
    `UPDATE sys_user SET session_id = NULL, current_refresh_token = NULL, session_expire = NULL WHERE session_id = ?`,
    [sessionId]
  )
  return result.affectedRows || 0
}

/**
 * 会话与账号概况
 */
const getSessionStats = async () => {
  const sql = `
    SELECT
      COUNT(*) AS totalUsers,
      COALESCE(SUM(CASE WHEN u.status = '1' THEN 1 ELSE 0 END), 0) AS enabledUsers,
      COALESCE(SUM(CASE WHEN u.status = '0' THEN 1 ELSE 0 END), 0) AS disabledUsers,
      COALESCE(SUM(CASE WHEN u.session_id IS NOT NULL AND u.session_id <> ''
        AND (u.session_expire IS NULL OR u.session_expire > NOW()) THEN 1 ELSE 0 END), 0) AS online,
      COALESCE(SUM(CASE WHEN u.session_id IS NOT NULL AND u.session_id <> ''
        AND u.session_expire > NOW() AND u.session_expire <= DATE_ADD(NOW(), INTERVAL 1 HOUR) THEN 1 ELSE 0 END), 0) AS expiringSoon,
      COALESCE(SUM(CASE WHEN u.session_id IS NOT NULL AND u.session_id <> ''
        AND u.session_expire IS NOT NULL AND u.session_expire <= NOW() THEN 1 ELSE 0 END), 0) AS expired
    FROM sys_user u
    WHERE u.deleted = '0'
  `
  const rows = await query(sql)
  return rows[0] || {}
}

/**
 * 近 24 小时登录统计
 */
const getLoginStats = async () => {
  const sql = `
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN status = '1' THEN 1 ELSE 0 END), 0) AS success,
      COALESCE(SUM(CASE WHEN status = '0' THEN 1 ELSE 0 END), 0) AS failed,
      COALESCE(SUM(CASE WHEN status = '0' AND create_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 ELSE 0 END), 0) AS failedLastHour,
      COUNT(DISTINCT CASE WHEN status = '1' THEN user_id END) AS activeUsers
    FROM sys_login_log
    WHERE create_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `
  const rows = await query(sql)
  return rows[0] || {}
}

/**
 * 近 24 小时按小时聚合的登录趋势，同时返回数据库当前整点用于补齐空桶
 */
const getLoginTrend = async () => {
  const [rows, nowRows] = await Promise.all([
    query(`
      SELECT
        DATE_FORMAT(create_time, '%Y-%m-%d %H:00:00') AS bucket,
        COALESCE(SUM(CASE WHEN status = '1' THEN 1 ELSE 0 END), 0) AS success,
        COALESCE(SUM(CASE WHEN status = '0' THEN 1 ELSE 0 END), 0) AS failed
      FROM sys_login_log
      WHERE create_time >= DATE_SUB(DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00'), INTERVAL 23 HOUR)
      GROUP BY bucket
      ORDER BY bucket
    `),
    query(`SELECT DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00') AS nowHour`)
  ])
  return { rows, nowHour: nowRows[0]?.nowHour }
}

/**
 * 最近的失败登录
 */
const listRecentFailures = async (limit = 5) => {
  const sql = `
    SELECT username, ip_address, location, message, create_time
    FROM sys_login_log
    WHERE status = '0'
    ORDER BY create_time DESC
    LIMIT ?
  `
  return query(sql, [limit])
}

/**
 * 近 24 小时失败次数达到阈值的来源 IP
 */
const listSuspiciousIps = async (threshold = 3, limit = 5) => {
  const sql = `
    SELECT ip_address, COUNT(*) AS failed, MAX(create_time) AS lastTime
    FROM sys_login_log
    WHERE status = '0'
      AND create_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      AND ip_address <> ''
    GROUP BY ip_address
    HAVING failed >= ?
    ORDER BY failed DESC
    LIMIT ?
  `
  return query(sql, [threshold, limit])
}

export default {
  listOnlineSessions,
  countOnlineSessions,
  findOnlineUserBySessionId,
  clearSessionById,
  getSessionStats,
  getLoginStats,
  getLoginTrend,
  listRecentFailures,
  listSuspiciousIps
}
