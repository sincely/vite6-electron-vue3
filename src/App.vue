<template>
  <div id="app">
    <bar v-if="!isLoginPage" />
    <div class="app__view" :class="{ 'is-login': isLoginPage }">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import bar from './components/Bar/index.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<style lang="scss">
#app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg-window);
}

.app__view {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.app__view.is-login {
  height: 100vh;
}
</style>
