/**
 * 动态路由模块（VITE_PERMISSION_MODE=dynamic）
 *
 * 把后端 /user/info 返回的授权菜单树转换为 vue-router 路由并注册。
 * 与静态路由树（router/index.js asyncRouteTree）保持行为同构：
 *   根级 DIR      -> Layout 容器路由（含 redirect / sidebar meta）
 *   根级 MENU     -> Layout + 空路径默认子路由（对齐静态树 /profile 形态）
 *   嵌套 DIR      -> 无 component 的透传路由记录（vue-router 跳过渲染层级）
 *   MENU          -> 视图路由（component 解析见 resolveComponent）
 *   meta.link     -> asIframeComponent(name)：外链与内嵌页统一注册 iframe 组件，
 *                    点击打开方式由菜单项 link/iframe 字段驱动（对齐静态树）
 * 自环 redirect 会被改写为目录下第一个可导航子孙（授权裁剪可能裁掉目录的
 * 默认子页，使 DIR 的 redirect 指回自身，record 级 redirect 无环路保护）。
 * 注册是幂等的：重注册前先移除上一次的顶级路由，支撑权限收回后的路由收敛。
 */

import { asIframeComponent } from '@/views/iframe/route'

const Layout = () => import('@/layouts/index.vue')

// 视图组件映射：sys_menu.component（'@/views/xxx/index.vue'）-> 懒加载工厂。
// pattern 用根路径形式，key 稳定为 '/src/render/views/xxx/index.vue'
// （alias 形式的 key 展开格式随 Vite 版本有差异，不采用）
const viewModules = import.meta.glob('/src/render/views/**/*.vue')

// 已注册的顶级路由 name 集合（重注册时逐个 removeRoute）
let registeredNames = new Set()
// 是否执行过注册（空授权也算已注册，避免守卫重复跳转）
let hasRegistered = false

