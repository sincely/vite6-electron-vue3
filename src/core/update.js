/**
 * useUpdater —— 渲染层更新 IPC 监听桥接
 *
 * 职责：
 *  1. 监听主进程推送的所有更新事件（checking / available / progress / downloaded / error）
 *  2. 将事件结果写入 Pinia updateStore
 *  3. 在组件卸载时自动 off，防止内存泄漏
 *
 * 使用：在 App.vue 的 <script setup> 中调用一次即可全局生效
 *   import { useUpdater } from '@/core/update'
 *   useUpdater()
 */

import { onMounted, onUnmounted } from 'vue'
import { useUpdateStore } from '@/store/modules/version'
import { useAppStore } from '@/store/modules/app'

export function useUpdater() {
  const updateStore = useUpdateStore()
  const appStore = useAppStore()

  // 检查更新
  const onCheckingForUpdate = () => {
    updateStore.setCheckingForUpdate(true)
  }

  // 没有更新时重置状态
  const onUpdateNotAvailable = () => {
    updateStore.setCheckingForUpdate(false)
    updateStore.setUpdateAvailable(false)
  }

  /**
   * @description 检测到新版本，更新状态并显示更新弹框
   * @param info 可能包含 releaseNotes 字段（来自 latest.yml），如果有则写入 store 以供弹框展示
   * @param {Electron.Event} _event
   * @param {{ version: string, releaseNotes?: string | null }} info
   */

  const onUpdateAvailable = (_event, info) => {
    updateStore.setCheckingForUpdate(false)
    updateStore.setLatestVersion(info.version)
    updateStore.setReleaseNotes(info.releaseNotes || '')
    updateStore.setUpdateAvailable(true)
    updateStore.setDialogVisible(true)
  }

  /**
   * @description 下载更新进度事件，更新下载进度百分比
   * @param progress 包含 percent、transferred、total、bytesPerSecond 字段
   * @param {Electron.Event} _event
   * @param {{ percent: number, transferred: number, total: number, bytesPerSecond: number }} progress
   */
  const onDownloadProgress = (_event, progress) => {
    updateStore.setDownloadProgress(progress.percent)
  }

  /**
   * @description 更新下载完成事件，重置下载状态并标记已下载完成（等待用户点击安装）
   * @param {Electron.Event} _event
   * @param {{ version: string }} _info
   */
  const onUpdateDownloaded = (_event, _info) => {
    updateStore.setUpdating(false)
    updateStore.setUpdateDownloaded(true)
  }

  /**
   * @description 更新出错事件，重置所有过渡状态（包括 checkingForUpdate 和 isUpdating），并在控制台输出错误信息
   * @param {Electron.Event} _event
   * @param {string} message
   */
  const onUpdateError = (_event, message) => {
    updateStore.setUpdating(false)
    updateStore.setCheckingForUpdate(false)
    console.error('[updater] 更新出错：', message)
  }

  // 生命周期`
  onMounted(() => {
    // 启动时重置所有更新过渡态，防止上次崩溃/强退留下脏状态（如 isUpdating、dialogVisible）
    updateStore.resetUpdateState()
    // 重置应用状态（包括登录状态）
    appStore.resetAppState()

    ipcRenderer.on('checking-for-update', onCheckingForUpdate)
    ipcRenderer.on('update-not-available', onUpdateNotAvailable)
    ipcRenderer.on('update-available', onUpdateAvailable)
    ipcRenderer.on('download-progress', onDownloadProgress)
    ipcRenderer.on('update-downloaded', onUpdateDownloaded)
    ipcRenderer.on('update-error', onUpdateError)
  })

  onUnmounted(() => {
    ipcRenderer.off('checking-for-update', onCheckingForUpdate)
    ipcRenderer.off('update-not-available', onUpdateNotAvailable)
    ipcRenderer.off('update-available', onUpdateAvailable)
    ipcRenderer.off('download-progress', onDownloadProgress)
    ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    ipcRenderer.off('update-error', onUpdateError)
  })
}
