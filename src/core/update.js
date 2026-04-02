import { onMounted, onUnmounted } from 'vue'
import { useUpdateStore } from '@/store/modules/version'
import { useAppStore } from '@/store/modules/app'

export function useUpdater() {
  const updateStore = useUpdateStore()
  const appStore = useAppStore()

  // ─── 全量更新事件 ────────────────────────────────────────────────────
  const onUpdateAvailable = (_event, info) => {
    updateStore.setLatestVersion(info.version)
    window.dispatchEvent(new CustomEvent('update:available', { detail: info }))
  }

  const onUpdateNotAvailable = () => {
    updateStore.setLatestVersion('')
  }

  const onDownloadProgress = (_event, progress) => {
    window.dispatchEvent(
      new CustomEvent('update:download-progress', { detail: progress })
    )
  }

  const onUpdateDownloaded = (_event, info) => {
    if (info?.version) updateStore.setLatestVersion(info.version)
    window.dispatchEvent(new CustomEvent('update:downloaded', { detail: info }))
  }

  const onUpdateError = (_event, message) => {
    window.dispatchEvent(new CustomEvent('update:error', { detail: message }))
  }

  // ─── 热更新事件 ──────────────────────────────────────────────────────
  /**
   * hot-update-available: 发现新版本，可在此弹出提示"发现新版本，正在后台下载…"
   * detail: { version, releaseNotes }
   */
  const onHotUpdateAvailable = (_event, info) => {
    window.dispatchEvent(
      new CustomEvent('hot-update:available', { detail: info })
    )
  }

  /**
   * hot-update-progress: 下载进度
   * detail: { percent, received, total }
   */
  const onHotUpdateProgress = (_event, progress) => {
    window.dispatchEvent(
      new CustomEvent('hot-update:progress', { detail: progress })
    )
  }

  /**
   * hot-update-ready: 下载+解压完成，可在此弹出"更新已就绪，立即应用？"
   * 用户确认后调用 ipcRenderer.send('apply-hot-update') 重载窗口
   * detail: { version, releaseNotes }
   */
  const onHotUpdateReady = (_event, info) => {
    if (info?.version) updateStore.setLatestVersion(info.version)
    window.dispatchEvent(new CustomEvent('hot-update:ready', { detail: info }))
  }

  /**
   * hot-update-error: 热更新失败（自动回退到全量更新检查）
   * detail: errorMessage string
   */
  const onHotUpdateError = (_event, message) => {
    window.dispatchEvent(
      new CustomEvent('hot-update:error', { detail: message })
    )
  }

  /**
   * hot-update-need-full: 热更新不兼容当前版本，需要全量更新
   * detail: { version, releaseNotes }
   */
  const onHotUpdateNeedFull = (_event, info) => {
    window.dispatchEvent(
      new CustomEvent('hot-update:need-full', { detail: info })
    )
  }

  onMounted(() => {
    appStore.resetAppState()

    // 全量更新
    ipcRenderer.on('update-available', onUpdateAvailable)
    ipcRenderer.on('update-not-available', onUpdateNotAvailable)
    ipcRenderer.on('download-progress', onDownloadProgress)
    ipcRenderer.on('update-downloaded', onUpdateDownloaded)
    ipcRenderer.on('update-error', onUpdateError)

    // 热更新
    ipcRenderer.on('hot-update-available', onHotUpdateAvailable)
    ipcRenderer.on('hot-update-progress', onHotUpdateProgress)
    ipcRenderer.on('hot-update-ready', onHotUpdateReady)
    ipcRenderer.on('hot-update-error', onHotUpdateError)
    ipcRenderer.on('hot-update-need-full', onHotUpdateNeedFull)
  })

  onUnmounted(() => {
    // 全量更新
    ipcRenderer.off('update-available', onUpdateAvailable)
    ipcRenderer.off('update-not-available', onUpdateNotAvailable)
    ipcRenderer.off('download-progress', onDownloadProgress)
    ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    ipcRenderer.off('update-error', onUpdateError)

    // 热更新
    ipcRenderer.off('hot-update-available', onHotUpdateAvailable)
    ipcRenderer.off('hot-update-progress', onHotUpdateProgress)
    ipcRenderer.off('hot-update-ready', onHotUpdateReady)
    ipcRenderer.off('hot-update-error', onHotUpdateError)
    ipcRenderer.off('hot-update-need-full', onHotUpdateNeedFull)
  })
}
