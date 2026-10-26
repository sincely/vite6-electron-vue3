/**
 * @module 角色管理 Service
 * @description 封装角色 CRUD、路由/按钮权限管理等业务逻辑
 */

import roleDao from './roleDao.js'
import { businessCode } from '../../config/businessCode.js'
import { normalizePagination } from '../../shared/pagination.js'
import { toDbStatus, toFrontendStatus } from '../../shared/status.js'

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
  createTime: role.create_time ?? '',
  updateTime: role.update_time ?? '',
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
    roleDao.listRoles({ page: actualPage, pageSize: actualPageSize, ...filterParams }),
    roleDao.countRoles(filterParams)
  ])

  const roleList = await Promise.all(
    roles.map(async (role) => {
      const routeIds = await roleDao.getRouteIdsByRoleId(role.role_id)
      return {
        ...formatRoleRow(role),
        routeIds
      }
    })
  )

  return {
    success: true,
    data: {
      // records 为新契约；rows 兼容前端 AdvanceTable 读取约定
      records: roleList,
      rows: roleList,
      current: actualPage,
      size: actualPageSize,
      total: Number(total)
    }
  }
}

/**
 * 按角色 ID 集合批量查询角色
 * 供用户模块做「角色是否存在」校验时调用。
 * @param {number[]} roleIds
 * @returns {Promise<Array<any>>}
 */
export const findRolesByIds = async (roleIds) => {
  return roleDao.findRolesByIds(roleIds)
}

/**
 * 创建角色
 */
export const createRole = async (body) => {
  const { roleName, roleCode, roleDesc, description, remark, sort, roleSort, status } = body
  // 前端用 remark 承载描述；兼容 roleDesc / description
  const normalizedDescription = remark ?? roleDesc ?? description ?? ''
  const normalizedSort = Number(sort ?? roleSort ?? 0) || 0
  const existedRole = await roleDao.findRoleByName(roleName, roleCode)

  if (existedRole) {
    return { success: false, code: businessCode.roleExist }
  }

  const result = await roleDao.createRole({
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
  const currentRole = await roleDao.findRoleById(roleId)

  if (!currentRole) {
    return { success: false, code: businessCode.roleNotFound }
  }

  const existedRole = await roleDao.findRoleByName(roleName, roleCode)
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

  await roleDao.updateRole(roleId, payload)

  return { success: true }
}

/**
 * 删除角色
 */
export const deleteRole = async (roleIdOrId) => {
  const roleId = Number(roleIdOrId)
  const currentRole = await roleDao.findRoleById(roleId)

  if (!currentRole) {
    return { success: false, code: businessCode.roleNotFound }
  }

  const userCount = await roleDao.countUsersByRoleId(roleId)
  if (userCount > 0) {
    return { success: false, code: businessCode.roleInUse }
  }

  await roleDao.deleteRole(roleId)
  return { success: true }
}

/**
 * 获取全部角色（选项列表）
 */
export const getAllRoles = async () => {
  const roles = await roleDao.listAllRoles()
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
  const routeIds = await roleDao.getRouteIdsByRoleId(Number(roleId))
  return { success: true, data: routeIds }
}

/**
 * 更新角色路由绑定
 */
export const updateRoleRouteIds = async ({ roleId, routeIds }) => {
  const currentRole = await roleDao.findRoleById(roleId)
  if (!currentRole) {
    return { success: false, code: businessCode.roleNotFound }
  }

  await roleDao.replaceRoleRouteIds(roleId, routeIds)

  return { success: true }
}
