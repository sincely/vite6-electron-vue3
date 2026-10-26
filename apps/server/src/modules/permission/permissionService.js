/**
 * @module 权限 Service
 * @description 封装「角色 → 菜单 / 按钮」的权限查询能力
 *
 * 该模块是权限数据的唯一出口，鉴权中间件与其他业务模块都通过它取权限，
 * 不得直接访问 permission.DAO。
 */

import permissionDao from './permissionDao.js'

/**
 * 查询角色可访问的菜单列表（含按钮节点）
 * @param {number|number[]} roleIds
 * @returns {Promise<Array<any>>}
 */
export const findMenusByRoleId = async (roleIds) => {
  return permissionDao.findMenusByRoleId(roleIds)
}

/**
 * 查询角色可访问的按钮权限节点
 * @param {number|number[]} roleIds
 * @returns {Promise<Array<any>>}
 */
export const findButtonsByRoleId = async (roleIds) => {
  return permissionDao.findButtonsByRoleId(roleIds)
}

/**
 * 查询角色可访问的菜单路径集合
 * 路由级鉴权（`authorizeRoute`）以此判定请求是否放行。
 * @param {number|number[]} roleIds
 * @returns {Promise<string[]>}
 */
export const getMenuPathsByRoleId = async (roleIds) => {
  const menus = await permissionDao.findMenusByRoleId(roleIds)
  return menus.map((menu) => menu.path)
}
