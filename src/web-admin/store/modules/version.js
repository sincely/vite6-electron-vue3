import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('version', {
  state: () => ({
    currentVersion: '', // 当前版本
    latestVersion: '', // 最新版本
    updateEligible: true, // 更新资格开关（远端配置 eligible）
    autoDownload: false, // 是否自动下载（远端配置 autoDownload）
    forceUpdate: false, // 是否处于强制升级模式（当前版本被远端禁用）
    // ── 下载进度（瞬态，不持久化，供标题栏实时展示）──
    isUpdating: false, // 是否正在下载更新
    downloadProgress: 0, // 下载进度百分比（0-100，主进程上报值）
    updateDownloaded: false // 更新包是否已下载完成（待重启安装）
  }),
  actions: {
    setLatestVersion(version) {
      this.latestVersion = version
    },
    setCurrentVersion(version) {
      this.currentVersion = version
    },
    setUpdateEligible(eligible) {
      this.updateEligible = eligible
    },
    setAutoDownload(autoDownload) {
      this.autoDownload = autoDownload
    },
    setForceUpdate(force) {
      this.forceUpdate = force
    },
    setUpdating(updating) {
      this.isUpdating = updating
    },
    setDownloadProgress(percent) {
      this.downloadProgress = Math.min(Math.max(percent || 0, 0), 100)
    },
    setUpdateDownloaded(downloaded) {
      this.updateDownloaded = downloaded
    },
    // 重置下载进度状态（新更新可用 / 无更新 / 出错时调用）
    resetDownloadState() {
      this.isUpdating = false
      this.downloadProgress = 0
      this.updateDownloaded = false
    }
  },
  persist: {
    paths: ['currentVersion', 'latestVersion']
  }
})
