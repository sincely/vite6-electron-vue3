import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router'
import '@/styles/index.scss'
import '@/plugins/iconify'
import { setupIcon } from './plugins'
import { setupDirectives } from '@/directives'
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
import { useNotificationStore } from '@/store/modules/notification'

async function setupApp() {
  const app = createApp(App)
  setupIcon(app)
  setupDirectives(app)
  app.use(store)
  app.use(router)

  app.config.errorHandler = (err, _instance, info) => {
    console.error('[Vue Error]', err, info)
    try {
      ElMessage.error(`应用发生错误：${err?.message || '未知错误'}`)
    } catch (e) {
      // ElMessage 尚未就绪，仅控制台记录
    }
  }

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason)
    try {
      ElMessage.error(
        `异步错误：${event.reason?.message || event.reason || '未知错误'}`
      )
    } catch (e) {
      // ElMessage 尚未就绪，仅控制台记录
    }
  })

  const appStore = useAppStore()
  const notifStore = useNotificationStore()
  appStore.initTheme()

  app.mount('#app').$nextTick(() => {
    const updateStore = useUpdateStore()

    if (import.meta.env.DEV) {
      updateStore.setCurrentVersion(updateStore.currentVersion || '1.0.0')
      updateStore.setLatestVersion('0.1.0')

      notifStore.push({
        title: '欢迎使用',
        body: 'Web Admin 已成功启动',
        type: 'success'
      })
      notifStore.push({
        title: '系统提示',
        body: '这是浏览器端后台管理系统示例',
        type: 'info'
      })
    }
  })
  app.config.performance = false
}

setupApp()
