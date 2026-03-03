import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('update', {
  state: () => ({
    isUpdating: false,
    downloadProgress: 0,
    updateAvailable: false,
    updateDownloaded: false,
    latestVersion: '',
    currentVersion: '',
    dialogVisible: false
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
    setLatestVersion(version) {
      this.latestVersion = version
    },
    setCurrentVersion(version) {
      this.currentVersion = version
    },
    setDialogVisible(visible) {
      this.dialogVisible = visible
    },
    resetUpdateState() {
      this.isUpdating = false
      this.downloadProgress = 0
      this.updateAvailable = false
      this.updateDownloaded = false
      this.latestVersion = ''
      this.currentVersion = ''
      this.dialogVisible = false
    }
  },
  persist: true // 看这里，一键开启持久化
})
