import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/mock/system/users/list',
    method: 'get',
    params
  })
}

export function createUser(data) {
  return request({
    url: '/mock/system/users/create',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/mock/system/users/update',
    method: 'put',
    data
  })
}

export function deleteUsers(data) {
  return request({
    url: '/mock/system/users/delete',
    method: 'post',
    data
  })
}

export function getRoleList(params) {
  return request({
    url: '/mock/system/roles/list',
    method: 'get',
    params
  })
}

export function createRole(data) {
  return request({
    url: '/mock/system/roles/create',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/mock/system/roles/update',
    method: 'put',
    data
  })
}

export function deleteRoles(data) {
  return request({
    url: '/mock/system/roles/delete',
    method: 'post',
    data
  })
}

export function getMenuList(params) {
  return request({
    url: '/mock/system/menus/list',
    method: 'get',
    params
  })
}

export function createMenu(data) {
  return request({
    url: '/mock/system/menus/create',
    method: 'post',
    data
  })
}

export function updateMenu(data) {
  return request({
    url: '/mock/system/menus/update',
    method: 'put',
    data
  })
}

export function deleteMenus(data) {
  return request({
    url: '/mock/system/menus/delete',
    method: 'post',
    data
  })
}
