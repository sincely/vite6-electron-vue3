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
export const getUserInfo = () => {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 退出登录
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
