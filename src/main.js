import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import '@/styles/index.scss' // 全局样式
import { setupIcon } from './plugins'
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
// import SvgIcon from '@/components/SvgIcon/index.vue'
async function setupApp() {
  const app = createApp(App)
  setupIcon(app)
  app.use(store)
  app.use(router)

  // persist插件在useAppStore()首次调用时同步从localStorage 恢复状态
  // 在mount前调用initTheme确保首次渲染时data-theme已正确设置
  const appStore = useAppStore()
  appStore.initTheme()
  await appStore.initDesktopSettings()

  app.mount('#app').$nextTick(() => {
    const updateStore = useUpdateStore()

    // 获取当前版本号
    ipcRenderer.invoke('get-app-version').then((version) => {
      console.log('当前应用版本号:', version)
      updateStore.setCurrentVersion(version)
    })

    // 监听主进程发送的通知 → 推入通知中心
    ipcRenderer.on('show-notification', (event, options) => {
      console.log('直接提示登录成功，模拟通知:', options)
    })

    // 开发模式：模拟完整更新流程（弹框 → 进度条 → 完成）
    if (import.meta.env.DEV) {
      setTimeout(() => {
        updateStore.setCurrentVersion(updateStore.currentVersion || '0.0.3')
        updateStore.setLatestVersion('0.1.0')
        window.dispatchEvent(
          new CustomEvent('update:available', {
            detail: {
              version: '0.1.0'
            }
          })
        )
      }, 1500)
    }
  })
  app.config.performance = false
}

setupApp()