// 路径比较用的规范化：去掉尾部斜杠（'/desktop' 与 '/desktop/' 视为同一路径）
const normalizePath = (path) => {
  if (typeof path !== 'string' || !path) return ''
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

// 节点是否挂真实视图：link 节点统一注册 iframe 组件，同样可导航
const isPageNode = (node) => {
  if (node.meta?.link) return true
  return Boolean(node.component) && node.component !== 'Layout'
}

/**
 * 授权树内第一个可导航页面的 path（先序遍历，树已按 order 排序）
 * 用于守卫兜底 / 失权踢出的落点：账号可能未授权 /desktop 目录，
 * 硬编码会在 not-found 兜底处形成守卫级回环
 * @param {Array<object>} nodes 后端菜单树（子树亦可）
 * @returns {string} 可导航页面 path，无可用页面时返回 ''
 */
export function getFirstNavigablePath(nodes) {
  if (!Array.isArray(nodes)) return ''
  for (const node of nodes) {
    if (isPageNode(node)) return node.path
    const child = getFirstNavigablePath(node.children)
    if (child) return child
  }
  return ''
}

// 权限方案（构建期常量）：dynamic=后端菜单树驱动；static=前端路由表+授权过滤（默认）
export const isDynamicMode = import.meta.env.VITE_PERMISSION_MODE === 'dynamic'

/**
 * 首页 / 失权踢出落点：dynamic 取授权树首个可导航页（账号可能未授权 /desktop，
 * 硬编码会形成 not-found 回环）；static 固定 /desktop
 * @param {Array<object>|null} menus 后端授权菜单树
 */
export function getHomePath(menus) {
  return (isDynamicMode && getFirstNavigablePath(menus)) || '/desktop'
}

/**
 * 解析后端 component 字符串为前端路由组件
 * @param {object} node 后端菜单树节点
 * @returns {Function|undefined} 懒加载组件工厂
 */
function resolveComponent(node) {
  // 外链/内嵌页（sys_menu.link 有值）：对齐静态树行为统一注册 iframe 组件
  if (node.meta?.link) {
    return asIframeComponent(node.name)
  }
  const componentPath = node.component || ''
  // 'Layout' 或空：容器/透传层级不挂视图组件
  if (!componentPath || componentPath === 'Layout') return undefined
  // '@/views/xxx/index.vue' -> viewModules key '/src/render/views/xxx/index.vue'
  const globKey = `/src/render/${componentPath.replace(/^@\//, '')}`
  const viewModule = viewModules[globKey]
  if (!viewModule && import.meta.env.DEV) {
    // 数据录入问题早暴露：component 路径未命中任何视图模块时，叶子会退化成无组件路由
    console.warn(`[dynamicRoutes] 菜单组件路径未命中视图模块：${componentPath}（请核对 sys_menu.component 录入）`)
  }
  return viewModule
}

/**
 * 树节点 -> 路由记录（根级挂 Layout，其余按 component 解析）
 * @param {object} node 后端菜单树节点
 * @param {boolean} isRoot 是否根级节点
 */
function buildRouteNode(node, isRoot) {
  const meta = {
    title: node.meta?.title,
    ...(node.meta?.icon ? { icon: node.meta.icon } : {}),
    ...(node.meta?.order !== undefined ? { order: node.meta.order } : {}),
    ...(node.meta?.keepAlive ? { keepAlive: true } : {}),
    ...(node.meta?.link ? { link: node.meta.link } : {}),
    ...(node.meta?.iframe ? { iframe: true } : {})
  }
  // Layout 容器节点（DIR 的 component='Layout'，或未声明 component 的分组）
  const isContainer = !node.component || node.component === 'Layout'

  const route = {
    path: node.path,
    // DIR 的 route_name 为 NULL，normalizeMenu 落为 path 字符串，天然唯一
    name: node.name,
    meta
  }

  if (isRoot) {
    route.component = Layout
    if (isContainer) {
      meta.sidebar = true
    } else {
      // 根级 MENU（如个人中心）：与静态树同构为 Layout + 空路径默认子路由，
      // 只挂 Layout 会让该路径渲染成空 router-view（无默认子页可显示）。
      // vue-router 禁止父子同名，壳路由以 DB 主键合成 name：既可被重注册
      // removeRoute 寻址，也不会与任何 route_name 撞名
      route.name = `layout-${node.id}`
      route.children = [
        {
          path: '',
          name: node.name,
          component: resolveComponent(node),
          meta: { ...meta }
        }
      ]
    }
  } else {
    const component = resolveComponent(node)
    if (component) route.component = component
  }

  if (node.redirect) {
    // redirect 指回自身（授权裁剪后目录默认子页缺失的常见形态，如 user 角色
    // 的 /desktop 目录）必须改写：record 级 redirect 在守卫之前同步解析且无
    // 环路保护，自指会让解析无限递归直接栈溢出（导航 abort、页面卡死）
    if (normalizePath(node.redirect) === normalizePath(node.path)) {
      const fallback = getFirstNavigablePath(node.children)
      if (fallback) route.redirect = fallback
    } else {
      route.redirect = node.redirect
    }
  }

  const children = (node.children || []).map((child) => buildRouteNode(child, false))
  if (children.length) {
    route.children = [...(route.children || []), ...children]
  }
  return route
}

/**
 * 注册（或重注册）动态路由
 * @param {import('vue-router').Router} router 路由实例
 * @param {Array<object>} menus 后端授权菜单树（/user/info data.menus）
 */
export function registerDynamicRoutes(router, menus) {
  // 非 Array（如拉取失败后的 null）：不清空现有注册，交由守卫/重拉流程重试
  if (!Array.isArray(menus)) return

  // 移除上一轮注册的顶级路由，子路由随父级一并移除
  registeredNames.forEach((name) => {
    if (router.hasRoute(name)) router.removeRoute(name)
  })
  registeredNames = new Set()

  for (const node of menus) {
    const route = buildRouteNode(node, true)
    router.addRoute(route)
    registeredNames.add(route.name)
  }
  hasRegistered = true
}

/**
 * 是否已执行过动态路由注册（守卫冷启动分支依赖）
 * @returns {boolean}
 */
export function isDynamicRoutesRegistered() {
  return hasRegistered
}
