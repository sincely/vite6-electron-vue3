/**
 * 快速入口配置（参照 art-design-pro 的 fastEnter）
 * 包含：应用九宫格列表、快速链接等配置
 *
 * 跳转字段三选一：
 *   path   - 内部路由路径，router.push 跳转
 *   link   - 外部链接，新窗口打开
 *   action - 内置动作（openChat：打开 Lightning Bot 聊天窗口）
 */
const fastEnterConfig = {
  // 应用列表
  applications: [
    {
      name: '工作台',
      description: '系统概览与数据统计',
      icon: 'ri:pie-chart-line',
      iconColor: '#377dff',
      enabled: true,
      order: 1,
      path: '/desktop'
    },
    {
      name: '分析页',
      description: '数据分析与可视化',
      icon: 'ri:game-line',
      iconColor: '#ff3b30',
      enabled: true,
      order: 2,
      path: '/desktop/analysis'
    },
    {
      name: '数据看板',
      description: '实时数据监控与统计',
      icon: 'ri:loader-line',
      iconColor: '#7A7FFF',
      enabled: true,
      order: 3,
      path: '/desktop/dashboard'
    },
    {
      name: '聊天',
      description: '即时通讯功能',
      icon: 'ri:user-line',
      iconColor: '#13DEB9',
      enabled: true,
      order: 4,
      action: 'openChat'
    },
    {
      name: '官方文档',
      description: '使用指南与开发文档',
      icon: 'ri:bill-line',
      iconColor: '#ffb100',
      enabled: true,
      order: 5,
      link: 'https://element-plus.org/zh-CN/'
    },
    {
      name: '技术支持',
      description: '技术支持与问题反馈',
      icon: 'ri:user-location-line',
      iconColor: '#ff6b6b',
      enabled: true,
      order: 6,
      link: 'https://github.com/issues'
    },
    {
      name: '模板中心',
      description: '丰富页面模板集合',
      icon: 'lucide:gallery-horizontal',
      iconColor: '#38C0FC',
      enabled: true,
      order: 7,
      path: '/template'
    },
    {
      name: '电子商务',
      description: '在线商店数据概览',
      icon: 'lucide:shopping-cart',
      iconColor: '#FB7299',
      enabled: true,
      order: 8,
      path: '/desktop/ecommerce'
    }
  ],
  // 快速链接
  quickLinks: [
    { name: '登录', enabled: true, order: 1, path: '/login' },
    { name: '忘记密码', enabled: true, order: 2, path: '/forgot-password' },
    { name: '定价', enabled: true, order: 3, path: '/template/pricing' },
    { name: '用户管理', enabled: true, order: 4, path: '/manage/user' },
    { name: '角色管理', enabled: true, order: 5, path: '/manage/role' },
    { name: '菜单管理', enabled: true, order: 6, path: '/manage/menu' }
  ]
}

export default Object.freeze(fastEnterConfig)
