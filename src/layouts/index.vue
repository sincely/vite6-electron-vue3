<template>
  <div class="layout">
    <sidebar class="layout__sidebar" />
    <main class="layout__content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import sidebar from './components/sideBar.vue'
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-bg-content);
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;

  &__sidebar {
    // 宽度由 sidebar 组件自身管理
  }

  &__content {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow-y: auto;
    background-color: var(--color-bg-content);
  }
}
</style>
