<template>
  <div id="app">
    <div class="app-view" :class="{ 'is-login': isLoginPage }">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<style lang="scss" scoped>
#app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg-window);
}

.app-view {
  flex: 1;
  min-height: 0;
  overflow: hidden;

  &.is-login {
    height: 100vh;
  }
}
</style>
