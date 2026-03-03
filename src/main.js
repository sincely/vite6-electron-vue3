import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import '@/styles/index.scss' // 全局样式
import '@/config/nprogress' // 全局样式
import { setupIcon } from './plugins'
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/update'
import { useNotificationStore } from '@/store/modules/notification'

async function setupApp() {
  const app = createApp(App)
  setupIcon(app)
  app.use(store)
  app.use(router)

  // persist 插件在 useAppStore() 首次调用时同步从 localStorage 恢复状态
  // 在 mount 前调用 initTheme 确保首次渲染时 data-theme 已正确设置
  useAppStore().initTheme()

  app.mount('#app').$nextTick(() => {
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
        notifStore.push({ title: '服务器发生错误', body: '代理服务器响应超时，请检查网络配置。', type: 'error' })
        notifStore.push({ title: '网络发生波动', body: '代理服务器响应超时，请检查网络配置。', type: 'exception' })
        notifStore.push({ title: '连接警告', body: '代理服务器响应超时，请检查网络配置。', type: 'success' })
        notifStore.push({ title: '公告申明', body: '代理服务器响应超时，请检查网络配置。', type: 'celebrate' })
        notifStore.push({ title: '连接警告', body: '代理服务器响应超时，请检查网络配置。', type: 'warning' })
      }, 1500)
    }
  })
  app.config.performance = false
}

setupApp()
