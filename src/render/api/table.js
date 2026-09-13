import request from '@/utils/request'

/**
 * 表格列表查询（后端分页）
 *
 * 请求链路：渲染进程 → IPC → 主进程 axios → 后端 /table/list
 * request() 已统一拆业务信封，await 后直接拿到业务本体 { rows, total, stats }。
 * AdvanceTable 的 func 约定 resolve 出 { rows, total }，直接透传即可。
 *
 * @param {Object} params { pageNum, pageSize, name?, department?, status? }
 * @returns {Promise<{rows: Array, total: number, stats?: Object}>}
 */
export const getTableList = async (params) => {
  const data = await request({ url: '/table/list', method: 'get', params })
  return data ?? { rows: [], total: 0 }
}
