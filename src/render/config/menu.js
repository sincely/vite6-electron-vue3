import { computed } from 'vue'
import { asyncRoutes } from '@/router'
import { useUserStore } from '@/store/modules/user'

// 权限方案：dynamic=后端菜单树直接生成菜单；static=静态菜单树+授权过滤（默认）
const isDynamicMode = import.meta.env.VITE_PERMISSION_MODE === 'dynamic'

/**
 * 从 asyncRoutes 构建侧边栏菜单树
 *
 * 规则：
 *   meta.sidebar = true             -> 顶级菜单项，按 meta.order 升序排列
 *   meta.group   = '/parent-path'   -> 属于该父路径的子级菜单项（父级可为任意层级，支持多级嵌套）
 *   meta.footer  = true             -> 渲染到侧边栏底部固定区
 *   meta.showBadge     = true       -> 菜单项显示红点
 *   meta.showTextBadge = '文本'     -> 菜单项显示文本角标（如 New / Hot）
 *   meta.link  = 'https://...'      -> 外部链接，默认点击菜单由系统浏览器打开；
 *                                      配合 meta.iframe = true 时改为应用内嵌 iframe 展示
 */

// 递归收集某个父路径下的所有子级菜单项
function buildChildren(parentPath, routes, idBase) {
  const childRoutes = routes.filter((r) => r.meta?.group === parentPath)
  if (!childRoutes.length) return undefined

  return childRoutes.map((route, idx) => {
    const id = idBase * 100 + idx + 1
    // 空路径子项拼接后与父路径相同（如 /desktop 的默认子路由），
    // 跳过递归避免自引用死循环
    const children = route.path === parentPath ? undefined : buildChildren(route.path, routes, id)
    return {
      id,
      label: route.meta.title,
      icon: route.meta.icon,
      route: route.path,
      link: route.meta.link,
      iframe: !!route.meta.iframe,
      roles: route.meta.roles,
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
      link: route.meta.link,
      iframe: !!route.meta.iframe,
      footer: route.meta.footer ?? false,
      roles: route.meta.roles,
      showBadge: !!route.meta.showBadge,
      showTextBadge: route.meta.showTextBadge,
      children: buildChildren(route.path, routes, id)
    }
  })
}

// 静态菜单源：前端固定路由表构建（static 模式）
const staticMenuItems = buildMenuItems(asyncRoutes)

/**
 * 动态菜单源：后端授权菜单树 -> 与静态菜单项同构的菜单树
 *
 * 后端树本身即授权结果（findMenusByRoleId 已按角色过滤），无需二次过滤；
 * hideInMenu 节点（sys_menu.visible='0'）跳过不渲染；排序沿用后端 sort。
 */
function buildMenuItemsFromBackend(nodes) {
  if (!Array.isArray(nodes)) return []
  return nodes.reduce((acc, node) => {
    if (node.meta?.hideInMenu) return acc
    const children = buildMenuItemsFromBackend(node.children)
    acc.push({
      id: node.id,
      label: node.meta?.title,
      icon: node.meta?.icon,
      route: node.path,
      link: node.meta?.link,
      iframe: !!node.meta?.iframe,
      footer: false,
      roles: undefined,
      showBadge: false,
      showTextBadge: undefined,
      ...(children.length ? { children } : {})
    })
    return acc
  }, [])
}

const dynamicMenuItems = computed(() => buildMenuItemsFromBackend(useUserStore().menus))

/**
 * 当前菜单源：static 返回静态树；dynamic 返回响应式动态树
 * （函数调用时求值——在 computed/渲染上下文中调用可建立对 store 的依赖）
 * @returns {Array} 菜单项数组
 */
export function currentMenuItems() {
  return isDynamicMode ? dynamicMenuItems.value : staticMenuItems
}

/**
 * 按当前用户角色与后端授权菜单树过滤后的菜单树（页面可见性）
 *
 * 规则：
 *   未声明 roles 的菜单项不受限制
 *   声明了 roles 的菜单项需与用户角色有交集才可见
 *   grantedTree 为 null（尚未拉取授权）时不做授权过滤
 *   菜单项须在授权树对应层级命中同路径节点（node.path === item.route），
 *   目录未授权时整棵子树隐藏；命中但节点标记 hideInMenu（sys_menu.visible='0'）的同样隐藏
 *   分组菜单的子项全部被过滤时，整个分组一并隐藏
 */
function filterMenuByRoles(items, roles, grantedTree = null) {
  const checkGrant = Array.isArray(grantedTree)
  return items.reduce((acc, item) => {
    if (item.roles?.length && !item.roles.some((role) => roles.includes(role))) {
      return acc
    }
    let node = null
    if (checkGrant) {
      node = grantedTree.find((n) => n.path === item.route) ?? null
      if (!node || node.meta?.hideInMenu) return acc
    }
    if (item.children?.length) {
      const children = filterMenuByRoles(item.children, roles, checkGrant ? (node.children ?? []) : null)
      if (!children.length) return acc
      acc.push({ ...item, children })
    } else {
      acc.push(item)
    }
    return acc
  }, [])
}

export const visibleMenuItems = computed(() => {
  const userStore = useUserStore()
  // dynamic：后端树即授权结果，直接渲染；static：roles + 授权树层级对齐过滤
  if (isDynamicMode) {
    return dynamicMenuItems.value
  }
  return filterMenuByRoles(staticMenuItems, userStore.roles, userStore.menus)
})

/**
 * 判断菜单项（含任意层级后代）是否包含指定路由
 * @param {{ route, children? }} item  菜单项
 * @param {string} routePath           目标 route.path
 */
export function containsRoute(item, routePath) {
  if (!item) return false
  if (item.route === routePath) return true
  return item.children?.some((child) => containsRoute(child, routePath)) ?? false
}

/**
 * 根据当前路由路径查找菜单链路（顶级 -> ... -> 当前项）
 * 优先返回最深层匹配：父级与默认子路由同路径时（如 /desktop 的工作台），
 * 命中子级而非父级，保证父级菜单不被误判为链路终点而折叠
 * @param {string} routePath  当前 route.path
 * @param {Array}  items      搜索范围，默认完整菜单树
 * @returns {{ id, label, icon?, route, children? }[]}
 */
export function findMenuPath(routePath, items = currentMenuItems()) {
  for (const item of items) {
    if (item.children) {
      const chain = findMenuPath(routePath, item.children)
      if (chain.length) return [item, ...chain]
    }
    if (item.route === routePath) return [item]
  }
  return []
}

/**
 * 根据当前路由路径查找对应的顶级菜单项
 * @param {string} routePath  当前 route.path
 * @returns {{ id, label, icon?, route, children? } | undefined}
 */
export function findTopLevelParent(routePath) {
  return currentMenuItems().find((item) => containsRoute(item, routePath))
}

/**
 * 获取菜单项下第一个叶子节点（点击分组菜单的默认跳转目标）
 * 返回的节点可能携带 link 字段（外部链接），由调用方决定打开方式
 * @param {{ route, link?, children? }} item  菜单项
 * @returns {{ route, link?, children? } | undefined}
 */
export function firstLeaf(item) {
  let node = item
  while (node?.children?.length) {
    node = node.children[0]
  }
  return node
}
