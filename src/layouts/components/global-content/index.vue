<template>
  <div class="global-content">
    <router-view v-slot="{ Component, route }">
      <!-- 需要缓存的页面 -->
      <transition :name="transitionName" mode="out-in">
        <keep-alive :max="10">
          <component :is="Component" v-if="route.meta?.keepAlive" :key="route.name ?? route.path" />
        </keep-alive>
      </transition>
      <!-- 不需要缓存的页面 -->
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" v-if="!route.meta?.keepAlive" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
const route = useRoute()
const transitionName = computed(() => route.meta?.transition ?? 'page')
const isLoading = ref(false)

watch(
  () => route.path,
  () => {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
)
</script>

<style lang="scss" scoped>
.global-content {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 18px 20px 20px;
  overflow-y: auto;
  animation: fade-up 0.42s cubic-bezier(0.2, 0.7, 0.2, 1) both;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
    border-radius: 4px;
  }
}

@media (width <= 960px) {
  .global-content {
    padding: 14px;
  }
}
</style>
