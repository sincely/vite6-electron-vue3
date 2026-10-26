import { z } from 'zod'
import { createPaginatedQueryDto } from '../../shared/pagination.js'
import { statusCoerce } from '../../shared/statusDto.js'

// 性别：兼容前端 男/女、旧 1/2、DB male/female
const genderEnum = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .transform((v) => {
    if (v === undefined || v === null || v === '') {
      return undefined
    }
    return String(v)
  })

// 用户列表查询参数（前端搜索栏字段名 + 旧字段名兼容）
export const UserListQueryDto = createPaginatedQueryDto({
  keyword: z
    .string()
    .max(100)
    .optional()
    .transform((v) => v || ''),
  // 前端搜索栏字段
  username: z.string().max(100).optional(),
  nickname: z.string().max(100).optional(),
  mobile: z.string().max(20).optional(),
  email: z.string().max(100).optional(),
  gender: genderEnum,
  status: statusCoerce,
  // 旧字段名兼容
  userName: z.string().max(100).optional(),
  userGender: genderEnum,
  nickName: z.string().max(100).optional(),
  userPhone: z.string().max(20).optional(),
  userEmail: z.string().max(100).optional(),
  roleId: z.coerce.number().int().positive().optional()
})

// 创建用户请求体（前端字段名 nickname/mobile + 旧字段名兼容）
export const UserCreateBodyDto = z.object({
  username: z.string().min(2, '用户名至少 2 位').max(50, '用户名最长 50 位'),
  password: z.string().min(6, '密码至少 6 位').max(20, '密码最长 20 位').optional(),
  gender: genderEnum.default('男'),
  age: z.coerce.number().int().min(0).max(150).nullable().optional(),
  // 身份证号不做强校验：前端编辑用户时会把行数据整体透传（无身份证则为空串），
  // 空串归一为 undefined，服务端按“未提供该字段”处理（不参与更新/唯一性检查）
  idCard: z
    .string()
    .max(20, '身份证号最长 20 位')
    .optional()
    .transform((v) => v || undefined),
  email: z.email('邮箱格式不正确'),
  nickname: z.string().max(50, '昵称最长 50 位').optional(),
  nickName: z.string().max(50, '昵称最长 50 位').optional(),
  mobile: z.string().max(20, '手机号最长 20 位').optional(),
  phone: z.string().max(20, '手机号最长 20 位').optional(),
  address: z.string().max(255, '地址最长 255 位').nullable().optional(),
  status: statusCoerce.default('1'),
  avatar: z.string().max(255, '头像地址最长 255 位').nullable().optional(),
  remark: z.string().max(500).nullable().optional(),
  roleIds: z.array(z.coerce.number().int().positive()).min(1, '至少选择一个角色')
})

// 更新用户请求体（至少提供一个变更字段）
export const UserUpdateBodyDto = z
  .object({
    id: z.coerce.number().int().positive(),
    password: z.string().min(6, '密码至少 6 位').max(20, '密码最长 20 位').optional(),
    username: z.string().min(2).max(50).optional(),
    gender: genderEnum,
    age: z.coerce.number().int().min(0).max(150).nullable().optional(),
    // 同创建 Dto：不做非空强校验，空串归一为 undefined
    idCard: z
      .string()
      .max(20, '身份证号最长 20 位')
      .optional()
      .transform((v) => v || undefined),
    email: z.email('邮箱格式不正确').optional(),
    nickname: z.string().max(50, '昵称最长 50 位').optional(),
    nickName: z.string().max(50, '昵称最长 50 位').optional(),
    mobile: z.string().max(20, '手机号最长 20 位').optional(),
    phone: z.string().max(20, '手机号最长 20 位').optional(),
    address: z.string().max(255, '地址最长 255 位').nullable().optional(),
    status: statusCoerce,
    avatar: z.string().max(255, '头像地址最长 255 位').nullable().optional(),
    remark: z.string().max(500).nullable().optional(),
    roleIds: z.array(z.coerce.number().int().positive()).min(1, '至少选择一个角色').optional()
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: '至少提供一个需要更新的字段'
  })

// 删除用户请求体（单个 id 或批量 ids 都支持）
export const UserDeleteBodyDto = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    ids: z.array(z.coerce.number().int().positive()).optional()
  })
  .refine((data) => Boolean(data.id || (data.ids && data.ids.length > 0)), {
    message: '至少提供一个用户ID'
  })

// 批量删除用户请求体
export const UserBatchDeleteBodyDto = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, '至少选择一个用户')
})

// 更新用户状态请求体
export const UserStatusUpdateBodyDto = z.object({
  id: z.coerce.number().int().positive(),
  status: statusCoerce.refine((v) => v === '0' || v === '1', { message: 'status 必须是 0/1' })
})

// 重置用户密码请求体
export const UserPasswordResetBodyDto = z.object({
  id: z.coerce.number().int().positive()
})
