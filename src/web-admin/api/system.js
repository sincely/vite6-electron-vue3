import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/system/users/list',
    method: 'get',
    params
  })
}

export function createUser(data) {
  return request({
    url: '/system/users/create',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/system/users/update',
    method: 'put',
    data
  })
}

export function deleteUsers(data) {
  return request({
    url: '/system/users/delete',
    method: 'post',
    data
  })
}

export function getRoleList(params) {
  return request({
    url: '/system/roles/list',
    method: 'get',
    params
  })
}

export function createRole(data) {
  return request({
    url: '/system/roles/create',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/system/roles/update',
    method: 'put',
    data
  })
}

export function deleteRoles(data) {
  return request({
    url: '/system/roles/delete',
    method: 'post',
    data
  })
}

export function getMenuList(params) {
  return request({
    url: '/system/menus/list',
    method: 'get',
    params
  })
}

export function createMenu(data) {
  return request({
    url: '/system/menus/create',
    method: 'post',
    data
  })
}

export function updateMenu(data) {
  return request({
    url: '/system/menus/update',
    method: 'put',
    data
  })
}

export function deleteMenus(data) {
  return request({
    url: '/system/menus/delete',
    method: 'post',
    data
  })
}
