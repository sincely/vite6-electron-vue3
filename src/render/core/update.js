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

  onMounted(() => {
    appStore.resetAppState()

    // 全量更新
    ipcRenderer.on('update-available', onUpdateAvailable)
    ipcRenderer.on('update-not-available', onUpdateNotAvailable)
    ipcRenderer.on('download-progress', onDownloadProgress)
    ipcRenderer.on('update-downloaded', onUpdateDownloaded)
    ipcRenderer.on('update-error', onUpdateError)
  })

  onUnmounted(() => {
    // 全量更新
    ipcRenderer.off('update-available', onUpdateAvailable)
    ipcRenderer.off('update-not-available', onUpdateNotAvailable)
    ipcRenderer.off('download-progress', onDownloadProgress)
    ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    ipcRenderer.off('update-error', onUpdateError)
  })
}
