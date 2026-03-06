import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    theme: 'light',
    sidebarCollapsed: false,
    loading: false,
    loadingTargets: new Set()
  }),
  getters: {
    isDark: (state) => state.theme === 'dark'
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', this.theme)
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
      this.loadingTargets.add(target)
    },
    // 移除loading目标
    removeLoadingTarget(target) {
      this.loadingTargets.delete(target)
    },

    // 清空所有loading目标
    clearLoadingTargets() {
      this.loadingTargets.clear()
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
