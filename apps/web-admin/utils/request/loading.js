/**
 * 统一 loading 状态管理
 * 控制全局 loading 和局部 loading 的显示/隐藏
 */
import { useAppStore } from '@/store/modules/app'

/**
 * 请求开始前，根据 config 开启 loading
 */
export function startLoading(config) {
  const appStore = useAppStore()
  if (config.showLoading !== false) {
    appStore.setLoading(true)
  }
  if (config.loadingTarget) {
    appStore.addLoadingTarget(config.loadingTarget)
  }
}

/**
 * 请求结束后，根据 config 关闭 loading
 */
export function stopLoading(config) {
  const appStore = useAppStore()
  if (config.showLoading !== false) {
    appStore.setLoading(false)
  }
  if (config.loadingTarget) {
    appStore.removeLoadingTarget(config.loadingTarget)
  }
}

/**
 * 请求异常时，强制关闭所有 loading
 */
export function resetLoading() {
  const appStore = useAppStore()
  appStore.setLoading(false)
  appStore.clearLoadingTargets()
}
