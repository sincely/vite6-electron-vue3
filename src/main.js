import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import router from '@/router' // 路由
import '@/styles/index.scss' // 全局样式
import { setupIcon } from './plugins' // 全局注册antd图标
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { useAppStore } from '@/store/modules/app'

async function setupApp() {
  const app = createApp(App)
  setupIcon(app)
  app.use(store)
  app.use(router)
  app.use(ElementPlus)
  app.config.globalProperties.$message = ElMessage
  app.mount('#app').$nextTick(() => {
    // 初始化主题
    const appStore = useAppStore()
    appStore.initTheme()
    postMessage({ payload: 'removeLoading' }, '*')
  })
  app.config.performance = true
}

setupApp()
