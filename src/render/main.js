import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import '@/styles/index.scss' // 全局样式
import '@/plugins/iconify' // Iconify 离线图标
import { setupIcon } from './plugins'
import { setupDirectives } from '@/directives' // 全局自定义指令（v-permission / v-role）
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
import { useNotificationStore } from '@/store/modules/notification'
// import SvgIcon from '@/components/SvgIcon/index.vue'
async function setupApp() {
  const app = createApp(App)
  setupIcon(app)
  setupDirectives(app)
  app.use(store)
  app.use(router)

  // ─── 全局错误处理 ──────────────────────────────────────────
  app.config.errorHandler = (err, _instance, info) => {
    console.error('[Vue Error]', err, info)
    try {
      ElMessage.error(`应用发生错误：${err?.message || '未知错误'}`)
    } catch (e) {
      // ElMessage 尚未就绪，仅控制台记录
    }
  }

  // 捕获未处理的 Promise 拒绝
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

  // persist插件在useAppStore()首次调用时同步从localStorage 恢复状态
  // 在mount前调用initTheme确保首次渲染时data-theme已正确设置
  const appStore = useAppStore()
  const notifStore = useNotificationStore()
  appStore.initTheme()
  // 桌面设置（关闭行为/开机自启）不阻塞首屏挂载，后台异步加载
  appStore.initDesktopSettings()

  app.mount('#app').$nextTick(() => {
    const updateStore = useUpdateStore()

    // 获取当前版本号
    ipcRenderer.invoke('get-app-version').then((version) => {
      console.log('当前应用版本号:', version)
      updateStore.setCurrentVersion(version)
    })

    // 监听主进程发送的通知 → 推入通知中心
    ipcRenderer.on('show-notification', (event, options) => {
      notifStore.push({
        title: options.title || '通知',
        body: options.body || '',
        type: options.type || 'info'
      })
    })

    // 开发模式：模拟完整更新流程（弹框 → 进度条 → 完成）
    if (import.meta.env.DEV) {
      setTimeout(() => {
        updateStore.setCurrentVersion(updateStore.currentVersion || '1.0.3')
        updateStore.setLatestVersion('0.1.0')
        window.dispatchEvent(
          new CustomEvent('update:available', {
            detail: {
              version: '0.1.0'
            }
          })
        )
      }, 1500)

      // 模拟几条通知
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
    }
  })
  app.config.performance = false
}

setupApp()
