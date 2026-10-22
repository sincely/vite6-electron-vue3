import { watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useTagsViewStore } from '@/store/modules/tagsView'

/**
 * 权限变更监听器：解决"页面不刷新时，已被移除权限的页面仍可停留"的问题。
 *
 * router.beforeEach 只能拦截【新的导航】；当后端移除权限、前端通过
 * 403 信号（utils/request.js）或冷启动静默刷新（router/index.js 守卫）
 * 更新 store 后，用户当前已停留的页面不会再触发导航守卫。
 *
 * 这里监听 roles/permissions 的变化，按与守卫一致的口径重新校验当前路由的
 * meta.roles，不再满足时提示并退回工作台，同时关闭对应标签页。
 * 菜单（config/menu.js visibleMenuItems）与按钮指令（v-permission / v-role）
 * 本身是响应式的，会随 store 刷新自动收敛，无需在此处理。
 *
 * @param {import('vue-router').Router} router 路由实例
 */
export function setupPermissionWatcher(router) {
  const userStore = useUserStore()

  watch(
    () => [userStore.roles, userStore.permissions],
    () => {
      // 退出登录流程中 resetUserState 会清空 roles：此时 token 已清除，
      // 由路由守卫负责跳转登录页，这里不重复弹"权限已变更"的提示
      if (!userStore.token) return

      const current = router.currentRoute.value
      const requiredRoles = current?.meta?.roles
      // 与 beforeEach 守卫同一校验口径：未声明 meta.roles 的路由不限制
      if (!requiredRoles?.length) return
      if (requiredRoles.some((role) => userStore.roles.includes(role))) return

      ElMessage.warning('权限已变更，您已无法访问当前页面')
      // 关闭失权页面的标签页（removeView 会同步清除 keep-alive 缓存）
      useTagsViewStore().removeView({ path: current.path, name: current.name })
      router.replace('/desktop')
    },
    { deep: true }
  )
}
