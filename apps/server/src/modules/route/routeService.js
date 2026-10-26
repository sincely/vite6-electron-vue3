/**
 * @module 路由 Service
 * @description 封装动态路由生成与路由存在性判断
 *
 * 依赖其他模块时，只经由对方模块的公开 API（index.js）访问，
 * 不直接引用其 DAO / controller。
 */

import { permissionService } from '../permission/index.js'
import { menuService } from '../menu/index.js'
import { buildMenuTree } from '../../shared/menu-tree.js'

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
 * 常量路由（登录页、403/404/500 等无需鉴权的静态路由）
 * @returns {{success: true, data: Array<object>}}
 */
export const getConstantRoutes = async () => {
  return {
    success: true,
    data: [
      {
        name: 'login',
        path: '/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?',
        component: 'layout.blank$view.login',
        props: true,
        meta: {
          title: 'login',
          constant: true,
          hide_in_menu: true
        }
      },
      {
        name: '403',
        path: '/403',
        component: 'layout.blank$view.403',
        meta: {
          title: '403',
          constant: true,
          hide_in_menu: true
        }
      },
      {
        name: '404',
        path: '/404',
        component: 'layout.blank$view.404',
        meta: {
          title: '404',
          constant: true,
          hide_in_menu: true
        }
      },
      {
        name: '500',
        path: '/500',
        component: 'layout.blank$view.500',
        meta: {
          title: '500',
          constant: true,
          hide_in_menu: true
        }
      }
    ]
  }
}

/**
 * 获取当前用户的动态路由树
 * @param {string|number|Array<number|string>|undefined} roleIds
 * @param {number|string|undefined} roleId
 * @returns {Promise<{success: true, data: {routes: Array<object>, home: string}}>}
 */
export const getUserRoutes = async (roleIds, roleId) => {
  const resolvedRoleIds = parseRoleIds(roleIds, roleId)

  let menus = []
  if (resolvedRoleIds.length > 0) {
    menus = await permissionService.findMenusByRoleId(resolvedRoleIds)
  }

  return {
    success: true,
    data: {
      routes: buildMenuTree(menus),
      home: 'home'
    }
  }
}

/**
 * 判断路由（菜单）是否存在
 * @param {string} routeName
 * @returns {Promise<{success: true, data: boolean}>}
 */
export const isRouteExist = async (routeName) => {
  const menu = await menuService.findMenuByName(routeName)
  return { success: true, data: Boolean(menu) }
}
