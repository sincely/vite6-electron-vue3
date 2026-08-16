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
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')

// 挂载更新IPC监听
useUpdater()
// 挂载网络状态监听
useNetwork()
// 挂载浏览器唤起应用（lightning://）深链监听
useDeepLink()
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
