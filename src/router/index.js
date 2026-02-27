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
    meta: { title: '登录' }
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
export const asyncRoutes = [
  // -- 仪表板
  {
    path: '/desktop',
    name: 'desktop',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '仪表板',
      icon: 'lucide-layout-dashboard',
      order: 1,
      sidebar: true,
      keepAlive: true,
      transition: 'page'
    }
  },
  // -- 配额
  {
    path: '/quota',
    redirect: '/quota/usage',
    meta: { title: '配额', icon: 'lucide-gauge', order: 2, sidebar: true, transition: 'slide-up' }
  },
  {
    path: '/quota/usage',
    name: 'quota-usage',
    component: () => import('@/views/quota/usage/index.vue'),
    meta: { title: '用量统计', group: '/quota', keepAlive: true, transition: 'slide-up' }
  },
  {
    path: '/quota/limit',
    name: 'quota-limit',
    component: () => import('@/views/quota/limit/index.vue'),
    meta: { title: '限额管理', group: '/quota', keepAlive: true, transition: 'slide-up' }
  },
  // -- 提供商
  {
    path: '/provider',
    redirect: '/provider/list',
    meta: { title: '提供商', icon: 'lucide-building-2', order: 3, sidebar: true, transition: 'slide-right' }
  },
  {
    path: '/provider/list',
    name: 'provider-list',
    component: () => import('@/views/provider/list/index.vue'),
    meta: { title: '提供商列表', group: '/provider', keepAlive: true, transition: 'slide-right' }
  },
  {
    path: '/provider/add',
    name: 'provider-add',
    component: () => import('@/views/provider/add/index.vue'),
    meta: { title: '添加提供商', group: '/provider', transition: 'zoom' }
  },
  // -- 独立页面
  {
    path: '/fallback',
    name: 'fallback',
    component: () => import('@/views/fallback/index.vue'),
    meta: { title: '回退', icon: 'lucide-undo-2', order: 4, sidebar: true, keepAlive: true }
  },
  {
    path: '/proxy',
    name: 'proxy',
    component: () => import('@/views/proxy/index.vue'),
    meta: { title: '代理', icon: 'lucide-shield-check', order: 5, sidebar: true, keepAlive: true }
  },
  {
    path: '/apikeys',
    name: 'apikeys',
    component: () => import('@/views/apikeys/index.vue'),
    meta: { title: 'API 密钥', icon: 'lucide-key', order: 6, sidebar: true, keepAlive: true, transition: 'loading' }
  },
  {
    path: '/log',
    name: 'log',
    component: () => import('@/views/log/index.vue'),
    meta: { title: '日志', icon: 'lucide-file-text', order: 7, sidebar: true, keepAlive: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/about/index.vue'),
    meta: { title: '关于', icon: 'lucide-info', order: 8, sidebar: true, transition: 'scale' }
  },
  // -- 设置（底部固定）
  {
    path: '/settings',
    redirect: '/settings/general',
    meta: { title: '设置', icon: 'lucide-settings', order: 9, sidebar: true, footer: true, transition: 'blur' }
  },
  {
    path: '/settings/general',
    name: 'settings-general',
    component: () => import('@/views/settings/general/index.vue'),
    meta: { title: '常规', group: '/settings', keepAlive: true, transition: 'blur' }
  },
  {
    path: '/settings/advanced',
    name: 'settings-advanced',
    component: () => import('@/views/settings/advanced/index.vue'),
    meta: { title: '高级', group: '/settings', keepAlive: true, transition: 'blur' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...constantRoutes,
    {
      path: '/main',
      redirect: '/desktop',
      name: 'main',
      component: () => import('@/layouts/index.vue'),
      children: asyncRoutes
    },
    { path: '/:pathMatch(.*)*', redirect: '/desktop' }
  ]
})

export default router
