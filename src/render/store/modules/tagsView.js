import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    // 已访问的标签页列表：[{ path, title, name, affix, icon }]
    visitedViews: [],
    // keep-alive 缓存的组件 name 列表（与标签页生命周期绑定）
    cachedViews: []
  }),
  actions: {
    // 添加标签页（去重），并同步管理缓存
    addView(view) {
      if (this.visitedViews.some((v) => v.path === view.path)) return
      this.visitedViews.push(view)
      // 如果路由声明了 keepAlive，将组件 name 加入缓存列表
      if (view.meta?.keepAlive && view.name) {
        this.addCachedView(view.name)
      }
    },
    // 将组件 name 加入缓存（去重）
    addCachedView(name) {
      if (!name || this.cachedViews.includes(name)) return
      this.cachedViews.push(name)
    },
    // 从缓存中移除指定组件 name
    delCachedView(name) {
      const index = this.cachedViews.indexOf(name)
      if (index > -1) {
        this.cachedViews.splice(index, 1)
      }
    },
    // 移除指定标签页，并清除其缓存
    removeView(view) {
      const index = this.visitedViews.findIndex((v) => v.path === view.path)
      if (index > -1) {
        this.visitedViews.splice(index, 1)
      }
      if (view.name) {
        this.delCachedView(view.name)
      }
    },
    // 移除其他标签页（保留 affix 和当前页）
    removeOtherViews(view) {
      this.visitedViews = this.visitedViews.filter(
        (v) => v.affix || v.path === view.path
      )
      this._syncCachedViews()
    },
    // 移除左侧标签页（保留 affix 和当前页）
    removeLeftViews(view) {
      const index = this.visitedViews.findIndex((v) => v.path === view.path)
      if (index <= 0) return
      this.visitedViews = this.visitedViews.filter(
        (v, i) => v.affix || i >= index
      )
      this._syncCachedViews()
    },
    // 移除右侧标签页（保留 affix 和当前页）
    removeRightViews(view) {
      const index = this.visitedViews.findIndex((v) => v.path === view.path)
      if (index === -1 || index === this.visitedViews.length - 1) return
      this.visitedViews = this.visitedViews.filter(
        (v, i) => v.affix || i <= index
      )
      this._syncCachedViews()
    },
    // 关闭所有标签页（仅保留 affix）
    removeAllViews() {
      this.visitedViews = this.visitedViews.filter((v) => v.affix)
      this._syncCachedViews()
    },
    // 切换标签页固定状态
    toggleAffix(view) {
      const target = this.visitedViews.find((v) => v.path === view.path)
      if (target) {
        target.affix = !target.affix
      }
    },
    // 根据当前 visitedViews 同步 cachedViews，移除已不存在的缓存
    _syncCachedViews() {
      const keepNames = new Set(
        this.visitedViews
          .filter((v) => v.meta?.keepAlive && v.name)
          .map((v) => v.name)
      )
      this.cachedViews = this.cachedViews.filter((name) => keepNames.has(name))
    }
  }
})
