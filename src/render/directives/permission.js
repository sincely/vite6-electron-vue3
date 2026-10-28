import { useUserStore } from '@/store/modules/user'

/**
 * 权限/角色指令：值为单个码或码数组（任一命中即保留），未命中则移除元素
 *   v-permission="'system:user:add'" / v-permission="['system:user:add', 'system:user:edit']"
 *   v-role="'admin'" / v-role="['admin', 'editor']"
 * @param {'hasPermission'|'hasRole'} checker user store 上的校验方法名（'*:*:*' 通配由 hasPermission 处理）
 */
function createDirective(checker) {
  const apply = (el, { value }) => {
    const codes = value ? [].concat(value) : []
    if (!codes.length) return
    const userStore = useUserStore()
    if (!codes.some((code) => userStore[checker](code))) el.parentNode?.removeChild(el)
  }
  return { mounted: apply, updated: apply }
}

export function setupPermissionDirectives(app) {
  app.directive('permission', createDirective('hasPermission'))
  app.directive('role', createDirective('hasRole'))
}
