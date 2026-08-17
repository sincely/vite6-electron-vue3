/**
 * 应用更新 Hook
 *
 * 职责：充当主进程 IPC 事件与渲染进程 DOM 事件之间的桥梁
 *
 * 事件流：
 *   主进程 (electron-updater)
 *     → IPC 事件 (ipcRenderer.on)
 *     → 本 Hook 转换为 CustomEvent
 *     → window.dispatchEvent
 *     → UpdateDialog 组件监听
 *
 * 支持的更新事件：
 *   - update-available      : 发现新版本
 *   - update-not-available  : 当前已是最新版本
 *   - download-progress     : 下载进度更新
 *   - update-downloaded     : 更新包下载完成
 *   - update-error          : 更新过程出错
 *   - menu-check-update     : 用户从菜单手动触发检查更新
 */
import { onMounted, onUnmounted } from 'vue'
import { useUpdateStore } from '@/store/modules/version'
import { useAppStore } from '@/store/modules/app'

export function useUpdater() {
  const updateStore = useUpdateStore()
  const appStore = useAppStore()

  // ─── IPC → CustomEvent 转换函数 ────────────────────────────────────────

  /**
   * 发现新版本
   * 将版本号存入 Pinia Store，并派发自定义事件通知 UI 层
   * 自动下载模式下主进程会立即开始下载，提前置为下载中状态
   */
  const onUpdateAvailable = (_event, info) => {
    updateStore.setLatestVersion(info.version)
    updateStore.resetDownloadState()
    if (updateStore.autoDownload) {
      updateStore.setUpdating(true)
    }
    window.dispatchEvent(new CustomEvent('update:available', { detail: info }))
  }

  /**
   * 没有可用更新
   * 清空 Store 中的最新版本号
   */
  const onUpdateNotAvailable = () => {
    updateStore.setLatestVersion('')
    updateStore.resetDownloadState()
  }

  /**
   * 下载进度更新
   * 进度写入 Store（标题栏实时展示），并转发给 UI（弹窗进度条）
   */
  const onDownloadProgress = (_event, progress) => {
    updateStore.setUpdating(true)
    updateStore.setDownloadProgress(progress?.percent ?? 0)
    window.dispatchEvent(
      new CustomEvent('update:download-progress', { detail: progress })
    )
  }

  /**
   * 更新包下载完成
   * 更新 Store 版本号与下载状态，通知 UI 显示"安装"按钮
   */
  const onUpdateDownloaded = (_event, info) => {
    if (info?.version) updateStore.setLatestVersion(info.version)
    updateStore.setUpdating(false)
    updateStore.setDownloadProgress(100)
    updateStore.setUpdateDownloaded(true)
    window.dispatchEvent(new CustomEvent('update:downloaded', { detail: info }))
  }

  /**
   * 更新过程出错
   * 重置下载中状态，通知 UI 层显示错误状态
   */
  const onUpdateError = (_event, message) => {
    updateStore.setUpdating(false)
    updateStore.setDownloadProgress(0)
    window.dispatchEvent(new CustomEvent('update:error', { detail: message }))
  }

  /**
   * 远端更新配置变化（eligible/禁用版本/autoDownload）
   * 由主进程 update-config 频道推送 → 转换为 update:config 事件
   */
  const onUpdateConfig = (_event, config) => {
    window.dispatchEvent(new CustomEvent('update:config', { detail: config }))
  }

  /**
   * 强制升级信号（当前版本被远端禁用）
   * 由主进程 force-update 频道推送 → 转换为 update:force 事件
   */
  const onForceUpdate = (_event, payload) => {
    window.dispatchEvent(new CustomEvent('update:force', { detail: payload }))
  }

  // ─── 菜单手动触发检查更新 ─────────────────────────────────────────────

  /**
   * 用户从应用菜单点击"检查更新"
   * 主进程发送 menu-check-update → 转换为 update:open-dialog 事件
   * UpdateDialog 收到后弹窗提示用户
   */
  const onMenuCheckUpdate = () => {
    window.dispatchEvent(new Event('update:open-dialog'))
  }

  // ─── 生命周期：注册/注销监听 ──────────────────────────────────────────

  onMounted(() => {
    appStore.resetAppState()

    // 注册全量更新 IPC 监听
    ipcRenderer.on('update-available', onUpdateAvailable)
    ipcRenderer.on('update-not-available', onUpdateNotAvailable)
    ipcRenderer.on('download-progress', onDownloadProgress)
    ipcRenderer.on('update-downloaded', onUpdateDownloaded)
    ipcRenderer.on('update-error', onUpdateError)
    // 注册远端配置与强制升级监听
    ipcRenderer.on('update-config', onUpdateConfig)
    ipcRenderer.on('force-update', onForceUpdate)
    // 注册菜单手动检查更新监听
    ipcRenderer.on('menu-check-update', onMenuCheckUpdate)
  })

  onUnmounted(() => {
    // 清理全量更新 IPC 监听
    ipcRenderer.off('update-available', onUpdateAvailable)
    ipcRenderer.off('update-not-available', onUpdateNotAvailable)
    ipcRenderer.off('download-progress', onDownloadProgress)
    ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    ipcRenderer.off('update-error', onUpdateError)
    // 清理远端配置与强制升级监听
    ipcRenderer.off('update-config', onUpdateConfig)
    ipcRenderer.off('force-update', onForceUpdate)
    // 清理菜单检查更新监听
    ipcRenderer.off('menu-check-update', onMenuCheckUpdate)
  })
}
