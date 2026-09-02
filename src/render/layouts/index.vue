<template>
  <div
    class="layout-container"
    :class="[
      `layout-mode-${appStore.layoutMode}`,
      { 'is-fullscreen': isFullscreen }
    ]"
  >
    <!-- 侧边栏 (left) -->
    <Transition name="layout-fade-x">
      <div
        v-if="!isTopMenu && !isDual"
        class="layout-sidebar"
        :class="{
          'is-fullscreen-hidden': isFullscreen,
          'is-sidebar-collapsed': appStore.sidebarCollapsed
        }"
        :aria-hidden="isFullscreen"
        :inert="isFullscreen"
      >
        <GlobalSiderMenu />
      </div>
    </Transition>

    <!-- 双列菜单 (dual 模式：一级菜单窄栏 + 子菜单列) -->
    <Transition name="layout-fade-x">
      <div
        v-if="isDual"
        class="layout-dual-menu"
        :class="{
          'is-fullscreen-hidden': isFullscreen,
          'is-dual-menu-show-text': appStore.dualMenuShowText
        }"
        :aria-hidden="isFullscreen"
        :inert="isFullscreen"
      >
        <DualMenu />
      </div>
    </Transition>

    <!-- 右侧主区域 -->
    <div class="layout-main">
      <!-- 标题栏 / 窗口控制 -->
      <div
        class="layout-header"
        :class="{ 'is-fullscreen-hidden': isFullscreen }"
        :aria-hidden="isFullscreen"
        :inert="isFullscreen"
      >
        <GlobalHeader>
          <!-- 面包屑（参照 art-design-pro）：仅侧边/双列菜单布局显示，顶部菜单模式不显示 -->
          <template v-if="!isTopMenu && appStore.breadCrumb" #center>
            <GlobalBreadcrumb />
          </template>
          <template #right>
            <GlobalSearch />
          </template>
        </GlobalHeader>
      </div>

      <!-- 内容主体区域（可能��含子菜单栏） -->
      <div class="layout-body">
        <!-- 子菜单栏 (top-mixed 模式，位于内容区左侧，固定显示) -->
        <Transition name="layout-fade-x">
          <div
            v-if="isTopMixed"
            class="layout-submenu"
            :class="{ 'is-fullscreen-hidden': isFullscreen }"
            :aria-hidden="isFullscreen"
            :inert="isFullscreen"
          >
            <MixedSubmenu :parent-item="activeParentItem" collapsible />
          </div>
        </Transition>

        <!-- 内容列 -->
        <div class="layout-body-content">
          <!-- 多标签导航（内容全屏时隐藏，腾出完整可视空间） -->
          <Transition name="layout-fade-y">
            <div
              v-if="appStore.tagsView"
              class="layout-tags"
              :class="{
                'is-fullscreen-hidden': isFullscreen,
                'is-tags-google': appStore.tagsViewStyle === 'google'
              }"
              :aria-hidden="isFullscreen"
              :inert="isFullscreen"
            >
              <GlobalTagsView />
            </div>
          </Transition>

          <!-- 页面内容（路由视图 + 过渡 + 加载） -->
          <GlobalContent />

          <!-- 底部状态栏 -->
          <GlobalFooter v-if="appStore.footerVisible" />
        </div>
      </div>
    </div>

    <!-- 内容全屏提示：进入时短暂告知 ESC 退出方式，随后自动消失 -->
    <Transition name="fullscreen-hint">
      <div v-if="showFullscreenHint" class="fullscreen-exit-hint">
        <Icon icon="lucide:minimize" width="15" height="15" />
        <span>已进入全屏，按</span>
        <kbd>ESC</kbd>
        <span>退出</span>
      </div>
    </Transition>
  </div>
  <!-- 更新弹框 -->
  <UpdateDialog />
  <!-- 聊天窗口（Lightning Bot） -->
  <ChatBot />
  <!-- 问题反馈（吸附内容区右侧；显示由组件内部开关 PROBLEM_FEEDBACK_ENABLED 控制） -->
  <ProblemFeedback />
  <!-- 全局水印 -->
  <Watermark />
  <!-- 礼花/烟花特效（全局注册，触发时机由 config/festival.js 控制） -->
  <FireworksEffect />
</template>

<script setup>
import GlobalSiderMenu from './components/global-siderMenu/index.vue'
import GlobalHeader from './components/global-header/index.vue'
import GlobalSearch from './components/global-search/index.vue'
import GlobalContent from './components/global-content/index.vue'
import GlobalFooter from './components/global-footer/index.vue'
import GlobalTagsView from './components/global-tagsView/index.vue'
import GlobalBreadcrumb from './components/global-breadcrumb/index.vue'
import MixedSubmenu from './components/global-siderMenu/modules/MixedSubmenu.vue'
import DualMenu from './components/global-dualMenu/index.vue'
import ProblemFeedback from '@/components/ProblemFeedback/index.vue'
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/store/modules/app'
import { findTopLevelParent } from '@/config/menu'
import { useRoute } from 'vue-router'

const appStore = useAppStore()
const route = useRoute()

const isTopMenu = computed(
  () => appStore.layoutMode === 'top' || appStore.layoutMode === 'top-mixed'
)
const isTopMixed = computed(() => appStore.layoutMode === 'top-mixed')
const isDual = computed(() => appStore.layoutMode === 'dual')

// 根据当前路由计算激活的一级菜单项
const activeParentItem = computed(() => findTopLevelParent(route.path))

