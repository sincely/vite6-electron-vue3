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
      icon: 'layout-dashboard',
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
  //  配额
  {
    path: '/quota',
    component: Layout,
    redirect: '/quota/usage',
    meta: { title: '配额', icon: 'gauge', order: 2, sidebar: true },
    children: [
      {
        path: 'usage',
        name: 'quota-usage',
        component: () => import('@/views/quota/usage/index.vue'),
        meta: {
          title: '用量统计',
          group: '/quota',
          keepAlive: true,
          transition: 'slide-up'
        }
      },
      {
        path: 'limit',
        name: 'quota-limit',
        component: () => import('@/views/quota/limit/index.vue'),
        meta: {
          title: '限额管理',
          group: '/quota',
          keepAlive: true,
          transition: 'slide-up'
        }
      }
    ]
  },
  //  提供商
  {
    path: '/provider',
    component: Layout,
    redirect: '/provider/list',
    meta: { title: '提供商', icon: 'building', order: 3, sidebar: true },
    children: [
      {
        path: 'list',
        name: 'provider-list',
        component: () => import('@/views/provider/list/index.vue'),
        meta: {
          title: '提供商列表',
          group: '/provider',
          keepAlive: true,
          transition: 'slide-up'
        }
      },
      {
        path: 'add',
        name: 'provider-add',
        component: () => import('@/views/provider/add/index.vue'),
        meta: {
          title: '添加提供商',
          group: '/provider',
          transition: 'slide-up'
        }
      }
    ]
  },
  {
    path: '/apikeys',
    component: Layout,
    meta: { title: 'API 密钥', icon: 'key', order: 6, sidebar: true },
    children: [
      {
        path: '',
        name: 'apikeys',
        component: () => import('@/views/apikeys/index.vue'),
        meta: { title: 'API 密钥', keepAlive: true, transition: 'slide-up' }
      }
    ]
  },
  {
    path: '/log',
    component: Layout,
    meta: { title: '日志', icon: 'file-text', order: 7, sidebar: true },
    children: [
      {
        path: '',
        name: 'log',
        component: () => import('@/views/log/index.vue'),
        meta: { title: '日志', transition: 'slide-up' }
      }
    ]
  },
  //  设置（底部固定）
  {
    path: '/settings',
    component: Layout,
    redirect: '/settings/general',
    meta: {
      title: '设置',
      icon: 'settings',
      order: 9,
      sidebar: true,
      footer: true
    },
    children: [
      {
        path: 'general',
        name: 'settings-general',
        component: () => import('@/views/settings/general/index.vue'),
        meta: {
          title: '常规',
          group: '/settings',
          keepAlive: true,
          transition: 'blur'
        }
      },
      {
        path: 'advanced',
        name: 'settings-advanced',
        component: () => import('@/views/settings/advanced/index.vue'),
        meta: {
          title: '高级',
          group: '/settings',
          keepAlive: true,
          transition: 'blur'
        }
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
