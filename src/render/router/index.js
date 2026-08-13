import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from '@/config/nprogress'
import { useUserStore } from '@/store/modules/user'

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
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/login/forgot-password.vue'),
    meta: { title: '找回密码', noLayout: true }
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
          affix: true
        }
      }
    ]
  },
  //  结果页面
  {
    path: '/result',
    component: Layout,
    redirect: '/result/success',
    meta: {
      title: '结果页面',
      icon: 'circle-check',
      order: 2,
      sidebar: true
    },
    children: [
      {
        path: 'success',
        name: 'result-success',
        component: () => import('@/views/result/success/index.vue'),
        meta: {
          title: '成功页',
          icon: 'circle-check',
          group: '/result',
          keepAlive: true
        }
      },
      {
        path: 'fail',
        name: 'result-fail',
        component: () => import('@/views/result/fail/index.vue'),
        meta: {
          title: '失败页',
          icon: 'circle-x',
          group: '/result',
          keepAlive: true
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
          icon: 'file-x',
          group: '/exception',
          keepAlive: true
        }
      },
      {
        path: '500',
        name: 'exception-500',
        component: () => import('@/views/exception/500/index.vue'),
        meta: {
          title: '500 服务器错误',
          icon: 'server-crash',
          group: '/exception',
          keepAlive: true
        }
      }
    ]
  },
  {
    path: '/manage',
    component: Layout,
    redirect: '/manage/user',
    meta: {
      title: '系统管理',
      icon: 'settings',
      order: 4,
      sidebar: true
    },
    children: [
      {
        path: 'user',
        name: 'system-user',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'users',
          group: '/manage',
          keepAlive: true
        }
      },
      {
        path: 'role',
        name: 'system-role',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'shield-check',
          group: '/manage',
          keepAlive: true
        }
      },
      {
        path: 'menu',
        name: 'system-menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'list-tree',
          group: '/manage',
          keepAlive: true
        }
      }
    ]
  },
  //  高级表格演示
  {
    path: '/components',
    component: Layout,
    redirect: '/components/table',
    meta: {
      title: '组件演示',
      icon: 'dashboard',
      order: 5,
      sidebar: true
    },
    children: [
      {
        path: 'table',
        name: 'advance-table-demo',
        component: () => import('@/views/advanceTable/index.vue'),
        meta: {
          title: '高级表格',
          icon: 'table-2',
          group: '/components',
          keepAlive: true
        }
      },
      {
        path: 'notification-demo',
        name: 'notification-demo',
        component: () => import('@/views/notification-demo/index.vue'),
        meta: {
          title: '通知演示',
          icon: 'bell',
          group: '/components',
          keepAlive: true
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
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

export default router

// // ─── 路由守卫 ──────────────────────────────────────────────
// const whiteList = ['/login']

// router.beforeEach(async (to, from, next) => {
//   NProgress.start()

//   // 设置页面标题
//   const title = to.meta?.title
//   document.title = title ? `${title} - Lightning` : 'Lightning'

//   const userStore = useUserStore()
//   const hasToken = !!userStore.token

//   if (hasToken) {
//     // 已登录，访问登录页则重定向到仪表板
//     if (to.path === '/login') {
//       next({ path: '/desktop' })
//       return
//     }
//     // 有 token 但无用户信息，尝试获取
//     if (!userStore.userInfo) {
//       try {
//         await userStore.getUserInfoAction()
//         next()
//       } catch {
//         userStore.resetUserState()
//         next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
//       }
//       return
//     }
//     next()
//   } else {
//     // 未登录，白名单内直接放行，否则重定向到登录页
//     if (whiteList.includes(to.path)) {
//       next()
//     } else {
//       next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
//     }
//   }
// })

// router.afterEach(() => {
//   NProgress.done()
// })
