import { ref, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * 动态计算表格高度的 Hook
 * @param {number} bottomOffset 底部留白偏移量(包含分页器高度等)
 * @returns {Object} 包含 tableHeight, tableRef 和重新计算的方法 calcHeight
 */
export function useTableHeight(bottomOffset = 60) {
  const tableHeight = ref(400) // 默认高度
  const tableRef = ref(null)

  const calcHeight = () => {
    if (!tableRef.value) return
    const el = tableRef.value.$el || tableRef.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    // 计算可用高度：视口高度 - 表格距离顶部的高度 - 底部偏移量
    const height = window.innerHeight - rect.top - bottomOffset
    // 限制最小高度，防止表格被挤压到不可见
    tableHeight.value = Math.max(height, 200)
  }

  // 防抖处理 resize
  let resizeTimer = null
  const handleResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      calcHeight()
    }, 100)
  }

  // 监听表格容器尺寸变化：上方兄弟节点（如搜索栏展开/收起）改变会挤压容器，
  // 使表格顶部位置下移/上移，需要重算高度，避免 max-height 沿用旧值把底部裁掉
  let resizeObserver = null
  const observeLayout = () => {
    const el = tableRef.value?.$el || tableRef.value
    const target = el?.parentElement
    if (!target || typeof ResizeObserver === 'undefined') return
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(target)
  }

  onMounted(() => {
    nextTick(() => {
      calcHeight()
      observeLayout()
    })
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    if (resizeTimer) clearTimeout(resizeTimer)
  })

  return {
    tableHeight,
    tableRef,
    calcHeight
  }
}
