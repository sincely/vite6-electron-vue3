import { getConnection, query } from '../../db/connection.js'

/**
 * 菜单查询的公共字段（与新 RouteAuth schema 对齐：path / sort / visible / is_cache 等）。
 */
const MENU_COLUMNS = `
  ra.id, ra.parent_id, ra.menu_type, ra.menu_name, ra.route_name, ra.path,
  ra.component, ra.redirect, ra.sort, ra.icon, ra.permission,
  ra.frame, ra.link, ra.is_cache, ra.visible, ra.status, ra.is_system, ra.remark,
  ra.create_by, ra.create_time, ra.update_by, ra.update_time, ra.deleted
`

const normalizeRoleIds = (roleIds) => {
  const ids = Array.isArray(roleIds) ? roleIds : [roleIds]
  return [...new Set(ids.map((id) => Number(id)).filter(Boolean))]
}

const buildInClause = (values) => values.map(() => '?').join(', ')

/**
 * 根据角色 ID 查询可访问菜单列表（含按钮节点 menu_type='BUTTON'）。
 * @param {number|number[]} role_id
 * @returns {Promise<Array<any>>}
 */
const findMenusByRoleId = async (role_id) => {
  const roleIds = normalizeRoleIds(role_id)
  if (roleIds.length === 0) {
    return []
  }

  const sql = `
    select distinct
      ${MENU_COLUMNS}
    from RoleRoute rr
    inner join RouteAuth ra on ra.id = rr.route_id
    where rr.role_id in (${buildInClause(roleIds)})
      and ra.deleted = '0'
    order by coalesce(ra.parent_id, 0), ra.sort asc, ra.id asc
  `

  return query(sql, roleIds)
}

/**
 * 根据角色 ID 查询按钮权限节点（menu_type='BUTTON' 的 RouteAuth 行）。
 * @param {number|number[]} role_id
 * @returns {Promise<Array<any>>}
 */
const findButtonsByRoleId = async (role_id) => {
  const roleIds = normalizeRoleIds(role_id)
  if (roleIds.length === 0) {
    return []
  }

  const sql = `
    select distinct
      ra.id as button_id,
      ra.parent_id as route_id,
      ra.route_name,
      ra.menu_name as button_name,
      ra.menu_name as button_label
    from RoleRoute rr
    inner join RouteAuth ra on ra.id = rr.route_id
    where rr.role_id in (${buildInClause(roleIds)})
      and ra.menu_type = 'BUTTON'
      and ra.deleted = '0'
    order by ra.parent_id asc, ra.id asc
  `

  return query(sql, roleIds)
}

export default {
  findMenusByRoleId,
  findButtonsByRoleId
}
