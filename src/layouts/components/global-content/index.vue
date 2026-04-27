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
import { animates } from '@/settings/animateSetting'
import { useAppStore } from '@/store/modules/app'

const route = useRoute()
const appStore = useAppStore()
const animateValueSet = new Set(animates.map((item) => item.value))

const transitionName = computed(() => {
  if (!appStore.transitionEnabled) return ''

  // 仅使用全局动画设置；历史无效值回退到默认动画
  if (animateValueSet.has(appStore.transitionType)) {
    return appStore.transitionType
  }

  return 'page'
})
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
  padding: 14px;
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
</style>
