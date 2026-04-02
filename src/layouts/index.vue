<template>
  <div
    class="layout-container"
    :class="[
      `layout-mode-${appStore.layoutMode}`,
      { 'is-fullscreen': isFullscreen }
    ]"
  >
    <!-- 侧边栏 -->
    <div v-show="!isTopMenu && !isFullscreen" class="layout-sidebar">
      <GlobalSiderMenu />
    </div>

    <!-- 右侧主区域 -->
    <div class="layout-main">
      <!-- 标题栏 / 窗口控制 -->
      <GlobalHeader v-show="!isFullscreen">
        <template #center>
          <GlobalSearch v-if="!isTopMenu" />
        </template>
      </GlobalHeader>

      <!-- 面包屑导航（含搜索插槽） -->
      <GlobalBreadcrumb>
        <template #extra>
          <SvgIcon
            icon-class="refresh"
            width="18px"
            height="18px"
            class="icon-btn"
            @click="reload"
          />

          <SvgIcon
            class="icon-btn"
            :icon-class="isFullscreen ? 'exitscreen' : 'fullscreen'"
            width="18px"
            height="18px"
            @click="handleFullscreenChange"
          />
        </template>
      </GlobalBreadcrumb>

      <!-- 页面内容（路由视图 + 过渡 + 加载） -->
      <GlobalContent v-if="isRouterAlive" />

      <!-- 底部状态栏 -->
      <GlobalFooter />
    </div>
  </div>
  <!-- 更新弹框 -->
  <UpdateDialog />
</template>

<script setup>
import GlobalSiderMenu from './components/global-siderMenu/index.vue'
import GlobalHeader from './components/global-header/index.vue'
import GlobalBreadcrumb from './components/global-breadcrumb/index.vue'
import GlobalSearch from './components/global-search/index.vue'
import GlobalContent from './components/global-content/index.vue'
import GlobalFooter from './components/global-footer/index.vue'
import { useAppStore } from '@/store/modules/app'
import { computed, ref, nextTick, provide, onMounted, onUnmounted } from 'vue'

const appStore = useAppStore()
const isTopMenu = computed(
  () => appStore.layoutMode === 'top' || appStore.layoutMode === 'top-mixed'
)

// 全屏状态管理
const isFullscreen = ref(false)

// 监听全屏状态变化（如用户按下 ESC 键退出全屏）
const handleFullscreenChange = () => {
  isFullscreen.value = !isFullscreen.value
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

// 页面刷新逻辑：通过 v-if 销毁并重建组件
const isRouterAlive = ref(true)
const reload = () => {
  isRouterAlive.value = false
  nextTick(() => {
    isRouterAlive.value = true
  })
}

// 向后代组件暴露刷新方法（可选，若子页面也需要触发刷新）
provide('reload', reload)
</script>

<style lang="scss" scoped>
.layout-container {
  position: relative;
  display: flex;
  gap: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  background: transparent;

  .layout-sidebar {
    position: relative;
    z-index: 3;
  }

  .layout-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    background: var(--color-bg-content, var(--glass-surface));

    .icon-btn {
      margin-right: 8px;
      cursor: pointer;
    }
  }

  .fullscreen-exit-float {
    position: fixed;
    top: 32px;
    right: 32px;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: var(--glass-surface);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-surface-border);
    border-radius: 50%;
    box-shadow: var(--shadow-lg);
    opacity: 0.3;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      color: var(--color-text-primary);
      background: color-mix(
        in srgb,
        var(--glass-surface),
        var(--color-bg-hover) 10%
      );
      opacity: 1;
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
