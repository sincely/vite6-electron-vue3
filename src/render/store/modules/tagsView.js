import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    // 已访问的标签页列表：[{ path, title, name, affix, icon }]
    visitedViews: []
  }),
  actions: {
    // 添加标签页（去重）
    addView(view) {
      if (this.visitedViews.some((v) => v.path === view.path)) return
      this.visitedViews.push(view)
    },
    // 移除指定标签页
    removeView(view) {
      const index = this.visitedViews.findIndex((v) => v.path === view.path)
      if (index > -1) {
        this.visitedViews.splice(index, 1)
      }
    },
    // 移除其他标签页（保留 affix 和当前页）
    removeOtherViews(view) {
      this.visitedViews = this.visitedViews.filter(
        (v) => v.affix || v.path === view.path
      )
    },
    // 移除左侧标签页（保留 affix 和当前页）
    removeLeftViews(view) {
      const index = this.visitedViews.findIndex((v) => v.path === view.path)
      if (index <= 0) return
      this.visitedViews = this.visitedViews.filter(
        (v, i) => v.affix || i >= index
      )
    },
    // 移除右侧标签页（保留 affix 和当前页）
    removeRightViews(view) {
      const index = this.visitedViews.findIndex((v) => v.path === view.path)
      if (index === -1 || index === this.visitedViews.length - 1) return
      this.visitedViews = this.visitedViews.filter(
        (v, i) => v.affix || i <= index
      )
    },
    // 关闭所有标签页（仅保留 affix）
    removeAllViews() {
      this.visitedViews = this.visitedViews.filter((v) => v.affix)
    },
    // 切换标签页固定状态
    toggleAffix(view) {
      const target = this.visitedViews.find((v) => v.path === view.path)
      if (target) {
        target.affix = !target.affix
      }
    }
  }
})
