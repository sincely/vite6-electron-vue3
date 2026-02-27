<template>
  <div class="title-bar" :class="{ 'is-login': isLoginPage }">
    <!-- 登录页：完整标题栏 -->
    <template v-if="isLoginPage">
      <div class="title-bar__login">
        <!-- 原生交通灯占位区 -->
        <div class="native-traffic-lights" />
        <span class="title-bar__app-name">
          <img src="@/assets/bar/logo.svg" class="title-bar__logo" alt="logo" />
          ai
        </span>
      </div>
    </template>

    <!-- 主页：左侧 sidebar + 右侧内容区 -->
    <template v-else>
      <!-- 左侧：sidebar 区域标题栏 -->
      <div class="title-bar__sidebar" :style="{ width: sidebarWidth }">
        <!-- 原生交通灯占位区 -->
        <div class="native-traffic-lights" />
      </div>

      <!-- 右侧：内容区标题栏 -->
      <div class="title-bar__content">
        <!-- 折叠按钮，始终可见 -->
        <button
          class="icon-btn sidebar-toggle"
          :title="appStore.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'"
          @click="appStore.toggleSidebar()"
        >
          <SvgIcon
            :icon-class="appStore.sidebarCollapsed ? 'lucide-panel-left-open' : 'lucide-panel-left-close'"
            width="15px"
            height="15px"
          />
        </button>
        <!-- 右侧操作区 -->
        <div class="title-bar__actions">
          <button class="icon-btn" title="刷新" @click="reload">
            <SvgIcon icon-class="lucide-refresh-cw" width="14px" height="14px" />
          </button>
          <button class="icon-btn" title="切换主题" @click="appStore.toggleTheme()">
            <SvgIcon :icon-class="appStore.isDark ? 'lucide-sun' : 'lucide-moon'" width="14px" height="14px" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
const route = useRoute()

const isLoginPage = computed(() => route.path === '/' || route.path === '/login')

const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
})

const reload = () => location.reload()
</script>

<style lang="scss" scoped>
.title-bar {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: var(--titlebar-height);
  overflow: hidden;
  user-select: none;
  border-top: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  -webkit-app-region: drag;

  &.is-login {
    background: var(--color-bg-titlebar);
  }

  // 登录页标题栏
  &__login {
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: center;
    padding: 0 12px;
    background-color: var(--color-bg-titlebar);
  }

  // 左侧侧边栏标题部分
  &__sidebar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 0;
    overflow: hidden;
    background-color: var(--color-bg-sidebar-titlebar);
    border-right: 1px solid var(--color-border);
    transition: width 0.25s ease;
  }

  // 右侧内容标题部分
  &__content {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    padding: 0 8px 0 4px;
    background-color: var(--color-bg-titlebar);
  }

  &__app-name {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__logo {
    width: 18px;
    height: 18px;
  }

  &__actions {
    display: flex;
    gap: 2px;
    align-items: center;
    margin-left: auto;
  }
}

// 原生交通灯占位（hiddenInset 模式下按钮宽约 78px）
.native-traffic-lights {
  flex-shrink: 0;
  width: 78px;
  height: 100%;
  -webkit-app-region: no-drag;
}

// 图标按钮
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 6px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-hover);
  }

  &:active {
    opacity: 0.7;
  }
}

.sidebar-toggle {
  width: 26px;
  height: 26px;
  font-size: 15px;
}
</style>
