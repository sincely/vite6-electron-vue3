import pkg from '../../../package.json'
const setting = {
  // 网页标题
  title: pkg.name,
  // 网页版本号
  version: pkg.version,
  // 水印内容
  watermarkContent: pkg.name,
  // 是否显示设置抽屉
  settingsVisible: false,
  // 是否固定头部
  fixedHeader: true,
  // 是否显示多标签导航
  tagsView: true,
  // 是否显示侧边栏 Logo
  sidebarLogo: true,
  // 是否显示面包屑导航
  breadCrumb: true,
  // 布局模式 (可选值：'left' 左侧菜单模式 | 'top' 顶部菜单模式 | 'top-mixed' 顶部菜单混合模式 | 'dual' 双列菜单模式)
  layout: 'left'
}

export default setting
