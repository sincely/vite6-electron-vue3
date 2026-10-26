import { z } from 'zod'
import { createPaginatedQueryDto } from '../../shared/pagination.js'

const adminStatusEnum = z.enum(['1', '2'])

// 字典列表查询参数
export const DictListQueryDto = createPaginatedQueryDto({
  dictName: z.string().max(100).optional(),
  dictCode: z.string().max(100).optional(),
  status: adminStatusEnum.optional()
})

// 创建字典请求体
export const DictCreateBodyDto = z.object({
  dictName: z.string().min(2, '字典名称至少 2 位').max(100, '字典名称最长 100 位'),
  dictCode: z.string().min(2, '字典编码至少 2 位').max(100, '字典编码最长 100 位'),
  status: adminStatusEnum.default('1'),
  remark: z.string().max(500, '备注最长 500 位').optional().default('')
})

// 更新字典请求体
export const DictUpdateBodyDto = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    dictId: z.coerce.number().int().positive().optional(),
    dictName: z.string().min(2, '字典名称至少 2 位').max(100, '字典名称最长 100 位'),
    dictCode: z.string().min(2, '字典编码至少 2 位').max(100, '字典编码最长 100 位'),
    status: adminStatusEnum.default('1'),
    remark: z.string().max(500, '备注最长 500 位').optional().default('')
  })
  .refine((data) => Boolean(data.id || data.dictId), {
    message: '字典ID不能为空'
  })

// 删除字典请求体
export const DictDeleteBodyDto = z
  .object({
    id: z.coerce.number().int().positive().optional(),
    dictId: z.coerce.number().int().positive().optional()
  })
  .refine((data) => Boolean(data.id || data.dictId), {
    message: '字典ID不能为空'
  })
