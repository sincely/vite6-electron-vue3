<template>
  <div class="app-box">
    <div class="app-container" :class="{ 'is-login': isLoginPage }">
      <router-view />
    </div>
    <UpdateProgress />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UpdateProgress from '@/components/UpdateProgress.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<style lang="scss" scoped>
.app-box {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg-window);
}

.app-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;

  &.is-login {
    height: 100vh;
  }
}
</style>
