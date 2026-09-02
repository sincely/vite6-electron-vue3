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

  // persist插件在useAppStore()首次调用时同步从localStorage恢复状态
  // 在mount前调用initTheme确保首次渲染时data-theme已正确设置
  const appStore = useAppStore()
  const notifStore = useNotificationStore()
  appStore.initTheme()

  app.mount('#app').$nextTick(() => {
    const updateStore = useUpdateStore()

    // Web 端无主进程可询版本号；开发环境注入示例版本与欢迎通知
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
