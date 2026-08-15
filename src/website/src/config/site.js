// 站点集中配置：品牌、导航、文案、定价与下载链接均在此处维护。
// 下载与外链目前均为 # 占位，发布前统一替换为真实地址。

export const site = {
  name: 'Lightning',
  nameUpper: 'LIGHTNING',
  tagline: '跨平台桌面应用',
  version: 'v1.0.3',
  copyright: '© 2026 lightning. All rights reserved.'
}

export const nav = [
  { label: '文档', href: '#' },
  { label: '更新日志', href: '#' },
  { label: '社区', href: '#' }
]

export const hero = {
  badge: '🎉 Vite + Electron + Vue 3，桌面应用开发更进一步',
  title: '简单、迅捷、开箱即用！',
  subtitle:
    'Lightning 将 Electron 与现代化前端工具链结合，内置布局、主题、权限与自动更新，让你在熟悉的流程中完成开发、构建与发布。',
  primaryCta: {
    label: '立即下载 Lightning',
    sub: '适用于 macOS (Apple Silicon)',
    href: '#'
  },
  secondaryCta: {
    label: '查看全部下载',
    href: '#downloads'
  }
}

export const pricing = {
  title: '选择适合你的版本',
  subtitle: '从个人项目到企业级桌面应用，总有一档适合你。',
  plans: [
    {
      name: '免费版',
      price: '¥0',
      unit: '/永久',
      desc: '适合个人学习与小型项目',
      features: ['全部基础组件与布局', '明暗主题切换', '社区支持'],
      cta: '免费使用',
      href: '#',
      recommended: false
    },
    {
      name: '专业版',
      price: '¥99',
      unit: '/年',
      desc: '适合独立开发者与小型团队',
      features: [
        '免费版全部能力',
        '模板中心全部模板',
        '差量更新与灰度发布',
        '优先技术支持'
      ],
      cta: '立即升级',
      href: '#',
      recommended: true
    },
    {
      name: '企业版',
      price: '¥299',
      unit: '/年',
      desc: '适合中大型团队与商业项目',
      features: [
        '专业版全部能力',
        '私有化更新服务器',
        '专属定制与培训',
        '7×24 小时响应'
      ],
      cta: '联系咨询',
      href: '#',
      recommended: false
    }
  ],
  disclaimer: '以上价格为示例占位，实际价格以发布时为准。'
}

export const features = {
  title: '产品能力',
  subtitle: '保持在技术前沿，把复杂留给自己，把简单留给使用者。',
  items: [
    {
      icon: 'update',
      title: '差量自动更新',
      desc: '基于 electron-updater 的增量更新与渲染层热更新，下载进度实时反馈，托盘提示一步到位，用户无感升级。'
    },
    {
      icon: 'layout',
      title: '多布局多主题',
      desc: '内置左侧、顶部、混合、双栏四种布局模式，明暗主题平滑过渡，配合标签页多页签导航，贴合各类管理场景。'
    },
    {
      icon: 'shield',
      title: 'RBAC 权限体系',
      desc: '用户、角色、菜单三级权限管理开箱即用，路由级守卫与按钮级指令俱全，企业后台该有的一个不少。'
    }
  ]
}

export const downloads = {
  title: '全部下载',
  subtitle: '选择适合你平台的安装包。',
  groups: [
    {
      os: 'macOS',
      icon: 'apple',
      items: [
        { label: 'Apple Silicon (.dmg)', href: '#' },
        { label: 'Intel (.dmg)', href: '#' }
      ]
    },
    {
      os: 'Windows',
      icon: 'windows',
      items: [
        { label: 'x64 (.exe)', href: '#' },
        { label: 'ARM64 (.exe)', href: '#' }
      ]
    },
    {
      os: 'Linux (Beta)',
      icon: 'linux',
      items: [
        { label: 'x64 (.deb)', href: '#' },
        { label: 'ARM64 (.AppImage)', href: '#' }
      ]
    }
  ]
}

export const footer = {
  links: [
    { label: '服务条款', href: '#' },
    { label: '隐私政策', href: '#' },
    { label: '支持与反馈', href: '#' }
  ]
}
