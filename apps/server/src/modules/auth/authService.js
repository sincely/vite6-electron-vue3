/**
 * @module 认证 Service
 * @description 封装登录、注册、权限快照等核心业务逻辑
 *
 * 返回契约统一为 `{ success, code?, msg?, data? }`：
 *   - 成功：{ success: true, data }
 *   - 失败：{ success: false, code, msg? }
 *
 * 数据访问统一经本模块的 DAO；跨模块协作经对方模块的公开 API。
 */

import { randomUUID } from 'crypto'
import authDao from './authDao.js'
import { permissionService } from '../permission/index.js'
import { loginLogService } from '../log/index.js'
import { businessCode } from '../../config/businessCode.js'
import { defaultAdminRoleName } from '../../config/admin.js'
import { hashPassword, comparePassword } from '../../shared/password.js'
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../../shared/jwt.js'
import { buildMenuTree, extractPermissionCodes } from '../../shared/menu-tree.js'
import { detectBrowser, detectOS } from '../../shared/user-agent.js'
import { checkLoginLock, recordLoginFailure, clearLoginLock } from '../../shared/login-limiter.js'
import { getIpLocation } from '../../shared/ip-location.js'

/**
 * 解析角色 ID 列表
 * @param {string|number|undefined} value
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
 * 解析角色名称列表
 * @param {string|undefined} value
 * @param {string|undefined} fallbackRoleName
 * @returns {string[]}
 */
const parseRoleNames = (value, fallbackRoleName) => {
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return fallbackRoleName ? [fallbackRoleName] : []
}

/**
 * 解析角色编码列表
 * @param {string|undefined} value
 * @param {string|undefined} fallbackRoleCode
 * @returns {string[]}
 */
const parseRoleCodes = (value, fallbackRoleCode) => {
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return fallbackRoleCode ? [fallbackRoleCode] : []
}

const formatUserInfo = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  status: user.status,
  avatar: user.avatar,
  roleId: user.role_id,
  roleIds: parseRoleIds(user.roleIds, user.role_id),
  roleCode: user.role_code,
  roleCodes: parseRoleCodes(user.roleCodes, user.role_code),
  roleName: user.role_name,
  roleNames: parseRoleNames(user.roleNames, user.role_name),
  roleDescription: user.roleDescription
})

/**
 * 构建权限快照（菜单树 + 按钮权限 + 权限码）
 * @param {number[]} roleIds
 * @returns {Promise<{menuTree: Array, buttons: Array, permissionCodes: string[]}>}
 */
const buildPermissionSnapshot = async (roleIds) => {
  const allRows = await permissionService.findMenusByRoleId(roleIds)
  // 分离菜单（目录/菜单）和按钮（menu_type='BUTTON'）
  const isButton = (row) => String(row.menu_type).toUpperCase() === 'BUTTON'
  const menus = allRows.filter((row) => !isButton(row))
  const buttons = allRows.filter(isButton).map((row) => ({
    button_code: row.permission || '',
    button_name: row.menu_name,
    route_id: row.parent_id,
    route_name: row.route_name || ''
  }))

  const permissionCodes = extractPermissionCodes(menus, buttons)

  return {
    menuTree: buildMenuTree(menus),
    buttons,
    permissionCodes: permissionCodes.buttons
  }
}

/**
 * 管理员注册
 * @returns {Promise<{success: boolean, code?: number, msg?: string, data?: object}>}
 */
export const register = async ({ username, password, email }) => {
  const existedUser = await authDao.findAdminUserByUsername(username)
  if (existedUser) {
    return { success: false, code: businessCode.userExist }
  }

  const existedEmail = await authDao.findAdminUserByEmail(email)
  if (existedEmail) {
    return { success: false, code: businessCode.emailExist }
  }

  const defaultRole = await authDao.findRoleByName(defaultAdminRoleName)
  if (!defaultRole) {
    return { success: false, code: businessCode.roleNotFound }
  }

  const passwordHash = await hashPassword(password)
  const registerResult = await authDao.createAdminUser({
    username,
    email,
    passwordHash,
    role_id: defaultRole.role_id
  })

  if (registerResult.affectedRows !== 1) {
    return { success: false, code: businessCode.error, msg: '注册失败' }
  }

  return {
    success: true,
    data: { username, email, role_name: defaultRole.role_name }
  }
}

/**
 * 管理员登录（后台管理端）
 * @returns {Promise<{success: boolean, code?: number, data?: object}>}
 */
