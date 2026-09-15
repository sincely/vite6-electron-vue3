import { getConnection, query } from '../../db/connection.js'

/**
 * 菜单列表查询的公共字段（与新 schema 对齐：path / sort / visible / is_cache / frame / link / permission / deleted）。
 */
const MENU_COLUMNS = `
  id, parent_id, menu_type, menu_name, route_name, path,
  component, redirect, sort, icon, permission,
  frame, link, is_cache, visible, status, is_system, remark,
  create_by, create_time, update_by, update_time, deleted
`

/**
 * 查询菜单列表（按父子关系排序）。
 * @returns {Promise<Array<any>>}
 */
const listMenus = async () => {
  const sql = `
    select ${MENU_COLUMNS}
    from RouteAuth
    order by coalesce(parent_id, 0), sort asc, id asc
  `

  return query(sql)
}

/**
 * 根据菜单 ID 查询单条菜单。
 * @param {number} id
 * @returns {Promise<any | null>}
 */
const findMenuById = async (id) => {
  const sql = `
    select ${MENU_COLUMNS}
    from RouteAuth
    where id = ?
    limit 1
  `
  const rows = await query(sql, [id])
  return rows[0] || null
}

/**
 * 根据 path 查询菜单（唯一性校验使用）。
 * @param {string} path
 * @returns {Promise<any | null>}
 */
const findMenuByPath = async (path) => {
  const sql = 'select id, path from RouteAuth where path = ? limit 1'
  const rows = await query(sql, [path])
  return rows[0] || null
}

/**
 * 根据 route_name 查询菜单（唯一性校验使用，按 menu_type 区分避免与 NULL 冲突）。
 * @param {string} route_name
 * @returns {Promise<any | null>}
 */
const findMenuByName = async (route_name) => {
  const sql = 'select id, route_name from RouteAuth where menu_type = ? and route_name = ? limit 1'
  const rows = await query(sql, ['MENU', route_name])
  return rows[0] || null
}

/**
 * 创建菜单。
 * @param {object} payload
 * @returns {Promise<any>}
 */
const createMenu = async (payload) => {
  const sql = `
    insert into RouteAuth (
      parent_id, menu_type, menu_name, sort, icon, route_name, path,
      component, redirect, permission, frame, link, is_cache, visible, status, is_system, remark
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const params = [
    payload.parent_id ?? 0,
    payload.menu_type ?? 'MENU',
    payload.menu_name,
    payload.sort ?? 0,
    payload.icon ?? null,
    payload.route_name ?? null,
    payload.path ?? null,
    payload.component ?? null,
    payload.redirect ?? null,
    payload.permission ?? null,
    payload.frame === '1' || payload.frame === 1 ? '1' : '0',
    payload.link ?? null,
    payload.is_cache === '1' || payload.is_cache === 1 ? '1' : '0',
    payload.visible === '0' || payload.visible === 0 ? '0' : '1',
    payload.status === '0' || payload.status === 0 ? '0' : '1',
    payload.is_system === '1' || payload.is_system === 1 ? '1' : '0',
    payload.remark ?? ''
  ]

  return query(sql, params)
}

/**
 * 动态更新菜单字段，仅更新 payload 中出现的列。
 * @param {number} id
 * @param {Record<string, any>} payload
 * @returns {Promise<any>}
 */
const updateMenu = async (id, payload) => {
  const fields = []
  const params = []

  for (const [key, value] of Object.entries(payload)) {
    fields.push(`${key} = ?`)
    params.push(value)
  }

  if (fields.length === 0) {
    return { affectedRows: 0 }
  }

  const sql = `update RouteAuth set ${fields.join(', ')} where id = ?`
  return query(sql, [...params, id])
}

/**
 * 统计指定菜单的子菜单数量。
 * @param {number} id
 * @returns {Promise<number>}
 */
const countChildren = async (id) => {
  const sql = 'select count(*) as total from RouteAuth where parent_id = ?'
  const rows = await query(sql, [id])
  return rows[0]?.total || 0
}

/**
 * 删除菜单（事务）：
 * 1) 删除角色路由关系
 * 2) 删除菜单自身
 * @param {number} id
 * @returns {Promise<any>}
 */
const deleteMenu = async (id) => {
  const connection = await getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute('delete from RoleRoute where route_id = ?', [id])
    const [result] = await connection.execute('delete from RouteAuth where id = ?', [id])
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

/**
 * 分页查询菜单列表（按父子关系排序）。
 * @param {{ page?: number, pageSize?: number, keyword?: string }} options
 * @returns {Promise<Array<any>>}
 */
const listMenusPaginated = async ({ page = 1, pageSize = 10, keyword = '' } = {}) => {
  const offset = (Number(page) - 1) * Number(pageSize)
  let whereClause = ''
  const params = []

  if (keyword) {
    whereClause = ' where (menu_name like ? or path like ? or route_name like ?)'
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }

  const sql = `
    select ${MENU_COLUMNS}
    from RouteAuth
    ${whereClause}
    order by coalesce(parent_id, 0), sort asc, id asc
    limit ? offset ?
  `

  return query(sql, [...params, Number(pageSize), offset])
}

/**
 * 统计菜单总数（支持关键词过滤）。
 * @param {{ keyword?: string }} options
 * @returns {Promise<number>}
 */
const countMenus = async ({ keyword = '' } = {}) => {
  let whereClause = ''
  const params = []

  if (keyword) {
    whereClause = ' where (menu_name like ? or path like ? or route_name like ?)'
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }

  const sql = `select count(*) as total from RouteAuth${whereClause}`
  const rows = await query(sql, params)
  return rows[0]?.total || 0
}

/**
 * 批量删除菜单。
 * @param {number[]} ids
 * @returns {Promise<void>}
 */
const deleteMenus = async (ids) => {
  const connection = await getConnection()
  const safeIds = [...new Set((ids || []).map((id) => Number(id)).filter(Boolean))]

  try {
    await connection.beginTransaction()
    for (const id of safeIds) {
      await connection.execute('delete from RoleRoute where route_id = ?', [id])
      await connection.execute('delete from RouteAuth where id = ?', [id])
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default {
  listMenus,
  listMenusPaginated,
  countMenus,
  findMenuById,
  findMenuByPath,
  findMenuByName,
  createMenu,
  updateMenu,
  countChildren,
  deleteMenu,
  deleteMenus
}
