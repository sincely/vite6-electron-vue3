import { asyncRoutes } from '@/router/index'

/**
 * 从 asyncRoutes 构建侧边栏菜单树
 *
 * 规则：
 *   meta.sidebar = true             -> 顶级菜单项，按 meta.order 升序排列
 *   meta.group   = '/parent-path'  -> 属于该父路径的二级菜单项
 *   meta.footer  = true             -> 渲染到侧边栏底部固定区
 */
function buildMenuItems(routes) {
  const sidebarRoutes = routes
    .filter((r) => r.meta?.sidebar)
    .sort((a, b) => (a.meta.order ?? 99) - (b.meta.order ?? 99))

  return sidebarRoutes.map((route, idx) => {
    const id = idx + 1
    const childRoutes = routes.filter((r) => r.meta?.group === route.path)
    return {
      id,
      label: route.meta.title,
      icon: route.meta.icon,
      route: route.path,
      footer: route.meta.footer ?? false,
      children: childRoutes.length
        ? childRoutes.map((c, cIdx) => ({
            id: id * 100 + cIdx + 1,
            label: c.meta.title,
            icon: c.meta.icon,
            route: c.path
          }))
        : undefined
    }
  })
}

export const menuItems = buildMenuItems(asyncRoutes)

/**
 * 根据当前路由路径查找面包屑链路
 * @param {string} routePath  当前 route.path
 * @returns {{ id, label, icon?, route }[]}  一级 或 [一级, 二级]
 */
export function findMenuPath(routePath) {
  for (const item of menuItems) {
    if (item.route === routePath) return [item]
    if (item.children) {
      for (const child of item.children) {
        if (child.route === routePath) return [item, child]
      }
    }
  }
  return []
}
