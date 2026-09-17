import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagsViewStore = defineStore('tagsView', () => {
  // 已访问的标签页列表：[{ path, title, name, affix, icon }]
  const visitedViews = ref([])
  // keep-alive 缓存的组件 name 列表（与标签页生命周期绑定）
  const cachedViews = ref([])

  // 将组件 name 加入缓存（去重）
  function addCachedView(name) {
    if (!name || cachedViews.value.includes(name)) return
    cachedViews.value.push(name)
  }

  // 从缓存中移除指定组件 name
  function delCachedView(name) {
    const index = cachedViews.value.indexOf(name)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  // 添加标签页（去重），并同步管理缓存
  function addView(view) {
    if (visitedViews.value.some((v) => v.path === view.path)) return
    visitedViews.value.push(view)
    // 如果路由声明了 keepAlive，将组件 name 加入缓存列表
    if (view.meta?.keepAlive && view.name) {
      addCachedView(view.name)
    }
  }

  // 移除指定标签页，并清除其缓存
  function removeView(view) {
    const index = visitedViews.value.findIndex((v) => v.path === view.path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
    if (view.name) {
      delCachedView(view.name)
    }
  }

  // 根据当前 visitedViews 同步 cachedViews，移除已不存在的缓存
  function _syncCachedViews() {
    const keepNames = new Set(visitedViews.value.filter((v) => v.meta?.keepAlive && v.name).map((v) => v.name))
    cachedViews.value = cachedViews.value.filter((name) => keepNames.has(name))
  }

  // 移除其他标签页（保留 affix 和当前页）
  function removeOtherViews(view) {
    visitedViews.value = visitedViews.value.filter((v) => v.affix || v.path === view.path)
    _syncCachedViews()
  }

  // 移除左侧标签页（保留 affix 和当前页）
  function removeLeftViews(view) {
    const index = visitedViews.value.findIndex((v) => v.path === view.path)
    if (index <= 0) return
    visitedViews.value = visitedViews.value.filter((v, i) => v.affix || i >= index)
    _syncCachedViews()
  }

  // 移除右侧标签页（保留 affix 和当前页）
  function removeRightViews(view) {
    const index = visitedViews.value.findIndex((v) => v.path === view.path)
    if (index === -1 || index === visitedViews.value.length - 1) return
    visitedViews.value = visitedViews.value.filter((v, i) => v.affix || i <= index)
    _syncCachedViews()
  }

  // 关闭所有标签页（仅保留 affix）
  function removeAllViews() {
    visitedViews.value = visitedViews.value.filter((v) => v.affix)
    _syncCachedViews()
  }

  // 切换标签页固定状态
  function toggleAffix(view) {
    const target = visitedViews.value.find((v) => v.path === view.path)
    if (target) {
      target.affix = !target.affix
    }
  }

  return {
    visitedViews,
    cachedViews,
    addView,
    addCachedView,
    delCachedView,
    removeView,
    removeOtherViews,
    removeLeftViews,
    removeRightViews,
    removeAllViews,
    toggleAffix,
    _syncCachedViews
  }
})
