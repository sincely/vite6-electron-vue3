import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/user'
export const useUserStore = defineStore('user', {
  state: () => {
    return {
      token: '',
      userInfo: null,
      permissions: [],
      roles: []
    }
  },
  actions: {
    setToken(token) {
      this.token = token
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo
    },
    setPermissions(permissions) {
      this.permissions = permissions
    },
    setRoles(roles) {
      this.roles = roles
    },
    // 重置用户状态
    resetUserState() {
      this.token = ''
      this.userInfo = null
      this.permissions = []
      this.roles = []
    },

    // 登录
    async loginAction(params) {
      try {
        const data = await login(params)
        this.token = data.token
        await this.getUserInfoAction()
        return data
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async getUserInfoAction() {
      try {
        const data = await getUserInfo()
        this.userInfo = data
        this.permissions = data.permissions || []
        this.roles = data.roles || []
        return data
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 退出登录
    async logoutAction() {
      try {
        await logout()
        this.resetUserState()
        return true
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 检查用户权限
    hasPermission(permission) {
      return this.permissions.includes(permission)
    },

    // 检查用户角色
    hasRole(role) {
      return this.roles.includes(role)
    }
  },
  persist: true
})
