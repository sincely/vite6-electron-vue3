<template>
  <div class="global-content">
    <router-view v-slot="{ Component, route }">
      <transition :name="transitionName" mode="out-in">
        <!-- keepAlive 页面 -->
        <keep-alive v-if="route.meta?.keepAlive" :max="10">
          <component :is="Component" :key="route.name ?? route.path" />
        </keep-alive>
        <!-- 非 keepAlive 页面 -->
        <component :is="Component" v-else :key="route.path" />
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
