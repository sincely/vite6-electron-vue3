<template>
  <div id="app">
    <bar />
    <div class="app__view">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import bar from './components/Bar/index.vue'
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
</style>
