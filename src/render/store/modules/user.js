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
        const payload = await login(params)
        this.setToken(payload?.accessToken || payload?.token)
        await this.getUserInfoAction()
        return payload
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户信息
    async getUserInfoAction() {
      try {
        const payload = await getUserInfo()
        this.userInfo = payload
        this.permissions = payload?.permissions || []
        this.roles = payload?.roles || []
        return payload
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

    // 检查用户权限（'*:*:*' 为超级权限通配符，拥有全部权限）
    hasPermission(permission) {
      if (this.permissions.includes('*:*:*')) return true
      return this.permissions.includes(permission)
    },

    // 检查用户角色
    hasRole(role) {
      return this.roles.includes(role)
    }
  },
  persist: true
})
