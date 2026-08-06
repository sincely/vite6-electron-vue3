<template>
  <div class="global-content">
    <div
      class="global-content-inner"
      :class="{ 'is-fixed-width': appStore.contentWidth === 'fixed' }"
      :style="contentStyle"
    >
      <router-view v-slot="{ Component, route }">
        <!-- keepAlive 页面：keep-alive 在外层，transition 在内层 -->
        <keep-alive v-if="route.meta?.keepAlive" :max="10">
          <transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.name ?? route.path" />
          </transition>
        </keep-alive>
        <!-- 非 keepAlive 页面 -->
        <transition v-else :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>
  </div>
  <BackTop />
</template>

<script setup>
import { animates } from '@/settings/animateSetting'
import { useAppStore } from '@/store/modules/app'
import BackTop from '@/components/BackTop/index.vue'

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

const contentStyle = computed(() => {
  if (appStore.contentWidth === 'fixed') {
    return {
      '--content-fixed-width': `${appStore.contentWidthValue}px`
    }
  }
  return {}
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

.global-content-inner {
  min-height: 100%;
  transition:
    max-width 0.3s ease,
    padding 0.3s ease,
    background-color 0.3s ease;

  &.is-fixed-width {
    max-width: var(--content-fixed-width, 1200px);
    padding: 16px 24px;
    margin-right: auto;
    margin-left: auto;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
}
</style>
