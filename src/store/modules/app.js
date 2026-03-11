import { defineStore } from 'pinia'
import { nextTick } from 'vue'

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light', // 当前主题，默认是亮色主题
    sidebarCollapsed: false, // 侧边栏是否折叠
    settingsVisible: false, // 设置弹窗是否可见
    loading: false, // 是否显示加载中状态
    loadingTargets: [] // 加载中状态的目标元素
  }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    toggleSettings(visible) {
      this.settingsVisible =
        visible === undefined ? !this.settingsVisible : visible
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', this.theme)
    },
    toggleThemeWithTransition(event) {
      const canUseViewTransition =
        typeof document !== 'undefined' &&
        typeof document.startViewTransition === 'function' &&
        window.matchMedia?.('(prefers-reduced-motion: no-preference)').matches

      if (!canUseViewTransition) {
        this.toggleTheme()
        return
      }

      const root = document.documentElement
      const isGoingDark = this.theme !== 'dark'

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

      root.classList.add('theme-vt')
      root.classList.toggle('theme-vt-to-dark', isGoingDark)
      root.classList.toggle('theme-vt-to-light', !isGoingDark)

      let transition
      try {
        transition = document.startViewTransition(async () => {
          this.toggleTheme()
          await nextTick()
        })
      } catch {
        root.classList.remove(
          'theme-vt',
          'theme-vt-to-dark',
          'theme-vt-to-light'
        )
        this.toggleTheme()
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
    setTheme(theme) {
      this.theme = theme
      document.documentElement.setAttribute('data-theme', theme)
    },
    initTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
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
      this.theme = 'light'
      this.sidebarCollapsed = false
      this.loading = false
      this.clearLoadingTargets()
    }
  },
  persist: true
})
