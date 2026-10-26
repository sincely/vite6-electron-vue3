/**
 * @module 登录日志 Service
 * @description 登录日志的业务逻辑层，封装分页归一化、数据查询等逻辑
 *
 * 返回契约统一为 `{ success, code?, msg?, data? }`：
 *   - 成功：{ success: true, data }
 *   - 失败：{ success: false, code, msg }
 */

import loginLogDao from './loginLogDao.js'
import { businessCode } from '../../../config/businessCode.js'
import { normalizePagination } from '../../../shared/pagination.js'

/**
 * 将数据库 snake_case 字段映射为前端 camelCase 字段
 */
const formatLoginLogRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  username: row.username,
  loginType: row.login_type,
  ipAddress: row.ip_address,
  location: row.location,
  browser: row.browser,
  os: row.os,
  userAgent: row.user_agent,
  status: row.status,
  message: row.message,
  sessionId: row.session_id,
  createTime: row.create_time
})

/**
 * 记录一条登录日志
 * @param {object} payload
 * @returns {Promise<{ success: true, data: { id: number } }>}
 */
export const createLoginLog = async (payload) => {
  const result = await loginLogDao.createLoginLog(payload)
  return { success: true, data: { id: result?.insertId } }
}

/**
 * 获取登录日志列表
 * @param {object} query - 查询参数（来自 ctx.query，已通过 Dto 校验）
 * @returns {Promise<{ success: true, data: { records: Array, current: number, size: number, total: number } }>}
 */
export const listLoginLogs = async (query) => {
  const { current, size, page, pageSize, username, ipAddress, status, startTime, endTime } = query
  const { actualPage, actualPageSize } = normalizePagination({ current, size, page, pageSize })

  const filterParams = { username, ip_address: ipAddress, status, startTime, endTime }

  const [list, total] = await Promise.all([
    loginLogDao.listLoginLogs({ page: actualPage, pageSize: actualPageSize, ...filterParams }),
    loginLogDao.countLoginLogs(filterParams)
  ])

  return {
    success: true,
    data: {
      records: list.map(formatLoginLogRow),
      current: actualPage,
      size: actualPageSize,
      total: Number(total)
    }
  }
}

/**
 * 获取登录日志详情
 * @param {number} id
 * @returns {Promise<{ success: boolean, code?: number, msg?: string, data?: object|null }>}
 */
export const getLoginLogDetail = async (id) => {
  const log = await loginLogDao.getLoginLogById(id)
  if (!log) {
    return { success: false, code: businessCode.error, msg: '日志不存在' }
  }
  return { success: true, data: formatLoginLogRow(log) }
}

/**
 * 批量删除登录日志
 * @param {number[]} ids
 * @returns {Promise<{ success: true }>}
 */
export const batchDeleteLoginLogs = async (ids) => {
  await loginLogDao.batchDeleteLoginLogs(ids)
  return { success: true }
}

/**
 * 清空登录日志
 * @returns {Promise<{ success: true }>}
 */
export const clearLoginLogs = async () => {
  await loginLogDao.clearLoginLogs()
  return { success: true }
}
