/**
 * @module 认证 Controller
 * @description HTTP 适配层，负责请求/响应转换，业务逻辑委托给 authService
 *
 * 说明：本模块是认证相关的唯一控制器。
 * 历史上路由文件内联过一套处理函数，现已统一收敛到这里，避免同一职责存在两份实现。
 */

import * as authService from './authService.js'
import { businessCode, businessMsg } from '../../config/businessCode.js'
import { createSuccessResponse, createFailResponse } from '../../core/response.js'

/**
 * 前端兼容 - 登录
 */
const frontendLogin = async (ctx) => {
  const loginIp = ctx.headers['x-forwarded-for'] || ctx.headers['x-real-ip'] || ctx.ip || ctx.request.ip || 'unknown'
  const userAgent = ctx.headers['user-agent'] || ''

  const result = await authService.frontendLogin({
    ...ctx.request.body,
    loginIp,
    userAgent
  })

  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code], result.data))
  }

  // 写入 Session（Redis Store 会在响应结束时自动持久化）
  ctx.session.user = {
    userId: result.data.userId,
    token: result.data.token,
    refreshToken: result.data.refreshToken,
    sessionId: result.data.sessionId
  }

  ctx.body = createSuccessResponse(businessCode.success, '登录成功', result.data)
}

/**
 * 前端兼容 - 获取用户信息
 */
const frontendGetUserInfo = async (ctx) => {
  const result = await authService.frontendGetUserInfo(ctx.state.user.userId)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '获取用户信息成功', result.data)
}

/**
 * 前端兼容 - 刷新 Token
 */
const frontendRefreshToken = async (ctx) => {
  const { refreshToken } = ctx.request.body
  const result = await authService.frontendRefreshToken(refreshToken)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, result.msg || businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '刷新成功', result.data)
}

/**
 * 前端兼容 - 登出
 */
const frontendLogout = async (ctx) => {
  const userId = ctx.state.user?.userId
  await authService.frontendLogout(userId)

  // 清除 Session（Redis Store 会在响应结束时删除对应 key）
  ctx.session = null

  ctx.body = createSuccessResponse(businessCode.success, '退出成功')
}

/**
 * 自定义后端错误（调试用）
 */
const customError = async (ctx) => {
  const code = Number(ctx.query.code) || businessCode.error
  const msg = ctx.query.msg || '自定义后端错误'
  ctx.body = createFailResponse(code, msg)
}

/**
 * 后台注册
 */
const register = async (ctx) => {
  const result = await authService.register(ctx.request.body)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, result.msg))
  }
  ctx.body = createSuccessResponse(businessCode.success, '注册成功', result.data)
}

/**
 * 后台登录
 */
const login = async (ctx) => {
  const result = await authService.login(ctx.request.body)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '登录成功', result.data)
}

/**
 * 获取当前用户信息
 */
const getProfile = async (ctx) => {
  const result = await authService.getProfile(ctx.state.user.userId)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '获取用户信息成功', result.data)
}

/**
 * 获取当前用户菜单
 */
const getMenus = async (ctx) => {
  const result = await authService.getMenus(ctx.state.user.roleIds, ctx.state.user.roleId)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '获取菜单成功', result.data)
}

/**
 * 获取当前用户权限
 */
const getPermissions = async (ctx) => {
  const result = await authService.getPermissions(ctx.state.user.roleIds, ctx.state.user.roleId)
  if (!result.success) {
    return (ctx.body = createFailResponse(result.code, businessMsg[result.code]))
  }
  ctx.body = createSuccessResponse(businessCode.success, '获取权限成功', result.data)
}

/**
 * 后台退出登录
 */
const logout = async (ctx) => {
  ctx.body = createSuccessResponse(businessCode.success, '退出成功')
}

export default {
  frontendLogin,
  frontendGetUserInfo,
  frontendRefreshToken,
  frontendLogout,
  customError,
  register,
  login,
  getProfile,
  getMenus,
  getPermissions,
  logout
}
