<template>
  <div class="global-content">
    <div
      class="global-content-inner"
      :class="{ 'is-fixed-width': appStore.contentWidth === 'fixed' }"
      :style="contentStyle"
    >
      <router-view v-if="isRefresh" v-slot="{ Component, route }">
        <!-- Transition 必须包裹在 KeepAlive 外层：KeepAlive 不会展开 Transition，
             若将 Transition 放在内部，KeepAlive 的直接子组件会变成 Transition 本身，
             其组件名无法命中 include 列表，导致缓存静默失效 -->
        <transition :name="transitionName" mode="out-in">
          <keep-alive :include="cachedViews" :max="10">
            <component :is="Component" :key="route.name ?? route.path" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </div>
  <BackTop />
</template>

<script setup>
import { animates } from '@/settings/animateSetting'
import { useAppStore } from '@/store/modules/app'
import { useTagsViewStore } from '@/store/modules/tagsView'
import BackTop from '@/components/BackTop/index.vue'

const route = useRoute()
const appStore = useAppStore()
const tagsViewStore = useTagsViewStore()

// keep-alive 缓存列表：由 tagsView store 驱动，仅缓存已打开标签页对应的组件
const cachedViews = computed(() => tagsViewStore.cachedViews)
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

// 全局刷新：监听到 appStore.refresh 翻转后，先卸载 RouterView，
// nextTick 后重新挂载，使当前路由组件（含 keep-alive 缓存）彻底重建，
// 同时保留布局框架（侧边栏 / 顶栏 / 标签页）
const isRefresh = ref(true)

watch(
  () => appStore.refresh,
  () => {
    isRefresh.value = false
    nextTick(() => {
      isRefresh.value = true
    })
  },
  { flush: 'post' }
)
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
  display: flex;
  flex: 1;
  flex-direction: column;
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
  // flex 列布局：内容较少时铺满可视高度，内容超出时随内容增高；
  // 页面根节点作为 flex 子项，占位页可用 flex: 1 撑满并垂直居中
  display: flex;
  flex: 1;
  flex-direction: column;
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
