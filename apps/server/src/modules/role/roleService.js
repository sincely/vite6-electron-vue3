/**
 * @module 角色管理 Service
 * @description 封装角色 CRUD、路由/按钮权限管理等业务逻辑
 */

import adminRoleDao from './roleDao.js'
import { getConnection } from '../../db/connection.js'
import { businessCode } from '../../config/businessCode.js'
import { normalizePagination } from '../../schemas/common/paginationSchema.js'

// 前端状态 → DB char(1)：'0'/'2'/0/false → '0'，其余 → '1'
const toDbStatus = (status) => {
  if (status === '0' || status === '2' || Number(status) === 0 || status === false) {
    return '0'
  }
  return '1'
}

// DB 状态 → 前端：统一 '1'/'0'
const toFrontendStatus = (status) => {
  return String(status) === '1' ? '1' : '0'
}

const formatRoleRow = (role) => ({
  id: role.role_id,
  roleId: role.role_id,
  roleCode: role.role_code,
  roleName: role.role_name,
  roleDesc: role.description ?? '',
  description: role.description ?? '',
  remark: role.description ?? '', // 前端 system/role/index.vue 表头期望的字段名
  sort: role.role_sort ?? 0,
  roleSort: role.role_sort ?? 0,
  status: toFrontendStatus(role.status),
  isSystem: Boolean(role.is_system),
  userCount: Number(role.userCount || 0),
  routeIds: role.routeIds || []
})

/**
 * 获取角色列表
 */
export const listRoles = async (query) => {
  const { current, size, page, pageSize, pageNum, roleName, roleCode, status } = query
  const { actualPage, actualPageSize } = normalizePagination({ current, size, page, pageSize, pageNum })
  const normalizedStatus = status === undefined || status === null || status === '' ? undefined : toDbStatus(status)

  const filterParams = {
    role_name: roleName || '',
    role_code: roleCode || '',
    status: normalizedStatus
  }

  const [roles, total] = await Promise.all([
    adminRoleDao.listRoles({ page: actualPage, pageSize: actualPageSize, ...filterParams }),
    adminRoleDao.countRoles(filterParams)
  ])

  const roleList = await Promise.all(
    roles.map(async (role) => {
      const routeIds = await adminRoleDao.getRouteIdsByRoleId(role.role_id)
      return {
        ...formatRoleRow(role),
        routeIds
      }
    })
  )

  return {
    // records 为新契约；rows 兼容前端 AdvanceTable 读取约定
    records: roleList,
    rows: roleList,
    current: actualPage,
    size: actualPageSize,
    total: Number(total)
  }
}

/**
 * 创建角色
 */
export const createRole = async (body) => {
  const { roleName, roleCode, roleDesc, description, remark, sort, roleSort, status } = body
  // 前端用 remark 承载描述；兼容 roleDesc / description
  const normalizedDescription = remark ?? roleDesc ?? description ?? ''
  const normalizedSort = Number(sort ?? roleSort ?? 0) || 0
  const existedRole = await adminRoleDao.findRoleByName(roleName, roleCode)

  if (existedRole) {
    return { success: false, code: businessCode.roleExist }
  }

  const result = await adminRoleDao.createRole({
    role_name: roleName,
    role_code: roleCode,
    role_sort: normalizedSort,
    description: normalizedDescription,
    status: toDbStatus(status)
  })

  return { success: true, data: { roleId: result.role_id ?? result.insertId, id: result.role_id ?? result.insertId } }
}

/**
 * 更新角色
 */
export const updateRole = async (body) => {
  const { id, roleId: rawRoleId, roleName, roleCode, roleDesc, description, remark, sort, roleSort, status } = body
  const roleId = Number(rawRoleId || id)
  const normalizedDescription = remark ?? roleDesc ?? description ?? ''
  const normalizedSort = sort ?? roleSort
  const currentRole = await adminRoleDao.findRoleById(roleId)

  if (!currentRole) {
    return { success: false, code: businessCode.roleNotFound }
  }

  const existedRole = await adminRoleDao.findRoleByName(roleName, roleCode)
  if (existedRole && Number(existedRole.role_id) !== roleId) {
    return { success: false, code: businessCode.roleExist }
  }

  const payload = {
    role_name: roleName,
    role_code: roleCode,
    description: normalizedDescription,
    status: toDbStatus(status)
  }
  if (normalizedSort !== undefined) {
    payload.role_sort = Number(normalizedSort) || 0
  }

  await adminRoleDao.updateRole(roleId, payload)

  return { success: true }
}

/**
 * 删除角色
 */
export const deleteRole = async (roleIdOrId) => {
  const roleId = Number(roleIdOrId)
  const currentRole = await adminRoleDao.findRoleById(roleId)

  if (!currentRole) {
    return { success: false, code: businessCode.roleNotFound }
  }

  const userCount = await adminRoleDao.countUsersByRoleId(roleId)
  if (userCount > 0) {
    return { success: false, code: businessCode.roleInUse }
  }

  await adminRoleDao.deleteRole(roleId)
  return { success: true }
}

/**
 * 获取全部角色（选项列表）
 */
export const getAllRoles = async () => {
  const roles = await adminRoleDao.listAllRoles()
  return {
    success: true,
    data: roles.map((role) => ({
      roleId: role.role_id,
      roleCode: role.role_code,
      roleName: role.role_name,
      status: toFrontendStatus(role.status)
    }))
  }
}

/**
 * 获取角色路由 ID 列表
 */
export const getRoleRouteIds = async (roleId) => {
  const routeIds = await adminRoleDao.getRouteIdsByRoleId(Number(roleId))
  return { success: true, data: routeIds }
}

/**
 * 更新角色路由绑定
 */
export const updateRoleRouteIds = async ({ roleId, routeIds }) => {
  const currentRole = await adminRoleDao.findRoleById(roleId)
  if (!currentRole) {
    return { success: false, code: businessCode.roleNotFound }
  }

  const connection = await getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute('delete from RoleRoute where role_id = ?', [roleId])
    if (routeIds && routeIds.length > 0) {
      const valuesSql = routeIds.map(() => '(?, ?)').join(', ')
      const values = routeIds.flatMap((id) => [roleId, id])
      await connection.execute(`insert into RoleRoute (role_id, route_id) values ${valuesSql}`, values)
    }
    await connection.commit()

    return { success: true }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
