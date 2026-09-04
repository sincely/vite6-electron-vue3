import { defineStore } from 'pinia'
import { updateElementPlusTheme } from '@/utils/color'
import { startThemeTransition } from '@/utils/themeTransition'

// 系统主题监听的内部引用。
// 注意：不能挂在 store 上（this._xxx），否则会成为 store 的可枚举属性，
// 值为 null 时会导致 storeToRefs() 抛错（Cannot read properties of null (reading 'effect')）
let systemThemeListener = null
let systemThemeMediaQuery = null

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light', // 当前主题，默认是亮色主题
    layoutMode: 'left', // 布局模式：left | top | top-mixed | dual
    dualMenuShowText: false, // 双列模式下第一列是否显示菜单文字
    sidebarCollapsed: false, // 侧边栏是否折叠
    footerVisible: true, // 是否显示底部状态栏
    footerHeight: 26, // 底部状态栏高度（px）
    tagsView: true, // 是否显示多标签导航
    tagsViewStyle: 'card', // 多标签导航风格：default（默认）| card（卡片）| google（谷歌）
    breadCrumb: true, // 是否在标题栏显示面包屑导航
    fastEnter: true, // 是否在标题栏显示快速入口（九宫格面板）
    refreshBtn: true, // 是否在标题栏显示全局刷新按钮
    showNProgress: true, // 是否显示顶部加载进度条
    watermarkVisible: false, // 是否显示全局水印
    transitionEnabled: true, // 是否启用页面切换动画
    transitionType: 'page', // 页面切换动画类型
    contentWidth: 'full', // 内容容器宽度模式：full（铺满）| fixed（定宽）
    contentWidthValue: 1200, // 定宽模式下的具体宽度值（px）
    settingsVisible: false, // 设置弹窗是否可见
    refresh: false, // 是否刷新当前页面（由 reloadPage 翻转，内容区监听后销毁重建路由视图）
    loading: false, // 是否显示加载中状态
    loadingTargets: [], // 加载中状态的目标元素
    themeColors: {
      useAlgorithm: false,
      primary: '#2563eb',
      infoFollowPrimary: true,
      info: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  }),
  getters: {
    isDark: (state) => state.theme === 'dark',
    currentLayoutMode: (state) => state.layoutMode
  },
  actions: {
    setLayoutMode(mode) {
      this.layoutMode = mode
    },
    // 设置双列模式第一列的图标/文字显示
    setDualMenuShowText(val) {
      this.dualMenuShowText = !!val
    },
    // 切换设置弹窗可见性
    toggleSettings(visible) {
      this.settingsVisible =
        visible === undefined ? !this.settingsVisible : visible
    },
    // 切换主题
    toggleTheme() {
      // 如果当前是 auto，切换到 light
      if (this.theme === 'auto') {
        this.setTheme('light')
        return
      }
      // light -> dark -> auto -> light
      const nextTheme = this.theme === 'light' ? 'dark' : 'auto'
      this.setTheme(nextTheme)
    },
    // 切换主题时添加过渡动画（View Transition 圆形扩散，参考 art-design-pro）
    // 支持直接指定目标主题（如 'light' / 'dark'），否则回退到三态循环
    toggleThemeWithTransition(event, targetTheme) {
      startThemeTransition(event, () => {
        if (targetTheme === 'light' || targetTheme === 'dark') {
          this.setTheme(targetTheme)
        } else {
          this.toggleTheme()
        }
      })
    },
    // 设置主题
    setTheme(theme) {
      this.theme = theme

      let effectiveTheme = theme
      if (theme === 'auto') {
        // 如果是自动模式，检测系统偏好
        const isSystemDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
        effectiveTheme = isSystemDark ? 'dark' : 'light'

        // 监听系统主题变化
        if (!systemThemeListener) {
          systemThemeListener = (e) => {
            if (this.theme === 'auto') {
              const newTheme = e.matches ? 'dark' : 'light'
              document.documentElement.setAttribute('data-theme', newTheme)
              if (newTheme === 'dark') {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            }
          }
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          mediaQuery.addEventListener('change', systemThemeListener)
          // 保存 mediaQuery 引用以便后续移除监听
          systemThemeMediaQuery = mediaQuery
        }
      } else {
        // 移除监听器
        if (systemThemeListener && systemThemeMediaQuery) {
          systemThemeMediaQuery.removeEventListener(
            'change',
            systemThemeListener
          )
          systemThemeListener = null
          systemThemeMediaQuery = null
        }
      }

      document.documentElement.setAttribute('data-theme', effectiveTheme)
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    // 初始化主题
    initTheme() {
      this.setTheme(this.theme)
      this.initThemeColors()
    },
    // 初始化主题颜色
    initThemeColors() {
      const colors = this.themeColors || {
        useAlgorithm: false,
        primary: '#2563eb',
        infoFollowPrimary: true,
        info: '#0ea5e9',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
      this.setThemeColors(colors)
    },
    // 应用预设主题色（参照 art-design-pro 的 colorHandlers.selectColor）
    // 点击预设色圆点时调用：仅替换主色，其它辅助色保持不变，
    // 同时根据 infoFollowPrimary 自动同步 info。
    setPresetThemeColor(color) {
      if (typeof color !== 'string' || !color) return
      this.setThemeColors({
        primary: color,
        infoFollowPrimary: this.themeColors.infoFollowPrimary,
        info: this.themeColors.infoFollowPrimary ? color : this.themeColors.info
      })
    },
    // 设置主题颜色
    setThemeColors(colors) {
      this.themeColors = { ...this.themeColors, ...colors }

      const { primary, infoFollowPrimary, info, success, warning, error } =
        this.themeColors
      const effectiveInfo = infoFollowPrimary ? primary : info

      const updateColor = (type, color) => {
        updateElementPlusTheme(type, color)
        // 同时更新我们自己定义的 CSS 变量
        const cssVarName =
          type === 'error' ? '--color-danger' : `--color-${type}`
        document.documentElement.style.setProperty(cssVarName, color)
      }

      updateColor('primary', primary)
      updateColor('info', effectiveInfo)
      updateColor('success', success)
      updateColor('warning', warning)
      updateColor('error', error)

      // 更新主题色衍生变量
      document.documentElement.style.setProperty('--brand-accent', primary)
      document.documentElement.style.setProperty('--brand-accent-alt', primary)
    },
    // 切换侧边栏折叠状态
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    // 设置侧边栏折叠状态
    setSidebarCollapsed(val) {
      this.sidebarCollapsed = val
    },
    // 设置底部栏显示状态
    setFooterVisible(val) {
      this.footerVisible = !!val
    },
    // 设置多标签导航显示状态
    setTagsView(val) {
      this.tagsView = !!val
    },
    // 设置多标签导航风格：default | card | google
    setTagsViewStyle(style) {
      const allowed = ['default', 'card', 'google']
      this.tagsViewStyle = allowed.includes(style) ? style : 'card'
    },
    // 设置面包屑导航显示状态
    setBreadCrumb(val) {
      this.breadCrumb = !!val
    },
    // 设置快速入口显示状态
    setFastEnter(val) {
      this.fastEnter = !!val
    },
    // 设置全局刷新按钮显示状态
    setRefreshBtn(val) {
      this.refreshBtn = !!val
    },
    // 设置顶部加载进度条显示状态
    setShowNProgress(val) {
      this.showNProgress = !!val
    },
    // 设置全局水印显示状态
    setWatermarkVisible(val) {
      this.watermarkVisible = !!val
    },
    // 设置底部栏高度（限制 20~80）
    setFooterHeight(val) {
      const height = Number(val)
      if (!Number.isFinite(height)) return
      this.footerHeight = Math.min(80, Math.max(20, Math.round(height)))
    },

    // 设置内容容器宽度模式：full | fixed
    setContentWidth(mode) {
      this.contentWidth = mode === 'fixed' ? 'fixed' : 'full'
    },

    // 设置定宽模式下的具体宽度值
    setContentWidthValue(val) {
      const width = Number(val)
      if (!Number.isFinite(width)) return
      this.contentWidthValue = Math.min(1920, Math.max(800, Math.round(width)))
    },

    // 刷新当前页面：翻转 refresh，内容区监听后销毁并重建 RouterView
    // （全局软刷新：不重置布局框架，仅内容区重渲染，任意组件均可触发）
    reloadPage() {
      this.refresh = !this.refresh
    },
    // 设置loading状态
    setLoading(val) {
      this.loading = val
    },
    // 添加loading目标
    addLoadingTarget(target) {
      if (!this.loadingTargets.includes(target)) {
        this.loadingTargets.push(target)
      }
    },
    // 移除loading目标
    removeLoadingTarget(target) {
      const index = this.loadingTargets.indexOf(target)
      if (index > -1) {
        this.loadingTargets.splice(index, 1)
      }
    },

    // 清空所有loading目标
    clearLoadingTargets() {
      this.loadingTargets = []
    },
    // 重置应用状态
    resetAppState() {
      this.loading = false
      this.clearLoadingTargets()
      this.settingsVisible = false
    }
  },
  persist: {
    // left-mixed 布局已并入 dual，旧持久化值迁移为 dual
    afterRestore(ctx) {
      if (ctx.store.layoutMode === 'left-mixed') {
        ctx.store.layoutMode = 'dual'
      }
    }
  }
})
