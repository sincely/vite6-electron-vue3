import { onMounted, onUnmounted } from 'vue'
import { useUpdateStore } from '@/store/modules/version'
import { useAppStore } from '@/store/modules/app'

export function useUpdater() {
  const updateStore = useUpdateStore()
  const appStore = useAppStore()

  // 监听有可用更新
  const onUpdateAvailable = (_event, info) => {
    updateStore.setLatestVersion(info.version)
    window.dispatchEvent(
      new CustomEvent('update:available', {
        detail: info
      })
    )
  }
  // 监听无可用更新
  const onUpdateNotAvailable = () => {
    updateStore.setLatestVersion('')
  }

  // 监听下载进度
  const onDownloadProgress = (_event, progress) => {
    window.dispatchEvent(
      new CustomEvent('update:download-progress', {
        detail: progress
      })
    )
  }

  // 监听下载完成
  const onUpdateDownloaded = (_event, info) => {
    if (info?.version) {
      updateStore.setLatestVersion(info.version)
    }
    window.dispatchEvent(
      new CustomEvent('update:downloaded', {
        detail: info
      })
    )
  }
  // 监听更新出错
  const onUpdateError = (_event, message) => {
    window.dispatchEvent(
      new CustomEvent('update:error', {
        detail: message
      })
    )
  }

  onMounted(() => {
    appStore.resetAppState()
    ipcRenderer.on('update-available', onUpdateAvailable)
    ipcRenderer.on('update-not-available', onUpdateNotAvailable)
    ipcRenderer.on('download-progress', onDownloadProgress)
    ipcRenderer.on('update-downloaded', onUpdateDownloaded)
    ipcRenderer.on('update-error', onUpdateError)
  })

  onUnmounted(() => {
    ipcRenderer.off('update-available', onUpdateAvailable)
    ipcRenderer.off('update-not-available', onUpdateNotAvailable)
    ipcRenderer.off('download-progress', onDownloadProgress)
    ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    ipcRenderer.off('update-error', onUpdateError)
  })
}
