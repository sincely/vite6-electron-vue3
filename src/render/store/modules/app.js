import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { updateElementPlusTheme } from '@/utils/color'

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light', // 当前主题，默认是亮色主题
    layoutMode: 'left', // 布局模式：left | left-mixed | top | top-mixed
    mixedSubmenuVisible: true, // 混合模式下子菜单栏是否显示
    sidebarCollapsed: false, // 侧边栏是否折叠
    footerVisible: true, // 是否显示底部状态栏
    footerHeight: 26, // 底部状态栏高度（px）
    transitionEnabled: true, // 是否启用页面切换动画
    transitionType: 'page', // 页面切换动画类型
    contentWidth: 'full', // 内容容器宽度模式：full（铺满）| fixed（定宽）
    contentWidthValue: 1200, // 定宽模式下的具体宽度值（px）
    settingsVisible: false, // 设置弹窗是否可见
    loading: false, // 是否显示加载中状态
    loadingTargets: [], // 加载中状态的目标元素
    autoLaunch: false, // 开机自启
    closeAction: 'minimize', // 关闭窗口行为：minimize | quit
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
    isAutoLaunch: (state) => state.autoLaunch,
    windowCloseAction: (state) => state.closeAction,
    currentLayoutMode: (state) => state.layoutMode
  },
  actions: {
    setLayoutMode(mode) {
      this.layoutMode = mode
    },
    toggleMixedSubmenu() {
      this.mixedSubmenuVisible = !this.mixedSubmenuVisible
    },
    setMixedSubmenuVisible(val) {
      this.mixedSubmenuVisible = val
    },
    // 切换设置弹窗可见性
    toggleSettings(visible) {
      this.settingsVisible =
        visible === undefined ? !this.settingsVisible : visible
    },
    // 切换开机自启
    toggleAutoLaunch(autoLaunch) {
      const newValue = autoLaunch === undefined ? !this.autoLaunch : autoLaunch
      this.autoLaunch = newValue

      // 通过 IPC 调用主进程方法设置开机自启
      if (window.ipcRenderer) {
        try {
          window.ipcRenderer.send('set-auto-launch', newValue)
        } catch (error) {
          console.error('设置开机自启失败:', error)
        }
      }
    },
    setCloseAction(action) {
      const value = action === 'quit' ? 'quit' : 'minimize'
      this.closeAction = value
      if (window.ipcRenderer) {
        window.ipcRenderer.send('set-close-action', value)
      }
    },
    syncDesktopSettings() {
      if (window.ipcRenderer) {
        window.ipcRenderer.send('set-auto-launch', this.autoLaunch)
        window.ipcRenderer.send('set-close-action', this.closeAction)
      }
    },
    async initDesktopSettings() {
      if (!window.ipcRenderer) return
      try {
        const autoLaunch = await window.ipcRenderer.invoke('get-auto-launch')
        this.autoLaunch = !!autoLaunch
      } catch (error) {
        console.error('获取开机自启状态失败:', error)
      } finally {
        // 确保关闭行为也同步到主进程
        window.ipcRenderer.send('set-close-action', this.closeAction)
      }
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
    // 切换主题时添加过渡动画
    toggleThemeWithTransition() {
      this.toggleTheme()
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
        if (!this._systemThemeListener) {
          this._systemThemeListener = (e) => {
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
          mediaQuery.addEventListener('change', this._systemThemeListener)
          // 保存 mediaQuery 引用以便后续移除监听
          this._systemThemeMediaQuery = mediaQuery
        }
      } else {
        // 移除监听器
        if (this._systemThemeListener && this._systemThemeMediaQuery) {
          this._systemThemeMediaQuery.removeEventListener(
            'change',
            this._systemThemeListener
          )
          this._systemThemeListener = null
          this._systemThemeMediaQuery = null
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
      // this.theme = 'light'
      // this.sidebarCollapsed = false
      this.loading = false
      this.clearLoadingTargets()
      this.settingsVisible = false
      // this.autoLaunch = false
    }
  },
  persist: true
})
