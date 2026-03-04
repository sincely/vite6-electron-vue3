/**
 * useUpdater —— 渲染层更新 IPC 监听桥接
 *
 * 职责：
 *  1. 监听主进程推送的所有更新事件（checking / available / progress / downloaded / error）
 *  2. 将事件结果写入 Pinia updateStore
 *  3. 在组件卸载时自动 off，防止内存泄漏
 *
 * 使用：在 App.vue 的 <script setup> 中调用一次即可全局生效
 *   import { useUpdater } from '@/hooks/useUpdater'
 *   useUpdater()
 */

import { onMounted, onUnmounted } from 'vue'
import { useUpdateStore } from '@/store/modules/update'

export function useUpdater() {
  const store = useUpdateStore()

  // ── 事件处理函数 ──────────────────────────────────────────

  const onCheckingForUpdate = () => {
    store.setCheckingForUpdate(true)
  }

  const onUpdateNotAvailable = () => {
    store.setCheckingForUpdate(false)
    store.setUpdateAvailable(false)
  }

  /**
   * @param {Electron.Event} _event
   * @param {{ version: string, releaseNotes?: string | null }} info
   */
  const onUpdateAvailable = (_event, info) => {
    store.setCheckingForUpdate(false)
    store.setLatestVersion(info.version)
    store.setReleaseNotes(info.releaseNotes || '')
    store.setUpdateAvailable(true)
    store.setDialogVisible(true)
  }

  /**
   * @param {Electron.Event} _event
   * @param {{ percent: number, transferred: number, total: number, bytesPerSecond: number }} progress
   */
  const onDownloadProgress = (_event, progress) => {
    store.setDownloadProgress(progress.percent)
  }

  /**
   * @param {Electron.Event} _event
   * @param {{ version: string }} _info
   */
  const onUpdateDownloaded = (_event, _info) => {
    store.setUpdating(false)
    store.setUpdateDownloaded(true)
  }

  /**
   * @param {Electron.Event} _event
   * @param {string} message
   */
  const onUpdateError = (_event, message) => {
    store.setUpdating(false)
    store.setCheckingForUpdate(false)
    console.error('[updater] 更新出错：', message)
  }

  // ── 生命周期 ─────────────────────────────────────────────

  onMounted(() => {
    // 启动时重置所有更新过渡态，防止上次崩溃/强退留下脏状态（如 isUpdating、dialogVisible）
    store.resetUpdateState()

    window.ipcRenderer.on('checking-for-update', onCheckingForUpdate)
    window.ipcRenderer.on('update-not-available', onUpdateNotAvailable)
    window.ipcRenderer.on('update-available', onUpdateAvailable)
    window.ipcRenderer.on('download-progress', onDownloadProgress)
    window.ipcRenderer.on('update-downloaded', onUpdateDownloaded)
    window.ipcRenderer.on('update-error', onUpdateError)
  })

  onUnmounted(() => {
    window.ipcRenderer.off('checking-for-update', onCheckingForUpdate)
    window.ipcRenderer.off('update-not-available', onUpdateNotAvailable)
    window.ipcRenderer.off('update-available', onUpdateAvailable)
    window.ipcRenderer.off('download-progress', onDownloadProgress)
    window.ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    window.ipcRenderer.off('update-error', onUpdateError)
  })
}
