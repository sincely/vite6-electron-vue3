import { z } from 'zod'

// 判断路由是否存在：查询参数
export const RouteExistQueryDto = z.object({
  routeName: z.string({ error: '路由名称不能为空' }).min(1, '路由名称不能为空')
})
