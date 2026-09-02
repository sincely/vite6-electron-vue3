import request from '@/utils/request'

/**
 * 表格列表查询（后端分页）
 *
 * 请求链路：渲染进程 → IPC → 主进程 axios → 后端 /table/list
 * 后端业务信封：{ code, data: { rows, total, stats }, error, message }
 *
 * AdvanceTable 的 func 约定 resolve 出 { rows, total }，故在此统一剥层：
 *   - code === 0：返回业务数据（rows / total / stats）
 *   - 其余情况抛出带后端 message 的错误，由表格 catch 分支兜底
 *
 * @param {Object} params { pageNum, pageSize, name?, department?, status? }
 * @returns {Promise<{rows: Array, total: number, stats?: Object}>}
 */
export async function getTableList(params) {
  const res = await request({
    url: '/table/list',
    method: 'get',
    params
  })

  const body = res?.data ?? {}
  if (body.code !== 0) {
    throw new Error(body.message || '表格数据加载失败')
  }
  return body.data ?? { rows: [], total: 0 }
}
