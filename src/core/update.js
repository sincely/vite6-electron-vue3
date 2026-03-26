import { onMounted, onUnmounted } from 'vue'
import { useUpdateStore } from '@/store/modules/version'
import { useAppStore } from '@/store/modules/app'

export function useUpdater() {
  const updateStore = useUpdateStore()
  const appStore = useAppStore()

  const onUpdateAvailable = (_event, info) => {
    updateStore.setLatestVersion(info.version)
    window.dispatchEvent(
      new CustomEvent('update:available', {
        detail: info
      })
    )
  }

  const onUpdateNotAvailable = () => {
    updateStore.setLatestVersion('')
  }

  onMounted(() => {
    appStore.resetAppState()
    ipcRenderer.on('update-available', onUpdateAvailable)
    ipcRenderer.on('update-not-available', onUpdateNotAvailable)
  })

  onUnmounted(() => {
    ipcRenderer.off('update-available', onUpdateAvailable)
    ipcRenderer.off('update-not-available', onUpdateNotAvailable)
  })
}
