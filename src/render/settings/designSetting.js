/**
 * 预设系统主题色（参照 art-design-pro 的 systemMainColor）
 *
 * 7 个经过精挑细选的品牌色，覆盖常见的视觉风格：
 * - #5D87FF：默认蓝（薄雾蓝）
 * - #B48DF3：紫色
 * - #1D84FF：极客蓝
 * - #60C041：生机绿
 * - #38C0FC：青蓝色
 * - #F9901F：活力橙
 * - #FF80C8：樱花粉
 */
export const appPresetColors = [
  '#5D87FF',
  '#B48DF3',
  '#1D84FF',
  '#60C041',
  '#38C0FC',
  '#F9901F',
  '#FF80C8'
]

/**
 * el-color-picker 推荐色板（兼容旧逻辑）
 * 用户在主题颜色设置面板中可挑选的色彩池
 */
export const appThemeList = [
  '#5d9dfe',
  '#2d8cf0',
  '#0960bd',
  '#0084f4',
  '#009688',
  '#536dfe',
  '#ff5c93',
  '#ee4f12',
  '#0096c7',
  '#9c27b0',
  '#ff9800',
  '#FF3D68',
  '#00C1D4',
  '#18a058',
  '#78DEC7',
  '#1768AC',
  '#FB9300',
  '#FC5404',
  '#8675ff'
]

const setting = {
  // 深色主题
  darkMode: 'light',
  // 系统主题色
  appTheme: '#5D87FF',
  // 系统内置主题色列表（预设主题色，参考 art-design-pro）
  appPresetColors,
  // el-color-picker 推荐色（保留旧版色彩池用于自定义面板）
  appThemeList,
  // 是否开启路由动画
  isPageAnimate: true,
  // 路由动画类型
  pageAnimateType: 'zoom-fade'
}

export default setting
