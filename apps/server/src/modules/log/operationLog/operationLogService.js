/**
 * @module 操作日志 Service
 * @description 操作日志的业务逻辑层，封装分页归一化、数据查询、JSON 解析等逻辑
 *
 * 返回契约统一为 `{ success, code?, msg?, data? }`：
 *   - 成功：{ success: true, data }
 *   - 失败：{ success: false, code, msg }
 */

import operationLogDao from './operationLogDao.js'
import { businessCode } from '../../../config/businessCode.js'
import { normalizePagination } from '../../../shared/pagination.js'

/**
 * 将数据库 snake_case 字段映射为前端 camelCase 字段
 */
const formatOperationLogRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  username: row.username,
  action: row.action,
  module: row.module,
  method: row.method,
  requestUrl: row.request_url,
  requestParams: row.request_params,
  responseStatus: row.response_status,
  responseMsg: row.response_msg,
  responseBody: row.response_body,
  ipAddress: row.ip_address,
  userAgent: row.user_agent,
  executeTime: row.execute_time,
  status: row.status,
  createTime: row.create_time
})

/**
 * 记录一条操作日志
 * @param {object} payload
 * @returns {Promise<{ success: true, data: { id: number } }>}
 */
export const createOperationLog = async (payload) => {
  const result = await operationLogDao.createOperationLog(payload)
  return { success: true, data: { id: result?.insertId } }
}

/**
 * 获取操作日志列表
 * @param {object} query - 查询参数
 * @returns {Promise<{ success: true, data: { records: Array, current: number, size: number, total: number } }>}
 */
export const listOperationLogs = async (query) => {
  const { current, size, page, pageSize, username, module, action, status, startTime, endTime } = query
  const { actualPage, actualPageSize } = normalizePagination({ current, size, page, pageSize })

  const filterParams = { username, module, action, status, startTime, endTime }

  const [list, total] = await Promise.all([
    operationLogDao.listOperationLogs({ page: actualPage, pageSize: actualPageSize, ...filterParams }),
    operationLogDao.countOperationLogs(filterParams)
  ])

  return {
    success: true,
    data: {
      records: list.map(formatOperationLogRow),
      current: actualPage,
      size: actualPageSize,
      total: Number(total)
    }
  }
}

/**
 * 获取操作日志详情（含 request_params JSON 解析）
 * @param {number} id
 * @returns {Promise<{ success: boolean, code?: number, msg?: string, data?: object|null }>}
 */
export const getOperationLogDetail = async (id) => {
  const log = await operationLogDao.getOperationLogById(id)

  if (!log) {
    return { success: false, code: businessCode.error, msg: '日志不存在' }
  }

  const formatted = formatOperationLogRow(log)

  if (formatted.requestParams) {
    try {
      formatted.requestParams = JSON.parse(formatted.requestParams)
    } catch {
      // 保持原样
    }
  }

  if (formatted.responseBody) {
    try {
      formatted.responseBody = JSON.parse(formatted.responseBody)
    } catch {
      // 保持原样
    }
  }

  return { success: true, data: formatted }
}

/**
 * 批量删除操作日志
 * @param {number[]} ids
 * @returns {Promise<{ success: true }>}
 */
export const batchDeleteOperationLogs = async (ids) => {
  await operationLogDao.batchDeleteOperationLogs(ids)
  return { success: true }
}

/**
 * 清空操作日志
 * @returns {Promise<{ success: true }>}
 */
export const clearOperationLogs = async () => {
  await operationLogDao.clearOperationLogs()
  return { success: true }
}

/**
 * 删除单条操作日志
 * @param {number} id
 * @returns {Promise<{ success: true }>}
 */
export const deleteOperationLog = async (id) => {
  await operationLogDao.deleteOperationLogById(id)
  return { success: true }
}
