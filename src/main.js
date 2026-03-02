import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import '@/styles/index.scss' // 全局样式
import { setupIcon } from './plugins' // 全局注册antd图标
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/update'
import { ElNotification } from 'element-plus'

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

    // 获取当前版本号
    window.ipcRenderer.invoke('get-app-version').then((version) => {
      updateStore.setCurrentVersion(version)
    })

    // 监听主进程发送的通知
    window.ipcRenderer.on('show-notification', (event, options) => {
      ElNotification({
        title: options.title,
        message: options.body,
        duration: 3000
      })
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
      }, 1500)

      // 监听 start-download 后模拟下载进度
      window.ipcRenderer.on('start-download', () => {
        updateStore.setUpdating(true)
        updateStore.setDownloadProgress(0)
        let progress = 0
        const timer = setInterval(() => {
          progress += Math.random() * 8 + 3
          if (progress >= 100) {
            progress = 100
            updateStore.setDownloadProgress(100)
            clearInterval(timer)
            setTimeout(() => {
              updateStore.setUpdating(false)
              updateStore.setUpdateDownloaded(true)
            }, 400)
          } else {
            updateStore.setDownloadProgress(progress)
          }
        }, 300)
      })
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
