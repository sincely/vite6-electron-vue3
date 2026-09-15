/**
 * @module 用户管理 Service
 * @description 封装用户 CRUD、批量操作、状态/密码管理等业务逻辑
 */

import adminUserDao from './userDao.js'
import adminRoleDao from '../role/roleDao.js'
import { businessCode } from '../../config/businessCode.js'
import { hashPassword } from '../../utils/password.js'
import { normalizePagination } from '../../schemas/common/paginationSchema.js'

// 前端展示用性别：男/女（DB enum: male/female/other）
const toFrontendGender = (gender) => {
  if (gender === 'male') {
    return '男'
  }
  if (gender === 'female') {
    return '女'
  }
  return '未知'
}

// 前端提交的性别 → DB enum：兼容 男/女、male/female、1/2
const toDbGender = (gender) => {
  if (gender === '男' || gender === 'male' || gender === '1' || gender === 1) {
    return 'male'
  }
  if (gender === '女' || gender === 'female' || gender === '2' || gender === 2) {
    return 'female'
  }
  return 'other'
}

// 前端状态 → DB：'1'=启用 → '1'；'0'/'2'/0/false → '0'
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

const parseRoleIds = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return []
  }
  return value
    .split(',')
    .map((item) => Number(item))
    .filter(Boolean)
}

const formatUserRow = (row) => {
  const roleIds = parseRoleIds(row.roleIds)
  // 前端 user/index.vue 表头期望的字段：id / username / gender / nickname / mobile / email / avatar / status
  return {
    id: row.id,
    username: row.username,
    gender: toFrontendGender(row.gender),
    nickname: row.nick_name ?? '',
    mobile: row.phone ?? '',
    email: row.email ?? '',
    status: toFrontendStatus(row.status),
    age: row.age,
    idCard: row.id_card ?? '',
    address: row.address ?? '',
    avatar: row.avatar ?? '',
    createBy: row.create_by ?? '',
    createTime: row.create_time ?? '',
    updateBy: row.update_by ?? '',
    updateTime: row.update_time ?? '',
    roleId: roleIds[0] ?? (row.role_id ? Number(row.role_id) : undefined),
    roleIds,
    roleNames: typeof row.roleNames === 'string' && row.roleNames ? row.roleNames.split(',') : []
  }
}

/**
 * 获取用户列表
 */
export const listUsers = async (query) => {
  const {
    current,
    size,
    page,
    pageSize,
    pageNum,
    keyword,
    status,
    roleId,
    // 前端搜索栏字段名
    username,
    nickname,
    mobile,
    email,
    gender,
    // 旧字段名兼容
    userName,
    nickName,
    userEmail,
    userPhone,
    userGender
  } = query
  const { actualPage, actualPageSize } = normalizePagination({ current, size, page, pageSize, pageNum })
  // 任一字段命中即作为关键词模糊查询
  const normalizedKeyword =
    keyword || username || userName || nickname || nickName || email || userEmail || mobile || userPhone || ''
  const normalizedStatus = status === undefined || status === null || status === '' ? undefined : toDbStatus(status)
  const normalizedGender = toDbGender(gender ?? userGender)
  const hasGenderFilter = (gender ?? userGender) !== undefined && (gender ?? userGender) !== ''

  const filterParams = {
    keyword: normalizedKeyword,
    status: normalizedStatus,
    gender: hasGenderFilter ? normalizedGender : undefined,
    roleId
  }

  const [list, total] = await Promise.all([
    adminUserDao.listUsers({ page: actualPage, pageSize: actualPageSize, ...filterParams }),
    adminUserDao.countUsers(filterParams)
  ])

  const records = list.map(formatUserRow)

  return {
    // records 为新契约；rows 兼容前端 AdvanceTable 读取约定
    records,
    rows: records,
    current: actualPage,
    size: actualPageSize,
    total: Number(total)
  }
}

/**
 * 创建用户
 */
export const createUser = async (body) => {
  const {
    username,
    password,
    gender,
    age,
    idCard,
    email,
    address,
    status,
    avatar,
    roleIds,
    // 前端字段名
    nickname,
    mobile,
    // 旧字段名兼容
    nickName,
    phone
  } = body

  const finalNickName = nickname ?? nickName
  const finalPhone = mobile ?? phone

  const [existedUser, existedEmail, existedIdCard, roles] = await Promise.all([
    adminUserDao.findUserByUsername(username),
    adminUserDao.findUserByEmail(email),
    idCard ? adminUserDao.findUserByIdCard(idCard) : Promise.resolve(null),
    adminRoleDao.findRolesByIds(roleIds)
  ])

  if (existedUser) {
    return { success: false, code: businessCode.userExist }
  }
  if (existedEmail) {
    return { success: false, code: businessCode.emailExist }
  }
  if (existedIdCard) {
    return { success: false, code: businessCode.idCardExist }
  }
  if (roles.length !== roleIds.length) {
    return { success: false, code: businessCode.roleNotFound }
  }

  const passwordHash = await hashPassword(password || '123456')
  const result = await adminUserDao.createUser({
    username,
    nickName: finalNickName,
    phone: finalPhone,
    gender: toDbGender(gender),
    age: age ?? null,
    idCard: idCard ?? null,
    email,
    address: address ?? null,
    status: toDbStatus(status),
    avatar: avatar ?? null,
    roleIds,
    passwordHash
  })

  return { success: true, data: { id: result.insertId } }
}

