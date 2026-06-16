import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('version', {
  state: () => ({
    currentVersion: '', // 当前版本
    latestVersion: '', // 最新版本
    isUpdating: false, // 是否正在下载更新
    downloadProgress: 0, // 下载进度 0-100
    updateAvailable: false, // 是否有可用更新
    updateDownloaded: false // 更新是否已下载完成
  }),
  actions: {
    setLatestVersion(version) {
      this.latestVersion = version
      this.updateAvailable = !!version
    },
    setCurrentVersion(version) {
      this.currentVersion = version
    },
    setIsUpdating(value) {
      this.isUpdating = value
    },
    setDownloadProgress(progress) {
      this.downloadProgress = progress
    },
    setUpdateAvailable(value) {
      this.updateAvailable = value
    },
    setUpdateDownloaded(value) {
      this.updateDownloaded = value
    },
    resetUpdateState() {
      this.isUpdating = false
      this.downloadProgress = 0
      this.updateAvailable = false
      this.updateDownloaded = false
    }
  },
  persist: {
    paths: ['currentVersion', 'latestVersion']
  }
})
