import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 固定路由 - 无需权限，始终加载
 */
export const constantRoutes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', noLayout: true }
  }
]

/**
 * 异步路由 - 将来支持预权限动态注册，当前直接挂载到 /main
 *
 * meta 字段说明：
 *   title    - 页面标题 / 菜单名称
 *   icon     - 侧边栏图标（lucide-xxx）
 *   order    - 侧边栏排序，数值越小越靠前
 *   sidebar  - true 时作为顶级侧边栏菜单项
 *   group    - 所属父菜单路径，有此字段则为二级菜单项
 *   footer   - true 时渲染在侧边栏底部固定区
 *   keepAlive - 是否缓存组件
 */
const Layout = () => import('@/layouts/index.vue')

export const asyncRouteTree = [
  //  仪表板
  {
    path: '/desktop',
    component: Layout,
    meta: {
      title: '仪表板',
      icon: 'home',
      order: 1,
      sidebar: true
    },
    children: [
      {
        path: '',
        name: 'desktop',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '仪表板',
          keepAlive: true,
          transition: 'page'
        }
      }
    ]
  },
  //  异常处理
  {
    path: '/exception',
    component: Layout,
    redirect: '/exception/404',
    meta: {
      title: '异常处理',
      icon: 'alert-triangle',
      order: 3,
      sidebar: true
    },
    children: [
      {
        path: '404',
        name: 'exception-404',
        component: () => import('@/views/exception/404/index.vue'),
        meta: {
          title: '404 未找到',
          group: '/exception',
          keepAlive: true,
          transition: 'slide-up'
        }
      },
      {
        path: '500',
        name: 'exception-500',
        component: () => import('@/views/exception/500/index.vue'),
        meta: {
          title: '500 服务器错误',
          group: '/exception',
          keepAlive: true,
          transition: 'slide-up'
        }
      }
    ]
  },
  {
    path: '/editableTable',
    component: Layout,
    meta: { title: '可编辑表格', icon: 'key', order: 6, sidebar: true },
    children: [
      {
        path: '',
        name: 'editableTable',
        component: () => import('@/views/editableTable/index.vue'),
        meta: { title: '可编辑表格', keepAlive: true, transition: 'slide-up' }
      }
    ]
  },
  {
    path: '/advanceTable',
    component: Layout,
    meta: { title: '高级表格', icon: 'file-text', order: 7, sidebar: true },
    children: [
      {
        path: '',
        name: 'advanceTable',
        component: () => import('@/views/advanceTable/index.vue'),
        meta: { title: '高级表格', transition: 'slide-up' }
      }
    ]
  },
  {
    path: '/treeTable',
    component: Layout,
    meta: { title: '树型表格', icon: 'file-text', order: 7, sidebar: true },
    children: [
      {
        path: '',
        name: 'treeTable',
        component: () => import('@/views/treeTable/index.vue'),
        meta: { title: '树型表格', transition: 'slide-up' }
      }
    ]
  },
  {
    path: '/form',
    component: Layout,
    meta: { title: '表单', icon: 'file-text', order: 7, sidebar: true },
    children: [
      {
        path: '',
        name: 'form',
        component: () => import('@/views/form/index.vue'),
        meta: { title: '表单', transition: 'slide-up' }
      }
    ]
  }
]

// 将嵌套路由扁平化，生成 path -> route 映射，供菜单等使用
function joinRoutePath(parentPath, routePath) {
  if (!routePath) return parentPath || '/'
  if (routePath.startsWith('/')) return routePath
  return `${parentPath}/${routePath}`.replace(/\/+/g, '/')
}

// 递归扁平化路由树，生成 path -> route 映射
function flattenRoutes(routes, parentPath = '') {
  const result = []
  routes.forEach((route) => {
    const path = joinRoutePath(parentPath, route.path)
    const { children, ...rest } = route
    result.push({ ...rest, path })
    if (children?.length) {
      result.push(...flattenRoutes(children, path))
    }
  })
  return result
}

// 供菜单配置使用的扁平路由数据（保持兼容）
export const asyncRoutes = flattenRoutes(asyncRouteTree)

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...constantRoutes,
    ...asyncRouteTree,
    { path: '/:pathMatch(.*)*', redirect: '/desktop' }
  ]
})

export default router
