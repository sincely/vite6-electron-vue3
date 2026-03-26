import { defineStore } from 'pinia'

export const useUpdateStore = defineStore('version', {
  state: () => ({
    currentVersion: '', // 当前版本
    latestVersion: '' // 最新版本
  }),
  actions: {
    setLatestVersion(version) {
      this.latestVersion = version
    },
    setCurrentVersion(version) {
      this.currentVersion = version
    }
  },
  persist: {
    paths: ['currentVersion', 'latestVersion']
  }
})
