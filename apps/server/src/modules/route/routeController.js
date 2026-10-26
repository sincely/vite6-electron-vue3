/**
 * @module 路由管理 Controller
 * @description HTTP 适配层，业务逻辑委托给 routeService
 */

import { routeService } from './index.js'
import { businessCode } from '../../config/businessCode.js'
import { createSuccessResponse } from '../../core/response.js'

/**
 * 获取常量路由
 */
const getConstantRoutes = async (ctx) => {
  const result = await routeService.getConstantRoutes()
  ctx.body = createSuccessResponse(businessCode.success, '请求成功', result.data)
}

/**
 * 获取用户路由
 */
const getUserRoutes = async (ctx) => {
  const result = await routeService.getUserRoutes(ctx.state.user?.roleIds, ctx.state.user?.roleId)
  ctx.body = createSuccessResponse(businessCode.success, '请求成功', result.data)
}

/**
 * 判断路由是否存在
 */
const isRouteExist = async (ctx) => {
  const { routeName } = ctx.query
  const result = await routeService.isRouteExist(routeName)
  ctx.body = createSuccessResponse(businessCode.success, '请求成功', result.data)
}

export default {
  getConstantRoutes,
  getUserRoutes,
  isRouteExist
}
