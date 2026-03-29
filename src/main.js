import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import '@/styles/index.scss' // 全局样式
import 'virtual:svg-icons-register'
import { setupIcon } from './plugins'
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
import { useNotificationStore } from '@/store/modules/notification'
// import SvgIcon from '@/components/SvgIcon/index.vue'
async function setupApp() {
  const app = createApp(App)
  setupIcon(app)
  app.use(store)
  app.use(router)

  // persist 插件在 useAppStore() 首次调用时同步从 localStorage 恢复状态
  // 在 mount 前调用 initTheme 确保首次渲染时 data-theme 已正确设置
  const appStore = useAppStore()
  appStore.initTheme()
  await appStore.initDesktopSettings()

  app.mount('#app').$nextTick(() => {
    const updateStore = useUpdateStore()
    const notifStore = useNotificationStore()

    // 获取当前版本号
    ipcRenderer.invoke('get-app-version').then((version) => {
      console.log('当前应用版本号:', version)
      updateStore.setCurrentVersion(version)
    })

    // 监听主进程发送的通知 → 推入通知中心
    ipcRenderer.on('show-notification', (event, options) => {
      console.log('直接提示登录成功，模拟通知:', options)
      // notifStore.push({ title: options.title, body: options.body, type: options.type ?? 'info' })
      // 直接提示登录成功，模拟通知
      // ElNotification({
      //   title: '通知',
      //   message: '欢迎回来',
      //   icon: h(SvgIcon, {
      //     iconClass: 'celebrate',
      //     width: '25px',
      //     height: '25px'
      //   }),
      //   showClose: false,
      //   position: 'top-right',
      //   duration: 2500
      // })
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
        notifStore.push({
          title: '欢迎使用',
          body: '应用已成功启动，祝您使用愉快！',
          type: 'success'
        })
        notifStore.push({
          title: '系统提示',
          body: '检测到新版本 v0.1.0 可用，建议尽快更新。',
          type: 'info'
        })
        notifStore.push({
          title: '服务器发生错误',
          body: '代理服务器响应超时，请检查网络配置。',
          type: 'error'
        })
        notifStore.push({
          title: '网络发生波动',
          body: '代理服务器响应超时，请检查网络配置。',
          type: 'exception'
        })
        notifStore.push({
          title: '连接警告',
          body: '代理服务器响应超时，请检查网络配置。',
          type: 'success'
        })
        notifStore.push({
          title: '公告申明',
          body: '代理服务器响应超时，请检查网络配置。',
          type: 'celebrate'
        })
        notifStore.push({
          title: '连接警告',
          body: '代理服务器响应超时，请检查网络配置。',
          type: 'warning'
        })
      }, 1500)
    }
  })
  app.config.performance = false
}

setupApp()
