/**
 * 路由级鉴权中间件
 *
 * 判定当前用户所属角色是否拥有目标菜单路径。
 * 权限数据统一经 `permission` 模块的公开 API 获取，中间件不直接访问数据层。
 */
import { permissionService } from '../modules/permission/index.js'
import { businessCode, businessMsg } from '../config/businessCode.js'
import { createFailResponse } from '../core/response.js'

/**
 * 解析角色 ID 列表
 * 兼容 JWT 中的 roleIds（逗号分隔字符串）与 roleId（单值）两种形态。
 * @param {string|number|Array<number|string>|undefined} value
 * @param {number|string|undefined} fallbackRoleId
 * @returns {number[]}
 */
const parseRoleIds = (value, fallbackRoleId) => {
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => Number(item))
      .filter(Boolean)
  }

  return fallbackRoleId ? [Number(fallbackRoleId)] : []
}

/**
 * 生成路由级鉴权中间件
 * @param {string|string[]} route_path 允许访问的菜单路径
 * @returns {import('koa').Middleware}
 */
export const authorizeRoute = (route_path) => {
  return async (ctx, next) => {
    const currentUser = ctx.state.user
    const allowedRoutePaths = Array.isArray(route_path) ? route_path : [route_path]

    const roleIds = parseRoleIds(currentUser?.roleIds, currentUser?.roleId)

    if (roleIds.length === 0) {
      ctx.status = 401
      ctx.body = createFailResponse(businessCode.unAuthorized, businessMsg[businessCode.unAuthorized])
      return
    }

    // 从权限模块获取用户拥有的菜单路径
    const menuPaths = await permissionService.getMenuPathsByRoleId(roleIds)
    const allowed = menuPaths.some((path) => allowedRoutePaths.includes(path))

    if (!allowed) {
      ctx.status = 403
      ctx.body = createFailResponse(businessCode.permissionDenied, businessMsg[businessCode.permissionDenied])
      return
    }

    await next()
  }
}

export default authorizeRoute
