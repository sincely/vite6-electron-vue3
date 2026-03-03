<template>
  <div class="app-box" :class="{ 'is-login': isLoginPage }">
    <div class="app-container" :class="{ 'is-login': isLoginPage }">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUpdater } from '@/hooks/useUpdater'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')

// 挂载更新 IPC 监听（全局唯一，随 App 组件生命周期自动清理）
useUpdater()
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
