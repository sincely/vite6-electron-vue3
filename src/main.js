import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import '@/styles/index.scss' // 全局样式
import { setupIcon } from './plugins' // 全局注册antd图标
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/update'
import { useNotificationStore } from '@/store/modules/notification'

async function setupApp() {
  const app = createApp(App)
  setupIcon(app)
  app.use(store)
  app.use(router)
  app.mount('#app').$nextTick(() => {
    // 初始化主题
    const appStore = useAppStore()
    appStore.initTheme()
    const updateStore = useUpdateStore()
    const notifStore = useNotificationStore()

    // 获取当前版本号
    window.ipcRenderer.invoke('get-app-version').then((version) => {
      updateStore.setCurrentVersion(version)
    })

    // 监听主进程发送的通知 → 推入通知中心
    window.ipcRenderer.on('show-notification', (event, options) => {
      notifStore.push({ title: options.title, body: options.body, type: options.type ?? 'info' })
    })

    // 监听下载进度
    window.ipcRenderer.on('download-progress', (event, progress) => {
      updateStore.setUpdating(true)
      updateStore.setDownloadProgress(progress.percent)
    })

    // 监听更新可用
    window.ipcRenderer.on('update-available', (event, info) => {
      updateStore.setUpdateAvailable(true)
      updateStore.setLatestVersion(info.version)
      updateStore.setDialogVisible(true)
    })

    // 开发模式：模拟完整更新流程（弹框 → 进度条 → 完成）
    if (import.meta.env.DEV) {
      setTimeout(() => {
        updateStore.setCurrentVersion(updateStore.currentVersion || '0.0.3')
        updateStore.setLatestVersion('0.1.0')
        updateStore.setUpdateAvailable(true)
        updateStore.setDialogVisible(true)
        // 模拟几条通知
        notifStore.push({ title: '欢迎使用', body: '应用已成功启动，祝您使用愉快！', type: 'success' })
        notifStore.push({ title: '系统提示', body: '检测到新版本 v0.1.0 可用，建议尽快更新。', type: 'info' })
        notifStore.push({ title: '连接警告', body: '代理服务器响应超时，请检查网络配置。', type: 'warning' })
      }, 1500)
    }

    // 监听更新下载完成
    window.ipcRenderer.on('update-downloaded', () => {
      updateStore.setUpdateDownloaded(true)
      updateStore.setUpdating(false)
    })

    // 监听无新版本
    window.ipcRenderer.on('update-not-available', () => {
      updateStore.resetUpdateState()
    })
  })
  app.config.performance = false
}

setupApp()
