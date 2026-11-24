import request from '@/utils/request'

// 登录
export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取用户信息（token 由 request.js 自动从 userStore 注入）
// skipPermissionRefresh：本接口就是权限重拉的数据源，其 403/401 不再触发刷新，避免自我调用
export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'get',
    skipPermissionRefresh: true
  })
}

// 退出登录
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
