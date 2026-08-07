import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('version', {
  state: () => ({
    currentVersion: '', // 当前版本
    latestVersion: '', // 最新版本
    updateEligible: true, // 更新资格开关（远端配置 eligible）
    autoDownload: false, // 是否自动下载（远端配置 autoDownload）
    forceUpdate: false // 是否处于强制升级模式（当前版本被远端禁用）
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
    }
  },
  persist: {
    paths: ['currentVersion', 'latestVersion']
  }
})
