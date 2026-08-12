<template>
  <div
    class="layout-container"
    :class="[
      `layout-mode-${appStore.layoutMode}`,
      { 'is-fullscreen': isFullscreen }
    ]"
  >
    <!-- 侧边栏 (left / left-mixed) -->
    <div v-show="!isTopMenu && !isFullscreen" class="layout-sidebar">
      <GlobalSiderMenu />
    </div>

    <!-- 子菜单栏 (left-mixed 模式，位于侧边栏右侧) -->
    <div
      v-if="isLeftMixed && appStore.mixedSubmenuVisible && !isFullscreen"
      class="layout-submenu"
    >
      <MixedSubmenu :parent-item="activeParentItem" />
    </div>

    <!-- 右侧主区域 -->
    <div class="layout-main">
      <!-- 标题栏 / 窗口控制 -->
      <GlobalHeader v-show="!isFullscreen">
        <template #right>
          <GlobalSearch />
        </template>
      </GlobalHeader>

      <!-- 内容主体区域（可能包含子菜单栏） -->
      <div class="layout-body">
        <!-- 子菜单栏 (top-mixed 模式，位于内容区左侧) -->
        <div
          v-if="isTopMixed && appStore.mixedSubmenuVisible && !isFullscreen"
          class="layout-submenu"
        >
          <MixedSubmenu :parent-item="activeParentItem" />
        </div>

        <!-- 内容列 -->
        <div class="layout-body-content">
          <!-- 多标签导航（全屏时仍保留，供导航和还原） -->
          <GlobalTagsView v-if="appStore.tagsView" />

          <!-- 页面内容（路由视图 + 过渡 + 加载） -->
          <GlobalContent v-if="isRouterAlive" />

          <!-- 底部状态栏 -->
          <GlobalFooter v-if="appStore.footerVisible" />
        </div>
      </div>
    </div>
  </div>
  <!-- 更新弹框 -->
  <UpdateDialog />
</template>

<script setup>
import GlobalSiderMenu from './components/global-siderMenu/index.vue'
import GlobalHeader from './components/global-header/index.vue'
import GlobalSearch from './components/global-search/index.vue'
import GlobalContent from './components/global-content/index.vue'
import GlobalFooter from './components/global-footer/index.vue'
import GlobalTagsView from './components/global-tagsView/index.vue'
import MixedSubmenu from './components/global-siderMenu/modules/MixedSubmenu.vue'
import { useAppStore } from '@/store/modules/app'
import { findTopLevelParent } from '@/config/menu'
import { computed, ref, nextTick, provide, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const appStore = useAppStore()
const route = useRoute()

const isTopMenu = computed(
  () => appStore.layoutMode === 'top' || appStore.layoutMode === 'top-mixed'
)
const isLeftMixed = computed(() => appStore.layoutMode === 'left-mixed')
const isTopMixed = computed(() => appStore.layoutMode === 'top-mixed')

// 根据当前路由计算激活的一级菜单项
const activeParentItem = computed(() => findTopLevelParent(route.path))

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

// 向后代组件暴露刷新方法和全屏切换
provide('reload', reload)
provide('toggleFullscreen', handleFullscreenChange)
provide('isFullscreen', isFullscreen)
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

  .layout-submenu {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
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
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: var(--color-text-primary);
      }
    }
  }

  .layout-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .layout-body-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    overflow: hidden;
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
