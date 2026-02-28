import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import '@/styles/index.scss' // 全局样式
import { setupIcon } from './plugins' // 全局注册antd图标
import { useAppStore } from '@/store/modules/app'
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

    // 监听主进程发送的通知
    window.ipcRenderer.on('show-notification', (event, options) => {
      ElNotification({
        title: options.title,
        message: options.body,
        duration: 3000
      })
    })
  })
  app.config.performance = true
}

setupApp()
