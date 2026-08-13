import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

/**
 * 浏览器唤起应用 Deep Link Hook
 *
 * 监听主进程推送的 deep-link-open 事件，并在挂载时主动拉取冷启动缓存的链接。
 * 链接格式：lightning://desktop/console?id=1 → 跳转路由 /desktop/console?id=1
 * 空路径（lightning://）仅激活窗口，不做路由跳转。
 *
 * 两条链路可能对同一链接重复送达（实时推送 + 拉取兜底），通过 payload.id 去重。
 *
 * @example
 * // App.vue
 * useDeepLink()
 */
export function useDeepLink() {
  const router = useRouter()
  // 最近一次已处理的链接 id，用于去重
  let lastHandledId = null

  const navigate = (payload) => {
    if (!payload) return
    if (payload.id && payload.id === lastHandledId) return
    lastHandledId = payload.id || null

    // 空路径仅激活窗口，无需跳转
    if (!payload.fullPath) return

    console.log('[DeepLink] 跳转路由:', payload.fullPath)
    router.push(payload.fullPath).catch((err) => {
      console.warn('[DeepLink] 路由跳转失败:', err)
    })
  }

  const handler = (_event, payload) => navigate(payload)

  onMounted(() => {
    if (!window.ipcRenderer) return

    // 监听应用运行中收到的深链
    window.ipcRenderer.on('deep-link-open', handler)

    // 拉取冷启动（或登录阶段）缓存的深链，仅主窗口可消费
    window.ipcRenderer
      .invoke('get-pending-deep-link')
      .then(navigate)
      .catch((err) => {
        console.warn('[DeepLink] 获取缓存链接失败:', err)
      })
  })

  onBeforeUnmount(() => {
    window.ipcRenderer?.off('deep-link-open', handler)
  })
}
