<template>
  <div class="layout">
    <sidebar class="layout__sidebar" />
    <div class="layout__content">
      <nav-bar />
      <div class="layout__view">
        <router-view v-slot="{ Component, route }">
          <transition :name="transitionName" mode="out-in">
            <keep-alive :max="10">
              <component :is="Component" v-if="route.meta?.keepAlive" :key="route.name ?? route.path" />
            </keep-alive>
          </transition>
          <transition :name="transitionName" mode="out-in">
            <component :is="Component" v-if="!route.meta?.keepAlive" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import sidebar from './components/sideBar.vue'
import NavBar from './components/navBar.vue'

// 读取当前路由的过渡动画名，未配置时默认 'page'
const route = useRoute()
const transitionName = computed(() => route.meta?.transition ?? 'page')
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

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    background-color: var(--color-bg-content);
  }

  &__view {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
