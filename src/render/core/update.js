/**
 * 应用更新 Hook
 *
 * 职责：充当主进程 IPC 事件与渲染进程 DOM 事件之间的桥梁
 *
 * 事件流：
 *   主进程 (electron-updater)
 *     → IPC 事件 (ipcRenderer.on)
 *     → 本 Hook 转换为 CustomEvent
 *     → window.dispatchEvent
 *     → UpdateDialog 组件监听
 *
 * 支持的更新事件：
 *   - update-available      : 发现新版本
 *   - update-not-available  : 当前已是最新版本
 *   - download-progress     : 下载进度更新
 *   - update-downloaded     : 更新包下载完成
 *   - update-error          : 更新过程出错
 *   - menu-check-update     : 用户从菜单手动触发检查更新
 */
import { onMounted, onUnmounted } from 'vue'
import { useUpdateStore } from '@/store/modules/version'
import { useAppStore } from '@/store/modules/app'

export function useUpdater() {
  const updateStore = useUpdateStore()
  const appStore = useAppStore()

  // ─── IPC → CustomEvent 转换函数 ────────────────────────────────────────

  /**
   * 发现新版本
   * 将版本号存入 Pinia Store，并派发自定义事件通知 UI 层
   */
  const onUpdateAvailable = (_event, info) => {
    updateStore.setLatestVersion(info.version)
    window.dispatchEvent(new CustomEvent('update:available', { detail: info }))
  }

  /**
   * 没有可用更新
   * 清空 Store 中的最新版本号
   */
  const onUpdateNotAvailable = () => {
    updateStore.setLatestVersion('')
  }

  /**
   * 下载进度更新
   * 将进度数据（bytesPerSecond, transferred, total, percent）转发给 UI
   */
  const onDownloadProgress = (_event, progress) => {
    window.dispatchEvent(
      new CustomEvent('update:download-progress', { detail: progress })
    )
  }

  /**
   * 更新包下载完成
   * 更新 Store 版本号，通知 UI 显示"安装"按钮
   */
  const onUpdateDownloaded = (_event, info) => {
    if (info?.version) updateStore.setLatestVersion(info.version)
    window.dispatchEvent(new CustomEvent('update:downloaded', { detail: info }))
  }

  /**
   * 更新过程出错
   * 通知 UI 层显示错误状态
   */
  const onUpdateError = (_event, message) => {
    window.dispatchEvent(new CustomEvent('update:error', { detail: message }))
  }

  // ─── 菜单手动触发检查更新 ─────────────────────────────────────────────

  /**
   * 用户从应用菜单点击"检查更新"
   * 主进程发送 menu-check-update → 转换为 update:open-dialog 事件
   * UpdateDialog 收到后弹窗提示用户
   */
  const onMenuCheckUpdate = () => {
    window.dispatchEvent(new Event('update:open-dialog'))
  }

  // ─── 生命周期：注册/注销监听 ──────────────────────────────────────────

  onMounted(() => {
    appStore.resetAppState()

    // 注册全量更新 IPC 监听
    ipcRenderer.on('update-available', onUpdateAvailable)
    ipcRenderer.on('update-not-available', onUpdateNotAvailable)
    ipcRenderer.on('download-progress', onDownloadProgress)
    ipcRenderer.on('update-downloaded', onUpdateDownloaded)
    ipcRenderer.on('update-error', onUpdateError)
    // 注册菜单手动检查更新监听
    ipcRenderer.on('menu-check-update', onMenuCheckUpdate)
  })

  onUnmounted(() => {
    // 清理全量更新 IPC 监听
    ipcRenderer.off('update-available', onUpdateAvailable)
    ipcRenderer.off('update-not-available', onUpdateNotAvailable)
    ipcRenderer.off('download-progress', onDownloadProgress)
    ipcRenderer.off('update-downloaded', onUpdateDownloaded)
    ipcRenderer.off('update-error', onUpdateError)
    // 清理菜单检查更新监听
    ipcRenderer.off('menu-check-update', onMenuCheckUpdate)
  })
}
