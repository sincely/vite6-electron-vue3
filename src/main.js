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

    console.log(111111)

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
    })

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
  app.config.performance = true
}

setupApp()
