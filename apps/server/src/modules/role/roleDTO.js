import { z } from 'zod'
import { createPaginatedQueryDto } from '../../shared/pagination.js'
import { statusCoerce, menuTypeEnum } from '../../shared/statusDto.js'

// 角色列表查询参数
export const RoleListQueryDto = createPaginatedQueryDto({
  roleName: z.string().max(100).optional(),
  roleCode: z.string().max(100).optional(),
  status: statusCoerce
})

// 创建角色请求体（前端用 remark 承载描述，sort 承载排序）
export const RoleCreateBodyDto = z.object({
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
export const RoleUpdateBodyDto = z
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
export const RoleDeleteBodyDto = z
  .object({
    roleId: z.coerce.number().int().positive().optional(),
    id: z.coerce.number().int().positive().optional(),
    ids: z.array(z.coerce.number().int().positive()).optional()
  })
  .refine((data) => Boolean(data.roleId || data.id || (data.ids && data.ids.length > 0)), {
    message: '角色ID不能为空'
  })

// 查询角色已绑定路由 ID 的查询参数
export const RoleRouteIdsQueryDto = z.object({
  roleId: z.coerce.number({ error: '角色ID必须为正整数' }).int('角色ID必须为正整数').positive('角色ID必须为正整数')
})

// 更新角色路由绑定的请求体
export const RoleRouteIdsBodyDto = z.object({
  roleId: z.coerce.number({ error: '角色ID必须为正整数' }).int('角色ID必须为正整数').positive('角色ID必须为正整数'),
  routeIds: z.array(z.coerce.number().int().positive()).optional().default([])
})
