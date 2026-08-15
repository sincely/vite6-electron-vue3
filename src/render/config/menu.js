import { asyncRoutes } from '@/router'

/**
 * 从 asyncRoutes 构建侧边栏菜单树
 *
 * 规则：
 *   meta.sidebar = true             -> 顶级菜单项，按 meta.order 升序排列
 *   meta.group   = '/parent-path'   -> 属于该父路径的子级菜单项（父级可为任意层级，支持多级嵌套）
 *   meta.footer  = true             -> 渲染到侧边栏底部固定区
 *   meta.showBadge     = true       -> 菜单项显示红点
 *   meta.showTextBadge = '文本'     -> 菜单项显示文本角标（如 New / Hot）
 */

// 递归收集某个父路径下的所有子级菜单项
function buildChildren(parentPath, routes, idBase) {
  const childRoutes = routes.filter((r) => r.meta?.group === parentPath)
  if (!childRoutes.length) return undefined

  return childRoutes.map((route, idx) => {
    const id = idBase * 100 + idx + 1
    // 空路径子项拼接后与父路径相同（如 /desktop 的默认子路由），
    // 跳过递归避免自引用死循环
    const children =
      route.path === parentPath
        ? undefined
        : buildChildren(route.path, routes, id)
    return {
      id,
      label: route.meta.title,
      icon: route.meta.icon,
      route: route.path,
      showBadge: !!route.meta.showBadge,
      showTextBadge: route.meta.showTextBadge,
      children
    }
  })
}

function buildMenuItems(routes) {
  const sidebarRoutes = routes
    .filter((r) => r.meta?.sidebar)
    .sort((a, b) => (a.meta.order ?? 99) - (b.meta.order ?? 99))

  return sidebarRoutes.map((route, idx) => {
    const id = idx + 1
    return {
      id,
      label: route.meta.title,
      icon: route.meta.icon,
      route: route.path,
      footer: route.meta.footer ?? false,
      showBadge: !!route.meta.showBadge,
      showTextBadge: route.meta.showTextBadge,
      children: buildChildren(route.path, routes, id)
    }
  })
}

export const menuItems = buildMenuItems(asyncRoutes)

/**
 * 判断菜单项（含任意层级后代）是否包含指定路由
 * @param {{ route, children? }} item  菜单项
 * @param {string} routePath           目标 route.path
 */
export function containsRoute(item, routePath) {
  if (!item) return false
  if (item.route === routePath) return true
  return (
    item.children?.some((child) => containsRoute(child, routePath)) ?? false
  )
}

/**
 * 根据当前路由路径查找菜单链路（顶级 -> ... -> 当前项）
 * @param {string} routePath  当前 route.path
 * @param {Array}  items      搜索范围，默认完整菜单树
 * @returns {{ id, label, icon?, route, children? }[]}
 */
export function findMenuPath(routePath, items = menuItems) {
  for (const item of items) {
    if (item.route === routePath) return [item]
    if (item.children) {
      const chain = findMenuPath(routePath, item.children)
      if (chain.length) return [item, ...chain]
    }
  }
  return []
}

/**
 * 根据当前路由路径查找对应的顶级菜单项
 * @param {string} routePath  当前 route.path
 * @returns {{ id, label, icon?, route, children? } | undefined}
 */
export function findTopLevelParent(routePath) {
  return menuItems.find((item) => containsRoute(item, routePath))
}

/**
 * 获取菜单项下第一个叶子节点的路由（点击分组菜单的默认跳转目标）
 * @param {{ route, children? }} item  菜单项
 * @returns {string | undefined}
 */
export function firstLeafRoute(item) {
  let node = item
  while (node?.children?.length) {
    node = node.children[0]
  }
  return node?.route
}
