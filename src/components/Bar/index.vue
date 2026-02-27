<template>
  <div class="title-bar" :class="{ 'is-login': isLoginPage }">
    <!-- 左侧：sidebar 区域标题栏 -->
    <div class="title-bar__sidebar" :style="{ width: sidebarWidth }">
      <!-- macOS 风格按钮 -->
      <div class="traffic-lights">
        <span class="traffic-light traffic-light--close" title="关闭" @click="closeWindow">
          <i class="i-lucide-x" />
        </span>
        <span class="traffic-light traffic-light--minimize" title="最小化" @click="minimizeWindow">
          <i class="i-lucide-minus" />
        </span>
        <span class="traffic-light traffic-light--maximize" title="最大化" @click="maximizeWindow">
          <i class="i-lucide-plus" />
        </span>
      </div>

      <!-- 侧边栏折叠按钮（仅主页显示） -->
      <button v-if="!isLoginPage" class="icon-btn sidebar-toggle" title="折叠侧边栏" @click="appStore.toggleSidebar()">
        <i :class="appStore.sidebarCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'" />
      </button>
    </div>

    <!-- 右侧：内容区标题栏 -->
    <div class="title-bar__content">
      <!-- 登录页显示应用名称 -->
      <span v-if="isLoginPage" class="title-bar__app-name">
        <img src="@/assets/bar/logo.svg" class="title-bar__logo" alt="logo" />
        小铱elink
      </span>

      <!-- 右侧操作区 -->
      <div class="title-bar__actions">
        <button v-if="!isLoginPage" class="icon-btn" title="刷新" @click="reload">
          <i class="i-lucide-refresh-cw" />
        </button>
        <button v-if="!isLoginPage" class="icon-btn" title="切换主题" @click="appStore.toggleTheme()">
          <i :class="appStore.isDark ? 'i-lucide-sun' : 'i-lucide-moon'" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
const route = useRoute()

const isLoginPage = computed(() => route.path === '/' || route.path === '/login')

const sidebarWidth = computed(() => {
  if (isLoginPage.value) return '100%'
  return appStore.sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
})

const closeWindow = () => window.ipcRenderer.send('window-close')
const minimizeWindow = () => window.ipcRenderer.send('window-minimize')
const maximizeWindow = () => window.ipcRenderer.send('window-maximize')
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

  // 左侧侧边栏标题部分
  &__sidebar {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    padding: 0 10px;
    background-color: var(--color-bg-sidebar-titlebar);
    border-right: 1px solid var(--color-border);
    transition: width 0.25s ease;
  }

  // 右侧内容标题部分
  &__content {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 0 12px 0 0;
    background-color: var(--color-bg-titlebar);
  }

  &__app-name {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-left: 14px;
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

// macOS 交通灯按钮
.traffic-lights {
  display: flex;
  gap: 7px;
  align-items: center;
  -webkit-app-region: no-drag;

  &:hover .traffic-light i {
    opacity: 1;
  }
}

.traffic-light {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  cursor: pointer;
  border-radius: 50%;
  transition:
    opacity 0.15s ease,
    filter 0.15s ease;

  i {
    font-size: 9px;
    color: rgb(0 0 0 / 60%);
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  &:hover {
    filter: brightness(0.85);

    i {
      opacity: 1;
    }
  }

  &:active {
    filter: brightness(0.7);
  }

  &--close {
    background-color: #f56057;
  }

  &--minimize {
    background-color: #fec428;
  }

  &--maximize {
    background-color: #27c93e;
  }
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
