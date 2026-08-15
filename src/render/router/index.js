import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from '@/config/nprogress'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
// 登录页为应用首屏，静态导入随入口 chunk 一并加载，
// 避免 mount 后再等懒加载 chunk 造成的短暂空白
import Login from '@/views/login/index.vue'

/**
 * 固定路由 - 无需权限，始终加载
 */
export const constantRoutes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'login',
    component: Login,
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
 *   group    - 所属父菜单路径，有此字段则为子级菜单项（父级可为任意层级，即支持多级嵌套）
 *   footer   - true 时渲染在侧边栏底部固定区
 *   keepAlive - 是否缓存组件
 *   showBadge     - true 时菜单项显示红点
 *   showTextBadge - 字符串，菜单项显示文本角标（如 'New' / 'Hot'）
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
        component: () => import('@/views/dashboard/console/index.vue'),
        meta: {
          title: '工作台',
          icon: 'layout-dashboard',
          group: '/desktop',
          keepAlive: true,
          affix: true
        }
      },
      {
        path: 'dashboard',
        name: 'dashboard-home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '数据看板',
          icon: 'home',
          group: '/desktop',
          keepAlive: true
        }
      },
      // 兼容旧路径：原工作台地址统一重定向到全局工作台（/desktop）
      {
        path: 'console',
        redirect: '/desktop'
      },
      {
        path: 'analysis',
        name: 'dashboard-analysis',
        component: () => import('@/views/dashboard/analysis/index.vue'),
        meta: {
          title: '分析页',
          icon: 'chart-line',
          group: '/desktop',
          keepAlive: true
        }
      },
      {
        path: 'ecommerce',
        name: 'dashboard-ecommerce',
        component: () => import('@/views/dashboard/ecommerce/index.vue'),
        meta: {
          title: '电子商务',
          icon: 'shopping-cart',
          group: '/desktop',
          keepAlive: true
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
  //  嵌套菜单（三级菜单案例）
  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1/menu1-1',
    meta: {
      title: '嵌套菜单',
      icon: 'list',
      order: 5,
      sidebar: true
    },
    children: [
      {
        // 二级分组：无 component 的透传路由记录，仅用于菜单分层，
        // vue-router 会跳过该层级，子页面直接渲染到 Layout 的 router-view
        path: 'menu1',
        redirect: '/nested/menu1/menu1-1',
        meta: {
          title: '菜单 1',
          icon: 'list-tree',
          group: '/nested'
        },
        children: [
          {
            path: 'menu1-1',
            name: 'nested-menu1-1',
            component: () => import('@/views/nested/menu1/menu1-1/index.vue'),
            meta: {
              title: '菜单 1-1',
              icon: 'file',
              group: '/nested/menu1',
              keepAlive: true
            }
          },
          {
            path: 'menu1-2',
            name: 'nested-menu1-2',
            component: () => import('@/views/nested/menu1/menu1-2/index.vue'),
            meta: {
              title: '菜单 1-2',
              icon: 'file',
              group: '/nested/menu1',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: 'menu2',
        redirect: '/nested/menu2/menu2-1',
        meta: {
          title: '菜单 2',
          icon: 'folder',
          group: '/nested'
        },
        children: [
          {
            path: 'menu2-1',
            name: 'nested-menu2-1',
            component: () => import('@/views/nested/menu2/menu2-1/index.vue'),
            meta: {
              title: '菜单 2-1',
              icon: 'file',
              group: '/nested/menu2',
              keepAlive: true
            }
          }
        ]
      },
      {
        path: 'menu3',
        name: 'nested-menu3',
        component: () => import('@/views/nested/menu3/index.vue'),
        meta: {
          title: '菜单 3',
          icon: 'layers',
          group: '/nested',
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
      icon: 'blocks',
      order: 6,
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
          keepAlive: true,
          showBadge: true
        }
      }
    ]
  },
  //  模板中心
  {
    path: '/template',
    component: Layout,
    redirect: '/template/cards',
    meta: {
      title: '模板中心',
      icon: 'layout-template',
      order: 7,
      sidebar: true,
      showTextBadge: 'New'
    },
    children: [
      {
        path: 'cards',
        name: 'template-cards',
        component: () => import('@/views/template/cards/index.vue'),
        meta: {
          title: '卡片',
          icon: 'layers',
          group: '/template',
          keepAlive: true
        }
      },
      {
        path: 'banners',
        name: 'template-banners',
        component: () => import('@/views/template/banners/index.vue'),
        meta: {
          title: '横幅',
          icon: 'gallery-horizontal',
          group: '/template',
          keepAlive: true
        }
      },
      {
        path: 'charts',
        name: 'template-charts',
        component: () => import('@/views/template/charts/index.vue'),
        meta: {
          title: '图表',
          icon: 'bar-chart-3',
          group: '/template',
          keepAlive: true
        }
      },
      {
        path: 'calendar',
        name: 'template-calendar',
        component: () => import('@/views/template/calendar/index.vue'),
        meta: {
          title: '日历',
          icon: 'calendar',
          group: '/template',
          keepAlive: true
        }
      },
      {
        path: 'pricing',
        name: 'template-pricing',
        component: () => import('@/views/template/pricing/index.vue'),
        meta: {
          title: '定价',
          icon: 'credit-card',
          group: '/template',
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

// ─── 顶部加载进度条（受「设置 - 外观显示 - 顶部进度条」开关控制） ─────
router.beforeEach(() => {
  const appStore = useAppStore()
  if (appStore.showNProgress) {
    NProgress.start()
  }
})

router.afterEach(() => {
  // 以是否已启动为准收尾，避免导航中途关闭开关导致进度条残留
  if (NProgress.isStarted()) {
    NProgress.done()
  }
})

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
