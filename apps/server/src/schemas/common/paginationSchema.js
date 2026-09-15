import { z } from 'zod'

/**
 * 通用分页参数 schema
 * 支持 pageNum/pageSize（前端默认）、current/size、page/pageSize 三套命名
 */
export const paginationSchema = z.object({
  current: z.coerce.number().int().min(1).optional(),
  size: z.coerce.number().int().min(1).max(1000).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(1000).optional(),
  pageNum: z.coerce.number().int().min(1).optional()
})

/**
 * 创建带分页的列表查询 schema 工厂函数
 * @param {z.ZodRawShape} filterShape - 业务过滤字段的 Zod shape
 * @returns {z.ZodObject} 合并分页 + 过滤字段的完整 schema
 *
 * @example
 * // 定义用户列表查询 schema
 * export const UserListQuerySchema = createPaginatedQuerySchema({
 *   keyword: z.string().max(100).optional(),
 *   status: z.enum(['1', '2']).optional()
 * })
 */
export const createPaginatedQuerySchema = (filterShape) => {
  return paginationSchema.extend(filterShape)
}

/**
 * 从已校验的分页参数中提取归一化页码和每页数量
 * 兼容 pageNum/pageSize、current/size、page/pageSize 三套命名
 * @param {{ current?: number, size?: number, page?: number, pageSize?: number, pageNum?: number }} params
 * @returns {{ actualPage: number, actualPageSize: number }}
 */
export const normalizePagination = ({ current, size, page, pageSize, pageNum } = {}) => ({
  actualPage: Number(pageNum || page || current || 1),
  actualPageSize: Number(pageSize || size || 10)
})
