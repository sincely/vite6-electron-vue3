import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('update', {
  state: () => ({
    isUpdating: false,
    downloadProgress: 0,
    updateAvailable: false,
    updateDownloaded: false
  }),
  actions: {
    setUpdating(status) {
      this.isUpdating = status
    },
    setDownloadProgress(progress) {
      this.downloadProgress = progress
    },
    setUpdateAvailable(status) {
      this.updateAvailable = status
    },
    setUpdateDownloaded(status) {
      this.updateDownloaded = status
    },
    resetUpdateState() {
      this.isUpdating = false
      this.downloadProgress = 0
      this.updateAvailable = false
      this.updateDownloaded = false
    }
  }
})