/**
 * 更新用户
 */
export const updateUser = async (body) => {
  const { id, password, email, idCard, roleIds, ...rest } = body
  const currentUser = await adminUserDao.findUserById(id)

  if (!currentUser) {
    return { success: false, code: businessCode.userNotFound }
  }

  if (email) {
    const existedEmail = await adminUserDao.findUserByEmail(email)
    if (existedEmail && existedEmail.id !== id) {
      return { success: false, code: businessCode.emailExist }
    }
  }

  if (idCard) {
    const existedIdCard = await adminUserDao.findUserByIdCard(idCard)
    if (existedIdCard && existedIdCard.id !== id) {
      return { success: false, code: businessCode.idCardExist }
    }
  }

  if (roleIds !== undefined) {
    const roles = await adminRoleDao.findRolesByIds(roleIds)
    if (roles.length !== roleIds.length) {
      return { success: false, code: businessCode.roleNotFound }
    }
  }

  // 前端 camelCase → DB snake_case 字段映射（动态更新直接以 key 作为列名）
  const fieldMap = {
    username: 'username',
    nickname: 'nick_name',
    nickName: 'nick_name',
    mobile: 'phone',
    phone: 'phone',
    gender: 'gender',
    age: 'age',
    address: 'address',
    status: 'status',
    avatar: 'avatar',
    remark: 'remark'
  }

  const payload = {}
  for (const [bodyKey, colKey] of Object.entries(fieldMap)) {
    if (rest[bodyKey] !== undefined) {
      payload[colKey] = rest[bodyKey]
    }
  }

  if (payload.gender !== undefined) {
    payload.gender = toDbGender(payload.gender)
  }
  if (payload.status !== undefined) {
    payload.status = toDbStatus(payload.status)
  }
  if (email !== undefined) {
    payload.email = email
  }
  if (idCard !== undefined) {
    payload.id_card = idCard
  }
  if (password) {
    payload.password = await hashPassword(password)
  }

  await adminUserDao.updateUser(id, payload)
  if (roleIds !== undefined) {
    await adminUserDao.updateUserRoles(id, roleIds)
  }

  return { success: true }
}

/**
 * 删除用户
 */
export const deleteUser = async (id, currentUserId) => {
  if (currentUserId === id) {
    return { success: false, code: businessCode.userDeleteSelfDenied }
  }

  const currentUser = await adminUserDao.findUserById(id)
  if (!currentUser) {
    return { success: false, code: businessCode.userNotFound }
  }

  await adminUserDao.deleteUser(id)
  return { success: true }
}

/**
 * 批量删除用户
 */
export const batchDeleteUsers = async (ids, currentUserId) => {
  if (ids.includes(currentUserId)) {
    return { success: false, code: businessCode.userDeleteSelfDenied }
  }

  const userPromises = ids.map((id) => adminUserDao.findUserById(id))
  const users = await Promise.all(userPromises)
  const notFoundIds = ids.filter((id, index) => !users[index])

  if (notFoundIds.length > 0) {
    return {
      success: false,
      code: businessCode.userNotFound,
      msg: `以下用户不存在: ${notFoundIds.join(', ')}`
    }
  }

  const deletePromises = ids.map((id) => adminUserDao.deleteUser(id))
  await Promise.all(deletePromises)
  return { success: true, data: { count: ids.length } }
}

/**
 * 更新用户状态
 */
export const updateUserStatus = async (id, status, currentUserId) => {
  if (currentUserId === id && status === '2') {
    return { success: false, code: businessCode.userDisableSelfDenied }
  }

  const currentUser = await adminUserDao.findUserById(id)
  if (!currentUser) {
    return { success: false, code: businessCode.userNotFound }
  }

  await adminUserDao.updateUser(id, { status: toDbStatus(status) })
  return { success: true }
}

/**
 * 重置用户密码
 */
export const resetUserPassword = async (id) => {
  const currentUser = await adminUserDao.findUserById(id)
  if (!currentUser) {
    return { success: false, code: businessCode.userNotFound }
  }

  const passwordHash = await hashPassword('123456')
  await adminUserDao.updateUser(id, { password: passwordHash })
  return { success: true }
}
