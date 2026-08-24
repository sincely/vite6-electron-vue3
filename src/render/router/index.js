import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from '@/config/nprogress'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
// 登录页为应用首屏，静态导入随入口 chunk 一并加载，
// 避免 mount 后再等懒加载 chunk 造成的短暂空白
import Login from '@/views/login/index.vue'
import { asIframeComponent } from '@/views/iframe/route'

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
 *   link     - 外部链接 URL，默认点击菜单由系统浏览器打开，不做应用内跳转（此时无需 component）
 *   iframe   - true 时配合 link 在内容区内嵌 iframe 展示该页面（路由需声明 name 与 component，
 *              component 统一使用 asIframeComponent(路由 name) 生成，保证 keep-alive 按路由名缓存）
 */
const Layout = () => import('@/layouts/index.vue')

export const asyncRouteTree = [
  //  个人中心（头像下拉进入，无 sidebar/group，不出现在侧边栏菜单）
  {
    path: '/profile',
    component: Layout,
    meta: { title: '个人中心' },
    children: [
      {
        path: '',
        name: 'profile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'user-round',
          keepAlive: true
        }
      }
    ]
  },
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
      },
      {
        path: 'hrm',
        name: 'dashboard-hrm',
        component: () => import('@/views/dashboard/hrm/index.vue'),
        meta: {
          title: '人力资源',
          icon: 'users-round',
          group: '/desktop',
          keepAlive: true
        }
      },
      {
        path: 'jobs',
        name: 'dashboard-jobs',
        component: () => import('@/views/dashboard/jobs/index.vue'),
        meta: {
          title: '职位仪表盘',
          icon: 'briefcase',
          group: '/desktop',
          keepAlive: true
        }
      },
      {
        path: 'sales',
        name: 'dashboard-sales',
        component: () => import('@/views/dashboard/sales/index.vue'),
        meta: {
          title: '销售看板',
          icon: 'trending-up',
          group: '/desktop',
          keepAlive: true
        }
      },
      {
        path: 'social',
        name: 'dashboard-social',
        component: () => import('@/views/dashboard/social/index.vue'),
        meta: {
          title: '社交媒体',
          icon: 'share-2',
          group: '/desktop',
          keepAlive: true
        }
      },
      {
        path: 'crypto',
        name: 'dashboard-crypto',
        component: () => import('@/views/dashboard/crypto/index.vue'),
        meta: {
          title: '加密货币',
          icon: 'bitcoin',
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
  //  组件演示
  {
    path: '/components',
    component: Layout,
    redirect: '/components/notification-demo',
    meta: {
      title: '组件演示',
      icon: 'blocks',
      order: 6,
      sidebar: true
    },
    children: [
      {
        // 兼容旧路径：高级表格已迁移到「功能示例」
        path: 'table',
        redirect: '/examples/table-advanced'
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
      },
      {
        path: 'request-demo',
        name: 'request-demo',
        component: () => import('@/views/request-demo/index.vue'),
        meta: {
          title: '请求演示',
          icon: 'webhook',
          group: '/components',
          keepAlive: true
        }
      }
    ]
  },
  //  组件中心
  {
    path: '/widgets',
    component: Layout,
    redirect: '/widgets/icon',
    meta: {
      title: '组件中心',
      icon: 'shapes',
      order: 7,
      sidebar: true
    },
    children: [
      {
        path: 'icon',
        name: 'widgets-icon',
        component: () => import('@/views/widgets/icon/index.vue'),
        meta: {
          title: '图标',
          icon: 'smile',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'image-crop',
        name: 'widgets-image-crop',
        component: () => import('@/views/widgets/image-crop/index.vue'),
        meta: {
          title: '图像裁剪',
          icon: 'crop',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'excel',
        name: 'widgets-excel',
        component: () => import('@/views/widgets/excel/index.vue'),
        meta: {
          title: 'Excel 导入导出',
          icon: 'file-spreadsheet',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'video',
        name: 'widgets-video',
        component: () => import('@/views/widgets/video/index.vue'),
        meta: {
          title: '视频播放器',
          icon: 'monitor-play',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'count-to',
        name: 'widgets-count-to',
        component: () => import('@/views/widgets/count-to/index.vue'),
        meta: {
          title: '数字滚动',
          icon: 'sigma',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'wang-editor',
        name: 'widgets-wang-editor',
        component: () => import('@/views/widgets/wang-editor/index.vue'),
        meta: {
          title: '富文本编辑器',
          icon: 'notebook-pen',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'watermark',
        name: 'widgets-watermark',
        component: () => import('@/views/widgets/watermark/index.vue'),
        meta: {
          title: '水印',
          icon: 'droplets',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'context-menu',
        name: 'widgets-context-menu',
        component: () => import('@/views/widgets/context-menu/index.vue'),
        meta: {
          title: '右键菜单',
          icon: 'square-mouse-pointer',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'qrcode',
        name: 'widgets-qrcode',
        component: () => import('@/views/widgets/qrcode/index.vue'),
        meta: {
          title: '二维码',
          icon: 'qr-code',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'drag',
        name: 'widgets-drag',
        component: () => import('@/views/widgets/drag/index.vue'),
        meta: {
          title: '拖拽',
          icon: 'grip-vertical',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'text-scroll',
        name: 'widgets-text-scroll',
        component: () => import('@/views/widgets/text-scroll/index.vue'),
        meta: {
          title: '文字滚动',
          icon: 'scroll-text',
          group: '/widgets',
          keepAlive: true
        }
      },
      {
        path: 'fireworks',
        name: 'widgets-fireworks',
        component: () => import('@/views/widgets/fireworks/index.vue'),
        meta: {
          title: '礼花',
          icon: 'party-popper',
          group: '/widgets',
          keepAlive: true
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
      order: 8,
      sidebar: true,
      showTextBadge: 'New'
    },
    children: [
      {
        path: 'chat',
        name: 'template-chat',
        component: () => import('@/views/template/chat/index.vue'),
        meta: {
          title: '聊天',
          icon: 'messages-square',
          group: '/template',
          keepAlive: true
        }
      },
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
  },
  //  功能示例（参照 art-design-pro 功能示例：权限/表格/表单/Socket）
  {
    path: '/examples',
    component: Layout,
    redirect: '/examples/permission/switch-role',
    meta: {
      title: '功能示例',
      icon: 'flask-conical',
      order: 8,
      sidebar: true
    },
    children: [
      {
        // 二级分组：权限管理
        path: 'permission',
        redirect: '/examples/permission/switch-role',
        meta: {
          title: '权限管理',
          icon: 'lock',
          group: '/examples'
        },
        children: [
          {
            path: 'switch-role',
            name: 'example-switch-role',
            component: () =>
              import('@/views/examples/permission/switch-role/index.vue'),
            meta: {
              title: '切换角色',
              icon: 'user-round',
              group: '/examples/permission',
              keepAlive: true
            }
          },
          {
            path: 'button-auth',
            name: 'example-button-auth',
            component: () =>
              import('@/views/examples/permission/button-auth/index.vue'),
            meta: {
              title: '按钮权限',
              icon: 'shield-check',
              group: '/examples/permission',
              keepAlive: true
            }
          },
          {
            path: 'page-visibility',
            name: 'example-page-visibility',
            component: () =>
              import('@/views/examples/permission/page-visibility/index.vue'),
            meta: {
              title: '页面可见性',
              icon: 'eye',
              group: '/examples/permission',
              keepAlive: true,
              // 页面可见性：仅 admin 角色可见/可访问（菜单过滤 + 路由守卫双重校验）
              roles: ['admin']
            }
          }
        ]
      },
      {
        path: 'table-basic',
        name: 'example-table-basic',
        component: () => import('@/views/examples/tables/basic.vue'),
        meta: {
          title: '基础表格',
          icon: 'table',
          group: '/examples',
          keepAlive: true
        }
      },
      {
        path: 'table-advanced',
        name: 'advance-table-demo',
        component: () => import('@/views/advanceTable/index.vue'),
        meta: {
          title: '高级表格',
          icon: 'table-2',
          group: '/examples',
          keepAlive: true
        }
      },
      {
        path: 'form',
        name: 'example-form-basic',
        component: () => import('@/views/examples/forms/basic.vue'),
        meta: {
          title: '基础表单',
          icon: 'file-input',
          group: '/examples',
          keepAlive: true
        }
      },
      {
        path: 'search-form',
        name: 'example-search-form',
        component: () => import('@/views/examples/forms/search-bar.vue'),
        meta: {
          title: '搜索表单',
          icon: 'search',
          group: '/examples',
          keepAlive: true
        }
      },
      {
        path: 'tree-table',
        name: 'example-tree-table',
        component: () => import('@/views/examples/tables/tree.vue'),
        meta: {
          title: '左树右表',
          icon: 'list-tree',
          group: '/examples',
          keepAlive: true
        }
      },
      {
        path: 'socket',
        name: 'example-socket',
        component: () => import('@/views/examples/socket/index.vue'),
        meta: {
          title: 'Socket 连接',
          icon: 'wifi',
          group: '/examples',
          keepAlive: true
        }
      }
    ]
  },
  //  内嵌网页（点击菜单在内容区以 iframe 展示；不配 iframe: true 的外链仍由系统浏览器打开）
  {
    path: '/external',
    component: Layout,
    meta: {
      title: '内嵌网页',
      icon: 'square-arrow-out-up-right',
      order: 9,
      sidebar: true
    },
    children: [
      {
        path: 'vue',
        name: 'external-vue',
        component: asIframeComponent('external-vue'),
        meta: {
          title: 'Vue 官网(外部打开链接)',
          icon: 'atom',
          group: '/external',
          link: 'https://cn.vuejs.org',
          // iframe: true,
          keepAlive: true
        }
      },
      {
        path: 'electron',
        name: 'external-electron',
        component: asIframeComponent('external-electron'),
        meta: {
          title: 'Electron 官网',
          icon: 'zap',
          group: '/external',
          link: 'https://www.electronjs.org',
          iframe: true,
          keepAlive: true
        }
      },
      {
        path: 'github',
        name: 'external-github',
        component: asIframeComponent('external-github'),
        meta: {
          title: 'GitHub',
          icon: 'github',
          group: '/external',
          link: 'https://github.com',
          iframe: true,
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

// ─── 路由守卫：顶部进度条 + 登录态 + 页面可见性（meta.roles） ─────
// 免登录白名单（登录窗口加载 /login，无需 token 即可访问）
const whiteList = ['/login', '/forgot-password']

router.beforeEach(async (to, _from, next) => {
  const appStore = useAppStore()
  if (appStore.showNProgress) {
    NProgress.start()
  }

  const userStore = useUserStore()
  const hasToken = !!userStore.token

  if (hasToken) {
    // 已登录访问登录页（如登录窗口残留导航），重定向到工作台
    if (to.path === '/login') {
      next({ path: '/desktop' })
      return
    }
    // 有 token 但缺少用户信息（如持久化恢复后首次进入），拉取一次
    if (!userStore.userInfo) {
      try {
        await userStore.getUserInfoAction()
      } catch {
        userStore.resetUserState()
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        return
      }
    }
    // 页面可见性：声明了 meta.roles 的路由仅允许对应角色访问
    const requiredRoles = to.meta?.roles
    if (
      requiredRoles?.length &&
      !requiredRoles.some((role) => userStore.roles.includes(role))
    ) {
      ElMessage.warning('当前角色无权访问该页面')
      next({ path: '/desktop' })
      return
    }
    next()
  } else if (whiteList.includes(to.path)) {
    next()
  } else {
    next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})

router.afterEach(() => {
  // 以是否已启动为准收尾，避免导航中途关闭开关导致进度条残留
  if (NProgress.isStarted()) {
    NProgress.done()
  }
})
