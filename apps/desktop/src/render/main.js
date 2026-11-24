import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import { setupPermissionWatcher } from '@/router/permissionWatcher' // 权限变更监听（失权页面踢出）
// ElMessageBox 基础样式兜底：confirm 等命令式组件只能 JS 引入，而手动
// `import { ElMessageBox } from 'element-plus'` 只带 JS 不带样式（unplugin
// 的样式注入仅对未手动导入的标识符生效），各页面手动导入导致基础样式缺失。
// 此处全局引入其样式链（含 button/input/overlay/base），自定义外观见
// styles/message-box.scss（在后面的 index.scss 中加载，覆盖基础样式）。
// import 'element-plus/es/components/message-box/style/index'
import '@/styles/index.scss' // 全局样式
import '@/plugins/iconify' // Iconify 离线图标
import { setupIcon } from './plugins'
import { setupDirectives } from '@/directives' // 全局自定义指令（v-permission / v-role）
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
import { useUserStore } from '@/store/modules/user'
import { initNotificationListener } from '@/utils/notification'
async function setupApp() {
  const app = createApp(App)
  setupIcon(app)
  setupDirectives(app)
  app.use(store)
  app.use(router)
  // 监听 roles/permissions 刷新：beforeEach 只拦新导航，
  // 这里负责把"已停留但已失权"的页面退回工作台（需在 pinia 安装后调用）
  setupPermissionWatcher(router)

  // persist插件在useAppStore()首次调用时同步从localStorage 恢复状态
  // 在mount前调用initTheme确保首次渲染时data-theme已正确设置
  const appStore = useAppStore()
  appStore.initTheme()

  // 接收主进程推送的应用内通知（主进程 createNotification → 'show-notification' 频道）
  initNotificationListener()

  // 从主进程拉取 token（auth 状态的唯一权威在主进程持有的 auth.json）。
  // 必须 await 后再 app.mount()，否则路由守卫会拿到空 token 误判未登录、跳转 /login，
  // 而主进程早已根据 token 创建了主窗口 —— 此时路由再跳 /login 会引发不必要的重定向。
  const userStore = useUserStore()
  if (userStore.token && window.ipcRenderer) {
    window.ipcRenderer.send('toMain')
  }

  app.mount('#app').$nextTick(() => {
    // 桌面设置（关闭行为/开机自启）在首屏挂载完成后异步加载，避免 IPC 往返阻塞 mount
    appStore.initDesktopSettings()

    const updateStore = useUpdateStore()

    // 获取当前版本号
    window.ipcRenderer.invoke('get-app-version').then((version) => {
      console.log('当前应用版本号:', version)
      updateStore.setCurrentVersion(version)
    })
  })
  app.config.performance = false
}

setupApp()
