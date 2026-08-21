<template>
  <el-config-provider :locale="zhCn">
    <div class="app-box" :class="{ 'is-login': isLoginPage }">
      <router-view v-if="isLoginPage" />
      <div v-else class="app-container">
        <router-view />
      </div>
      <setting-dialog />
      <feedback-dialog />
      <lock-screen />
    </div>
  </el-config-provider>
</template>

<script setup>
import { useUpdater } from '@/core/update'
import { useNetwork } from '@/hooks/useNetwork'
import { useDeepLink } from '@/hooks/useDeepLink'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')

// 移除 index.html 中的预挂载启动层：frame:false 的窗口（登录/通用）
// 在 Vue 接管渲染前由它提供唯一可拖拽区域，避免白屏期无法拖拽窗口。
onMounted(() => {
  if (window.__appSplashFailsafe) {
    clearTimeout(window.__appSplashFailsafe)
    window.__appSplashFailsafe = null
  }

  const removeSplash = () => {
    const splash = document.getElementById('app-splash')
    if (splash && splash.parentNode) splash.parentNode.removeChild(splash)
  }

  // 生产环境冷启动未登录时，本地资源加载过快会使首屏启动动画一闪而过。
  // 主窗口（#desktop）由 preload 的 stairway loading 接管首屏，须立即移除 #app-splash，
  // 否则动画残留会遮挡桌面；其余窗口（登录等）保底展示 2s 再移除。
  // 基准取窗口首次可见时刻（splashFailsafe 记录），缺失时回退到导航起始，
  // 两种情况都能保证动画至少展示约 2s。
  const MIN_SPLASH_HOLD = 2000
  const isMainWindow = /desktop/.test(location.hash)
  if (isMainWindow) {
    removeSplash()
  } else {
    const anchor = window.__appSplashVisibleAt ?? 0
    const remaining = MIN_SPLASH_HOLD - (performance.now() - anchor)
    if (remaining > 0) setTimeout(removeSplash, remaining)
    else removeSplash()
  }

  // 挂载更新IPC监听
  useUpdater()
  // 挂载网络状态监听
  useNetwork()
  // 挂载浏览器唤起应用（lightning://）深链监听
  useDeepLink()
})
</script>

<style lang="scss" scoped>
.app-box {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg-window);
  isolation: isolate;
}

.app-container {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  &.is-login {
    height: 100vh;
  }
}
</style>
