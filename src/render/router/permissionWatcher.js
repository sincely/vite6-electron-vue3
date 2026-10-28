import { watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { isDynamicMode, registerDynamicRoutes, getHomePath } from './dynamicRoutes'

/**
 * 权限变更监听：解决"页面不刷新时，已被移除权限的页面仍可停留"的问题
 * 在此校验并踢出；菜单与按钮指令本身响应式，无需处理。
 *   static：roles 不再满足当前路由 meta.roles
 *   dynamic：menus 变化 -> 幂等重注册路由，当前路由已不在授权树内
 * 退出登录会清空 roles/menus，此时 token 已清除，由守卫跳登录页，不重复提示。
 *
 * @param {import('vue-router').Router} router 路由实例
 */
export function setupPermissionWatcher(router) {
  const userStore = useUserStore()

  const kickOut = ({ path, name }) => {
    ElMessage.warning('抱歉，您已无法访问当前页面')
    // 关闭失权页面的标签页（removeView 会同步清除 keep-alive 缓存）
    useTagsViewStore().removeView({ path, name })
    router.replace(getHomePath(userStore.menus))
  }

  if (isDynamicMode) {
    watch(
      () => userStore.menus,
      (menus) => {
        // 退出登录流程中 resetUserState 会清空 menus：此时 token 已清除，
        // 由路由守卫负责跳转登录页，这里不重复弹"权限已变更"的提示
        if (!userStore.token || !Array.isArray(menus)) return
        registerDynamicRoutes(router, menus)
        const current = router.currentRoute.value
        // 当前路由已不在新注册表内（name 被移除）→ 踢出。
        // 落点取新授权树首个可导航页面：/desktop 目录可能整体被收回，
        // 硬编码会在守卫 not-found 兜底处形成回环
        if (current.name && !router.hasRoute(current.name)) kickOut(current)
      }
    )
    return
  }

  watch(
    () => userStore.roles,
    (roles) => {
      if (!userStore.token) return
      const current = router.currentRoute.value
      const required = current.meta?.roles
      if (required?.length && !required.some((role) => roles.includes(role))) kickOut(current)
    },
    { deep: true }
  )
}
