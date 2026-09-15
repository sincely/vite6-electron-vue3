import { z } from 'zod'
import { createPaginatedQuerySchema } from '../common/paginationSchema.js'
import { statusCoerce, menuTypeEnum } from '../role/roleSchema.js'

// 菜单列表查询参数（前端兼容：current/size 与 page/pageSize 都支持）
export const MenuListQuerySchema = createPaginatedQuerySchema({
  keyword: z
    .string()
    .max(100)
    .optional()
    .transform((v) => v || ''),
  menuType: menuTypeEnum,
  status: statusCoerce
})

// 创建菜单/按钮请求体（menuType 为 'BUTTON'/3 时 routeName/path 非必填）
export const MenuCreateBodySchema = z
  .object({
    parentId: z.coerce.number().int().nonnegative().nullable().optional(),
    menuType: menuTypeEnum.default('MENU'),
    menuName: z.string().min(1, '菜单名称不能为空').max(50, '菜单名称最长 50 位'),
    routeName: z.string().max(255, '路由名称最长 255 位').nullable().optional(),
    path: z.string().max(255, '路由路径最长 255 位').nullable().optional(),
    routePath: z.string().max(255, '路由路径最长 255 位').nullable().optional(),
    component: z.string().max(255, 'component 最长 255 位').nullable().optional(),
    redirect: z.string().max(255, 'redirect 最长 255 位').nullable().optional(),
    sort: z.coerce.number().int().min(0).default(0),
    orderNum: z.coerce.number().int().min(0).default(0),
    icon: z.string().max(255, 'icon 最长 255 位').nullable().optional(),
    permission: z.string().max(100, '权限标识最长 100 位').nullable().optional(),
    frame: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null) {
          return '0'
        }
        return String(v) === '1' || v === 1 ? '1' : '0'
      }),
    link: z.string().max(255, 'link 最长 255 位').nullable().optional(),
    isCache: z
      .union([z.string(), z.number(), z.boolean()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null) {
          return '0'
        }
        return v === '1' || v === 1 || v === true || v === 'true' ? '1' : '0'
      }),
    keepAlive: z.boolean().optional(), // 兼容旧字段名
    visible: z
      .union([z.string(), z.number(), z.boolean()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null) {
          return '1'
        }
        return v === '0' || v === 0 || v === false ? '0' : '1'
      }),
    hideInMenu: z.boolean().optional(), // 兼容旧字段名（true=隐藏 → '0'）
    status: statusCoerce.default('1'),
    remark: z.string().max(500).nullable().optional()
  })
  .transform((data) => {
    // 归一化 hideInMenu → visible，keepAlive → isCache
    const normalized = { ...data }
    if (normalized.hideInMenu !== undefined && normalized.visible === undefined) {
      normalized.visible = normalized.hideInMenu ? '0' : '1'
      delete normalized.hideInMenu
    }
    if (normalized.keepAlive !== undefined && normalized.isCache === undefined) {
      normalized.isCache = normalized.keepAlive ? '1' : '0'
      delete normalized.keepAlive
    }
    // 兼容 routePath → path
    if (normalized.routePath && !normalized.path) {
      normalized.path = normalized.routePath
      delete normalized.routePath
    }
    return normalized
  })
  .superRefine((data, ctx) => {
    // 非按钮类型时 routeName/path 必填
    const isButton = data.menuType === 'BUTTON' || Number(data.menuType) === 3
    if (!isButton) {
      if (!data.routeName || String(data.routeName).trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '路由名称不能为空',
          path: ['routeName']
        })
      }
      if (!data.path || String(data.path).trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '路由路径不能为空',
          path: ['path']
        })
      }
    }
  })

// 更新菜单请求体（至少提供一个变更字段）
export const MenuUpdateBodySchema = z
  .object({
    id: z.coerce.number().int().positive(),
    parentId: z.coerce.number().int().nonnegative().nullable().optional(),
    menuType: menuTypeEnum,
    menuName: z.string().min(1, '菜单名称不能为空').max(50, '菜单名称最长 50 位').optional(),
    routeName: z.string().max(255, '路由名称最长 255 位').nullable().optional(),
    path: z.string().max(255, '路由路径最长 255 位').nullable().optional(),
    routePath: z.string().max(255, '路由路径最长 255 位').nullable().optional(),
    component: z.string().max(255, 'component 最长 255 位').nullable().optional(),
    redirect: z.string().max(255, 'redirect 最长 255 位').nullable().optional(),
    sort: z.coerce.number().int().min(0).optional(),
    orderNum: z.coerce.number().int().min(0).optional(),
    icon: z.string().max(255, 'icon 最长 255 位').nullable().optional(),
    permission: z.string().max(100, '权限标识最长 100 位').nullable().optional(),
    frame: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null) {
          return undefined
        }
        return String(v) === '1' || v === 1 ? '1' : '0'
      }),
    link: z.string().max(255, 'link 最长 255 位').nullable().optional(),
    isCache: z
      .union([z.string(), z.number(), z.boolean()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null) {
          return undefined
        }
        return v === '1' || v === 1 || v === true || v === 'true' ? '1' : '0'
      }),
    keepAlive: z.boolean().optional(),
    visible: z
      .union([z.string(), z.number(), z.boolean()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null) {
          return undefined
        }
        return v === '0' || v === 0 || v === false ? '0' : '1'
      }),
    hideInMenu: z.boolean().optional(),
    status: statusCoerce,
    remark: z.string().max(500).nullable().optional()
  })
  .transform((data) => {
    const normalized = { ...data }
    if (normalized.hideInMenu !== undefined && normalized.visible === undefined) {
      normalized.visible = normalized.hideInMenu ? '0' : '1'
      delete normalized.hideInMenu
    }
    if (normalized.keepAlive !== undefined && normalized.isCache === undefined) {
      normalized.isCache = normalized.keepAlive ? '1' : '0'
      delete normalized.keepAlive
    }
    if (normalized.routePath && !normalized.path) {
      normalized.path = normalized.routePath
      delete normalized.routePath
    }
    return normalized
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: '至少提供一个需要更新的字段'
  })

// 删除菜单请求体
export const MenuDeleteBodySchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    ids: z.array(z.coerce.number().int().positive()).optional()
  })
  .refine((data) => Boolean(data.id || (data.ids && data.ids.length > 0)), {
    message: '至少提供一个菜单ID'
  })