// 内容全屏状态管理（布局内最大化，非浏览器 Fullscreen API）
const isFullscreen = ref(false)

// 进入全屏时短暂提示退出方式（ESC），约 2.6s 后自动消失
const showFullscreenHint = ref(false)
let hintTimer = null

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  clearTimeout(hintTimer)
  if (isFullscreen.value) {
    showFullscreenHint.value = true
    hintTimer = setTimeout(() => {
      showFullscreenHint.value = false
    }, 2600)
  } else {
    showFullscreenHint.value = false
  }
}

// ESC 快捷键退出内容全屏
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearTimeout(hintTimer)
})

// 向后代组件暴露全屏切换（页面刷新已改为 store 驱动，见 app store 的 reloadPage）
provide('toggleFullscreen', toggleFullscreen)
provide('isFullscreen', isFullscreen)
</script>

<style lang="scss" scoped>
.layout-container {
  $layout-transition: 0.36s cubic-bezier(0.22, 0.7, 0.2, 1);

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
    flex: 0 0 var(--layout-sidebar-width, var(--sidebar-width));
    width: var(--layout-sidebar-width, var(--sidebar-width));
    min-width: 0;
    overflow: hidden;
    opacity: 1;
    transition:
      flex-basis $layout-transition,
      width $layout-transition,
      opacity 0.24s ease,
      transform $layout-transition;
    transform: translateX(0);
    will-change: width, flex-basis, opacity, transform;

    &.is-sidebar-collapsed {
      --layout-sidebar-width: var(--sidebar-collapsed-width);
    }

    &.is-fullscreen-hidden {
      flex-basis: 0;
      width: 0;
      pointer-events: none;
      opacity: 0;
      transform: translateX(-12px);
    }
  }

  .layout-dual-menu {
    position: relative;
    z-index: 3;
    flex: 0 0 244px;
    width: 244px;
    min-width: 0;
    overflow: hidden;
    opacity: 1;
    transition:
      flex-basis $layout-transition,
      width $layout-transition,
      opacity 0.24s ease,
      transform $layout-transition;
    transform: translateX(0);
    will-change: width, flex-basis, opacity, transform;

    &.is-dual-menu-show-text {
      flex-basis: 260px;
      width: 260px;
    }

    &.is-fullscreen-hidden {
      flex-basis: 0;
      width: 0;
      pointer-events: none;
      opacity: 0;
      transform: translateX(-12px);
    }
  }

  .layout-submenu {
    position: relative;
    z-index: 2;
    flex: 0 0 auto;
    min-width: 0;
    max-width: 180px;
    overflow: hidden;
    opacity: 1;
    transition:
      max-width $layout-transition,
      opacity 0.24s ease,
      transform $layout-transition;
    transform: translateX(0);
    will-change: max-width, opacity, transform;

    &.is-fullscreen-hidden {
      max-width: 0;
      pointer-events: none;
      opacity: 0;
      transform: translateX(-12px);
    }
  }

  .layout-header {
    position: relative;
    z-index: 10;
    flex: 0 0 var(--titlebar-height);
    height: var(--titlebar-height);
    min-height: 0;
    overflow: visible;
    opacity: 1;
    transition:
      flex-basis $layout-transition,
      height $layout-transition,
      opacity 0.24s ease,
      transform $layout-transition;
    transform: translateY(0);
    will-change: height, flex-basis, opacity, transform;

    &.is-fullscreen-hidden {
      flex-basis: 0;
      height: 0;
      pointer-events: none;
      opacity: 0;
      transform: translateY(-8px);
    }
  }

  .layout-tags {
    --layout-tags-height: 38px;

    flex: 0 0 var(--layout-tags-height);
    height: var(--layout-tags-height);
    min-height: 0;
    overflow: hidden;
    opacity: 1;
    transition:
      flex-basis $layout-transition,
      height $layout-transition,
      opacity 0.24s ease,
      transform $layout-transition;
    transform: translateY(0);
    will-change: height, flex-basis, opacity, transform;

    &.is-tags-google {
      --layout-tags-height: 40px;
    }

    &.is-fullscreen-hidden {
      flex-basis: 0;
      height: 0;
      pointer-events: none;
      opacity: 0;
      transform: translateY(-8px);
    }
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

  /* 全屏退出提示条：顶部居中胶囊，不拦截鼠标事件 */
  .fullscreen-exit-hint {
    position: fixed;
    top: 24px;
    left: 50%;
    z-index: 9999;
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 16px;
    font-size: 13px;
    color: var(--color-text-primary);
    pointer-events: none;
    background: var(--glass-surface);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-surface-border);
    border-radius: 999px;
    box-shadow: var(--shadow-lg);
    transform: translateX(-50%);

    kbd {
      padding: 2px 7px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      box-shadow: 0 1px 0 var(--color-border);
    }
  }
}

/* 全屏提示条的淡入淡出过渡（保持水平居中定位） */
.fullscreen-hint-enter-active,
.fullscreen-hint-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fullscreen-hint-enter-from,
.fullscreen-hint-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

/* 横向收起：侧边栏 / 双列菜单 / 子菜单 */
.layout-fade-x-enter-active,
.layout-fade-x-leave-active {
  transition:
    opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.layout-fade-x-enter-from,
.layout-fade-x-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 纵向收起：顶栏 / 多标签栏 */
.layout-fade-y-enter-active,
.layout-fade-y-leave-active {
  transition:
    opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.layout-fade-y-enter-from,
.layout-fade-y-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
