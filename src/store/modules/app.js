import { defineStore } from 'pinia'
import { nextTick } from 'vue'

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light', // 当前主题，默认是亮色主题
    sidebarCollapsed: false, // 侧边栏是否折叠
    settingsVisible: false, // 设置弹窗是否可见
    loading: false, // 是否显示加载中状态
    loadingTargets: [], // 加载中状态的目标元素
    autoLaunch: false, // 开机自启
    closeAction: 'minimize' // 关闭窗口行为：minimize | quit
  }),
  getters: {
    isDark: (state) => state.theme === 'dark',
    isAutoLaunch: (state) => state.autoLaunch,
    windowCloseAction: (state) => state.closeAction
  },
  actions: {
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
    toggleThemeWithTransition(event, theme) {
      // 检查是否支持视图过渡 API
      const canUseViewTransition =
        typeof document !== 'undefined' &&
        typeof document.startViewTransition === 'function' &&
        window.matchMedia?.('(prefers-reduced-motion: no-preference)').matches

      if (!canUseViewTransition) {
        this.toggleTheme()
        return
      }

      // 使用传入的目标主题
      const nextTheme = theme
      // 计算是否变暗（auto 模式下可能需要判断系统主题，这里简化处理）
      const isGoingDark = nextTheme === 'dark'

      const point = (() => {
        const x = event?.clientX
        const y = event?.clientY
        if (Number.isFinite(x) && Number.isFinite(y)) {
          return { x, y }
        }

        const target = event?.currentTarget
        if (target && typeof target.getBoundingClientRect === 'function') {
          const rect = target.getBoundingClientRect()
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          }
        }

        return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      })()

      const endRadius = Math.hypot(
        Math.max(point.x, window.innerWidth - point.x),
        Math.max(point.y, window.innerHeight - point.y)
      )
      const clipPath = [
        `circle(0px at ${point.x}px ${point.y}px)`,
        `circle(${endRadius}px at ${point.x}px ${point.y}px)`
      ]

      const root = document.documentElement
      root.classList.add('theme-vt')
      root.classList.toggle('theme-vt-to-dark', isGoingDark)
      root.classList.toggle('theme-vt-to-light', !isGoingDark)

      let transition
      try {
        transition = document.startViewTransition(async () => {
          this.setTheme(nextTheme)
          await nextTick()
        })
      } catch {
        root.classList.remove(
          'theme-vt',
          'theme-vt-to-dark',
          'theme-vt-to-light'
        )
        this.setTheme(nextTheme)
        return
      }

      transition.ready
        .then(() => {
          root.animate(
            { clipPath: isGoingDark ? clipPath : clipPath.slice().reverse() },
            {
              duration: 680,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: isGoingDark
                ? '::view-transition-new(root)'
                : '::view-transition-old(root)'
            }
          )
        })
        .catch(() => {})

      const cleanup = () => {
        root.classList.remove(
          'theme-vt',
          'theme-vt-to-dark',
          'theme-vt-to-light'
        )
      }
      transition.finished.then(cleanup, cleanup)
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
    },
    // 切换侧边栏折叠状态
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    // 设置侧边栏折叠状态
    setSidebarCollapsed(val) {
      this.sidebarCollapsed = val
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
