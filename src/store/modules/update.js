import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('update', {
  state: () => ({
    // 过渡状态（不持久化，启动时总是重置）──
    checkingForUpdate: false, // 正在检查中
    isUpdating: false, // 正在下载中
    downloadProgress: 0, // 下载进度 0-100
    updateDownloaded: false, // 已下载完成等待安装

    // 版本信息
    currentVersion: '', // 当前安装版本（启动时由主进程注入）
    latestVersion: '', // 检测到的最新版本
    releaseNotes: '', // 更新说明（来自 latest.yml 的 releaseNotes 字段）

    // UI控制
    updateAvailable: false, // 是否有可用更新
    dialogVisible: false // 弹框是否可见
  }),
  actions: {
    setCheckingForUpdate(status) {
      this.checkingForUpdate = status
    },
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
    setReleaseNotes(notes) {
      this.releaseNotes = notes
    },
    setDialogVisible(visible) {
      this.dialogVisible = visible
    },
    /** 重置所有过渡态（不清空版本号），供关闭弹框或错误恢复时使用 */
    resetUpdateState() {
      this.checkingForUpdate = false
      this.isUpdating = false
      this.downloadProgress = 0
      this.updateAvailable = false
      this.updateDownloaded = false
      this.latestVersion = ''
      this.releaseNotes = ''
      this.dialogVisible = false
    }
  }
  // 注意：intentionally 不持久化（persist 已移除）
  // 原因：isUpdating / downloadProgress 等过渡状态不应跨重启保留，
  //       避免应用崩溃后下次启动仍显示下载中的脏 UI
})
