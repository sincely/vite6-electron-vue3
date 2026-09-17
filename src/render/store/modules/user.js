import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getUserInfo, logout } from '@/api/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref(null)
    const permissions = ref([])
    const roles = ref([])

    function setToken(value) {
      token.value = value
    }

    function setUserInfo(value) {
      userInfo.value = value
    }

    function setPermissions(value) {
      permissions.value = value
    }

    function setRoles(value) {
      roles.value = value
    }

    // 重置用户状态
    function resetUserState() {
      token.value = ''
      userInfo.value = null
      permissions.value = []
      roles.value = []
    }

    // 登录
    async function loginAction(params) {
      try {
        const payload = await login(params)
        setToken(payload?.accessToken || payload?.token)
        await getUserInfoAction()
        return payload
      } catch (error) {
        return Promise.reject(error)
      }
    }

    // 获取用户信息
    async function getUserInfoAction() {
      try {
        const payload = await getUserInfo()
        userInfo.value = payload
        permissions.value = payload?.permissions || []
        roles.value = payload?.roles || []
        return payload
      } catch (error) {
        return Promise.reject(error)
      }
    }

    // 退出登录
    async function logoutAction() {
      try {
        await logout()
        resetUserState()
        return true
      } catch (error) {
        return Promise.reject(error)
      }
    }

    // 检查用户权限（'*:*:*' 为超级权限通配符，拥有全部权限）
    function hasPermission(permission) {
      if (permissions.value.includes('*:*:*')) return true
      return permissions.value.includes(permission)
    }

    // 检查用户角色
    function hasRole(role) {
      return roles.value.includes(role)
    }

    return {
      token,
      userInfo,
      permissions,
      roles,
      setToken,
      setUserInfo,
      setPermissions,
      setRoles,
      resetUserState,
      loginAction,
      getUserInfoAction,
      logoutAction,
      hasPermission,
      hasRole
    }
  },
  { persist: true }
)
