import { z } from 'zod'
import { createPaginatedQuerySchema } from '../common/paginationSchema.js'

// 角色/菜单状态：兼容前端 '1'/'2' 与新 schema 的 '0'/'1'，统一归一为 '1'/'0'
const statusCoerce = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === '') {
      return undefined
    }
    if (v === '1' || v === 1 || v === '0' || v === 0) {
      return String(v)
    }
    if (v === '2' || v === 2) {
      return '0'
    } // '2'=禁用 映射到新 schema 的 '0'
    return undefined
  })

const menuTypeEnum = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === '') {
      return undefined
    }
    // 兼容 'DIR'/'MENU'/'BUTTON' (新) 与 1/2/3 (旧)
    const s = String(v).toUpperCase()
    if (['DIR', 'MENU', 'BUTTON'].includes(s)) {
      return s
    }
    if (v === 1 || v === '1') {
      return 'DIR'
    }
    if (v === 2 || v === '2') {
      return 'MENU'
    }
    if (v === 3 || v === '3') {
      return 'BUTTON'
    }
    return undefined
  })

// 角色列表查询参数
export const RoleListQuerySchema = createPaginatedQuerySchema({
  roleName: z.string().max(100).optional(),
  roleCode: z.string().max(100).optional(),
  status: statusCoerce
})

// 创建角色请求体（前端用 remark 承载描述，sort 承载排序）
export const RoleCreateBodySchema = z.object({
  roleName: z.string().min(2, '角色名至少 2 位').max(50, '角色名最长 50 位'),
  roleCode: z.string().min(2, '角色编码至少 2 位').max(50, '角色编码最长 50 位'),
  roleDesc: z.string().max(255, '角色描述最长 255 位').optional().default(''),
  description: z.string().max(255, '角色描述最长 255 位').optional().default(''),
  remark: z.string().max(500, '角色描述最长 500 位').optional().default(''),
  sort: z.coerce.number().int().min(0).optional(),
  roleSort: z.coerce.number().int().min(0).optional(),
  status: statusCoerce.default('1')
})

// 更新角色请求体
export const RoleUpdateBodySchema = z
  .object({
    roleId: z.coerce.number().int().positive().optional(),
    id: z.coerce.number().int().positive().optional(),
    roleName: z.string().min(2, '角色名至少 2 位').max(50, '角色名最长 50 位').optional(),
    roleCode: z.string().min(2, '角色编码至少 2 位').max(50, '角色编码最长 50 位').optional(),
    roleDesc: z.string().max(255, '角色描述最长 255 位').optional().default(''),
    description: z.string().max(255, '角色描述最长 255 位').optional().default(''),
    remark: z.string().max(500, '角色描述最长 500 位').optional().default(''),
    sort: z.coerce.number().int().min(0).optional(),
    roleSort: z.coerce.number().int().min(0).optional(),
    status: statusCoerce
  })
  .refine((data) => Boolean(data.roleId || data.id), {
    message: '角色ID不能为空'
  })

// 删除角色请求体（单个 id/roleId 或批量 ids 都支持）
export const RoleDeleteBodySchema = z
  .object({
    roleId: z.coerce.number().int().positive().optional(),
    id: z.coerce.number().int().positive().optional(),
    ids: z.array(z.coerce.number().int().positive()).optional()
  })
  .refine((data) => Boolean(data.roleId || data.id || (data.ids && data.ids.length > 0)), {
    message: '角色ID不能为空'
  })

// 菜单状态枚举（重新导出，供 menuSchema 共用）
export { statusCoerce, menuTypeEnum }