export const login = async ({ username, password }) => {
  const user = await authDao.findAdminUserByUsername(username)
  if (!user) {
    return { success: false, code: businessCode.userLoginFail }
  }

  if (Number(user.status) !== 1) {
    return { success: false, code: businessCode.adminUserDisabled }
  }

  const passwordMatched = await comparePassword(password, user.password)
  if (!passwordMatched) {
    return { success: false, code: businessCode.userLoginFail }
  }

  const roleIds = parseRoleIds(user.roleIds, user.role_id)
  const roleCodes = parseRoleCodes(user.roleCodes, user.role_code)
  const roleNames = parseRoleNames(user.roleNames, user.role_name)
  const permissionSnapshot = await buildPermissionSnapshot(roleIds)
  const token = generateToken({
    userId: user.id,
    username: user.username,
    roleId: user.role_id,
    roleIds,
    roleCode: user.role_code,
    roleCodes,
    roleName: user.role_name,
    roleNames
  })

  return {
    success: true,
    data: {
      token,
      user: formatUserInfo(user),
      menus: permissionSnapshot.menuTree,
      permissions: permissionSnapshot.permissionCodes,
      buttons: permissionSnapshot.buttons
    }
  }
}

/**
 * 获取当前用户信息
 * @param {number} userId
 * @returns {Promise<{success: boolean, code?: number, data?: object}>}
 */
export const getProfile = async (userId) => {
  const currentUser = await authDao.findAdminUserById(userId)
  if (!currentUser) {
    return { success: false, code: businessCode.userNotFound }
  }
  return { success: true, data: formatUserInfo(currentUser) }
}

/**
 * 获取当前用户菜单
 * @returns {Promise<{success: true, data: Array}>}
 */
export const getMenus = async (roleIds, roleId) => {
  const ids = parseRoleIds(roleIds, roleId)
  const permissionSnapshot = await buildPermissionSnapshot(ids)
  return { success: true, data: permissionSnapshot.menuTree }
}

/**
 * 获取当前用户权限
 * @returns {Promise<{success: true, data: object}>}
 */
export const getPermissions = async (roleIds, roleId) => {
  const ids = parseRoleIds(roleIds, roleId)
  const permissionSnapshot = await buildPermissionSnapshot(ids)
  return {
    success: true,
    data: {
      menus: permissionSnapshot.menuTree,
      buttons: permissionSnapshot.buttons,
      permissions: permissionSnapshot.permissionCodes
    }
  }
}

// ─── 前端兼容接口 ────────────────────────────────────────────

/**
 * 组装登录日志数据
 * @param {object} params
 * @returns {Promise<object>}
 */
const buildLoginLogData = async ({ userId, username, loginIp, userAgent, status, message, sessionId }) => ({
  user_id: userId,
  username,
  login_type: 'password',
  ip_address: loginIp,
  location: await getIpLocation(loginIp),
  browser: detectBrowser(userAgent),
  os: detectOS(userAgent),
  user_agent: userAgent,
  status,
  message,
  session_id: sessionId ?? null
})

/**
 * 前端兼容登录
 * @param {object} params - { userName, password, loginIp, userAgent }
 * @returns {Promise<{success: boolean, code?: number, data?: object}>}
 */
export const frontendLogin = async ({ userName, password, loginIp, userAgent }) => {
  const username = userName

  // ── 1. 检查用户名是否被锁定 ──
  const lockStatus = await checkLoginLock(username)
  if (lockStatus.locked) {
    return {
      success: false,
      code: businessCode.accountLocked,
      data: { retryAfter: lockStatus.retryAfter }
    }
  }

  const user = await authDao.findAdminUserByUsername(username)
  if (!user) {
    // ── 记录失败并获取剩余次数 ──
    const failResult = await recordLoginFailure(username)
    await loginLogService.createLoginLog(
      await buildLoginLogData({
        userId: null,
        username,
        loginIp,
        userAgent,
        status: 0,
        message: failResult.locked ? '登录失败次数过多，账号已锁定' : '用户名或密码错误'
      })
    )
    return {
      success: false,
      code: failResult.locked ? businessCode.accountLocked : businessCode.userLoginFail,
      data: { remainingAttempts: failResult.remaining, retryAfter: failResult.locked ? 15 * 60 : 0 }
    }
  }

  if (Number(user.status) !== 1) {
    await loginLogService.createLoginLog(
      await buildLoginLogData({
        userId: user.id,
        username,
        loginIp,
        userAgent,
        status: 0,
        message: '账号已被禁用'
      })
    )
    return { success: false, code: businessCode.adminUserDisabled }
  }

  const passwordMatched = await comparePassword(password, user.password)
  if (!passwordMatched) {
    // ── 密码错误：记录失败 ──
    const failResult = await recordLoginFailure(username)
    await loginLogService.createLoginLog(
      await buildLoginLogData({
        userId: user.id,
        username,
        loginIp,
        userAgent,
        status: 0,
        message: failResult.locked ? '登录失败次数过多，账号已锁定' : '用户名或密码错误'
      })
    )
    return {
      success: false,
      code: failResult.locked ? businessCode.accountLocked : businessCode.userLoginFail,
      data: { remainingAttempts: failResult.remaining, retryAfter: failResult.locked ? 15 * 60 : 0 }
    }
  }

  // 生成会话 ID 和登录信息
  const sessionId = randomUUID()
  const sessionExpire = new Date()
  sessionExpire.setDate(sessionExpire.getDate() + 7)

  const payload = {
    userId: user.id,
    username: user.username,
    roleId: user.role_id,
    roleIds: parseRoleIds(user.roleIds, user.role_id),
    roleCode: user.role_code,
    roleCodes: parseRoleCodes(user.roleCodes, user.role_code),
    roleName: user.role_name,
    roleNames: parseRoleNames(user.roleNames, user.role_name),
    sessionId
  }

  const token = generateToken(payload)
  const refreshToken = generateRefreshToken(payload)

  // 将 sessionId、登录信息写入用户表
  await authDao.updateUserSession(user.id, sessionId, refreshToken, loginIp, sessionExpire)

  // 记录登录成功日志
  await loginLogService.createLoginLog(
    await buildLoginLogData({
      userId: user.id,
      username,
      loginIp,
      userAgent,
      status: 1,
      message: '登录成功',
      sessionId
    })
  )

  // 登录成功，清除锁定计数
  await clearLoginLock(username)

  return {
    success: true,
    data: {
      userId: user.id,
      token,
      refreshToken,
      sessionId
    }
  }
}

