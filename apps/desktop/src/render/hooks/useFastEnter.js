import { computed } from 'vue'
import fastEnterConfig from '@/config/fastEnter'

/**
 * 快速入口数据（参照 art-design-pro）
 * 返回启用（enabled !== false）并按 order 升序的应用列表与快速链接
 */
export function useFastEnter() {
  // 获取启用的应用列表（按排序权重排序）
  const enabledApplications = computed(() =>
    (fastEnterConfig.applications || [])
      .filter((item) => item.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  )

  // 获取启用的快速链接（按排序权重排序）
  const enabledQuickLinks = computed(() =>
    (fastEnterConfig.quickLinks || [])
      .filter((item) => item.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  )

  return { enabledApplications, enabledQuickLinks }
}
