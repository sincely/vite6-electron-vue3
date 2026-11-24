import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUpdateStore = defineStore(
  'version',
  () => {
    const currentVersion = ref('') // 当前版本
    const latestVersion = ref('') // 最新版本
    const updateEligible = ref(true) // 更新资格开关（远端配置 eligible）
    const autoDownload = ref(false) // 是否自动下载（远端配置 autoDownload）
    const forceUpdate = ref(false) // 是否处于强制升级模式（当前版本被远端禁用）
    // ── 下载进度（瞬态，不持久化，供标题栏实时展示）──
    const isUpdating = ref(false) // 是否正在下载更新
    const downloadProgress = ref(0) // 下载进度百分比（0-100，主进程上报值）
    const updateDownloaded = ref(false) // 更新包是否已下载完成（待重启安装）

    function setLatestVersion(version) {
      latestVersion.value = version
    }

    function setCurrentVersion(version) {
      currentVersion.value = version
    }

    function setUpdateEligible(eligible) {
      updateEligible.value = eligible
    }

    function setAutoDownload(value) {
      autoDownload.value = value
    }

    function setForceUpdate(force) {
      forceUpdate.value = force
    }

    function setUpdating(updating) {
      isUpdating.value = updating
    }

    function setDownloadProgress(percent) {
      downloadProgress.value = Math.min(Math.max(percent || 0, 0), 100)
    }

    function setUpdateDownloaded(downloaded) {
      updateDownloaded.value = downloaded
    }

    // 重置下载进度状态（新更新可用 / 无更新 / 出错时调用）
    function resetDownloadState() {
      isUpdating.value = false
      downloadProgress.value = 0
      updateDownloaded.value = false
    }

    return {
      currentVersion,
      latestVersion,
      updateEligible,
      autoDownload,
      forceUpdate,
      isUpdating,
      downloadProgress,
      updateDownloaded,
      setLatestVersion,
      setCurrentVersion,
      setUpdateEligible,
      setAutoDownload,
      setForceUpdate,
      setUpdating,
      setDownloadProgress,
      setUpdateDownloaded,
      resetDownloadState
    }
  },
  {
    persist: {
      pick: ['currentVersion', 'latestVersion']
    }
  }
)