/**
 * 前端兼容 - 获取用户信息（含按钮权限）
 * @param {number} userId
 * @returns {Promise<{success: boolean, code?: number, data?: object}>}
 */
export const frontendGetUserInfo = async (userId) => {
  const currentUser = await authDao.findAdminUserById(userId)
  if (!currentUser) {
    return { success: false, code: businessCode.userNotFound }
  }

  const roleIds = parseRoleIds(currentUser.roleIds, currentUser.role_id)
  const roleCodes = parseRoleCodes(currentUser.roleCodes, currentUser.role_code)
  const buttons = await permissionService.findButtonsByRoleId(roleIds)
  // 权限码存储在 sys_menu.permission（如 system:user:add），menu_name 只是展示名
  const buttonCodes = [...new Set(buttons.map((b) => b.permission).filter(Boolean))]

  // 仅返回角色已授权的菜单（不含按钮），前端据此展示侧边栏
  const grantedRows = await permissionService.findMenusByRoleId(roleIds)
  const grantedMenus = grantedRows.filter((row) => String(row.menu_type).toUpperCase() !== 'BUTTON')
  // 树形菜单：后端 RBAC 数据（sys_menu）的层级结构
  const menus = buildMenuTree(grantedMenus)

  return {
    success: true,
    data: {
      userId: currentUser.id,
      userName: currentUser.username,
      roles: roleCodes,
      buttons: buttonCodes,
      // 后端授权菜单树（sys_menu 层级）：static 模式作授权过滤输入，dynamic 模式作路由与菜单唯一事实源
      menus
    }
  }
}

/**
 * 前端兼容 - 刷新 Token
 * @param {string} refreshToken
 * @returns {Promise<{success: boolean, code?: number, msg?: string, data?: object}>}
 */
export const frontendRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    return { success: false, code: businessCode.paramError, msg: '缺少refreshToken参数' }
  }

  try {
    const decoded = verifyRefreshToken(refreshToken)

    // 单设备登录控制：校验用户表中的 current_refresh_token 是否匹配
    const currentRefreshToken = await authDao.getUserRefreshToken(decoded.userId)
    if (currentRefreshToken !== refreshToken) {
      return { success: false, code: businessCode.accountKicked }
    }

    const payload = {
      userId: decoded.userId,
      username: decoded.username,
      roleId: decoded.roleId,
      roleIds: decoded.roleIds,
      roleCode: decoded.roleCode,
      roleCodes: decoded.roleCodes,
      roleName: decoded.roleName,
      roleNames: decoded.roleNames
    }

    const newToken = generateToken(payload)
    const newRefreshToken = generateRefreshToken(payload)

    await authDao.updateUserRefreshToken(decoded.userId, newRefreshToken)

    return {
      success: true,
      data: { token: newToken, refreshToken: newRefreshToken }
    }
  } catch {
    return { success: false, code: businessCode.accountKicked }
  }
}

/**
 * 前端兼容 - 登出（清除 sessionId 和 current_refresh_token）
 * @param {number} userId
 * @returns {Promise<void>}
 */
export const frontendLogout = async (userId) => {
  if (userId) {
    await authDao.clearUserSession(userId)
  }
}
