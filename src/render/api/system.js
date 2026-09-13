/**
 * 系统管理模块 API（用户 / 角色 / 菜单）
 * 请求链路：渲染进程 → IPC → 主进程 axios → 后端 nitro mock
 * request() 已统一拆业务信封，await 后直接拿到业务本体。
 * api 层只关注数据本身，不再做 envelope 拆层。
 */
import request from '@/utils/request'

export const getUserList = (params) =>
  request({ url: '/system/users/list', method: 'get', params })

export const createUser = (data) =>
  request({ url: '/system/users/create', method: 'post', data })

export const updateUser = (data) =>
  request({ url: '/system/users/update', method: 'put', data })

export const deleteUsers = (data) =>
  request({ url: '/system/users/delete', method: 'post', data })

// ---------- 角色 ----------
export const getRoleList = (params) =>
  request({ url: '/system/roles/list', method: 'get', params })

export const createRole = (data) =>
  request({ url: '/system/roles/create', method: 'post', data })

export const updateRole = (data) =>
  request({ url: '/system/roles/update', method: 'put', data })

export const deleteRoles = (data) =>
  request({ url: '/system/roles/delete', method: 'post', data })

// ---------- 菜单 ----------
export const getMenuList = (params) =>
  request({ url: '/system/menus/list', method: 'get', params })

export const createMenu = (data) =>
  request({ url: '/system/menus/create', method: 'post', data })

export const updateMenu = (data) =>
  request({ url: '/system/menus/update', method: 'put', data })

export const deleteMenus = (data) =>
  request({ url: '/system/menus/delete', method: 'post', data })
