<template>
  <div class="title-bar" :class="{ 'is-login': isLoginPage }">
    <!-- 登录页：完整标题栏 -->
    <template v-if="isLoginPage">
      <div class="title-bar-login">
        <span class="title-bar-app-name">
          <img src="@/assets/bar/logo.svg" class="title-bar-logo" alt="logo" />
          ai
        </span>
        <!-- 登录页右侧：仅窗口控制 -->
        <div v-if="!isMac" class="title-bar-actions">
          <div class="window-controls">
            <button class="icon-btn control-btn" title="最小化" @click="minimize">
              <SvgIcon icon-class="lucide-minus" width="16px" height="16px" />
            </button>
            <button class="icon-btn control-btn" title="最大化" @click="maximize">
              <SvgIcon icon-class="lucide-plus" width="16px" height="16px" />
            </button>
            <button class="icon-btn control-btn close-btn" title="关闭" @click="close">
              <SvgIcon icon-class="lucide-x" width="16px" height="16px" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 主页：左侧 sidebar + 右侧内容区 -->
    <template v-else>
      <!-- 右侧：内容区标题栏 -->
      <div class="title-bar-content">
        <!-- 折叠按钮，始终可见 -->
        <button
          class="icon-btn sidebar-toggle"
          :title="appStore.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'"
          @click="appStore.toggleSidebar()"
        >
          <SvgIcon
            :icon-class="appStore.sidebarCollapsed ? 'lucide-panel-left-open' : 'lucide-panel-left-close'"
            width="20px"
            height="20px"
          />
        </button>
        <!-- 右侧操作区 -->
        <div class="title-bar-actions">
          <button v-if="updateAvailable" class="icon-btn update-btn" title="有新版本" @click="showUpdateDialog">
            <SvgIcon icon-class="lucide-download" class="update-icon" width="16px" height="16px" />
            <span class="version-info">v{{ latestVersion }}</span>
          </button>
          <button class="icon-btn" title="刷新" @click="reload">
            <SvgIcon icon-class="lucide-refresh-cw" width="16px" height="16px" />
          </button>
          <button class="icon-btn" title="切换主题" @click="appStore.toggleTheme()">
            <SvgIcon :icon-class="appStore.isDark ? 'lucide-sun' : 'lucide-moon'" width="16px" height="16px" />
          </button>

          <!-- Windows 窗口控制 (在同一行显示) -->
          <template v-if="!isMac">
            <div class="window-controls">
              <button class="icon-btn control-btn" title="最小化" @click="minimize">
                <SvgIcon icon-class="lucide-minus" width="16px" height="16px" />
              </button>
              <button class="icon-btn control-btn" title="最大化" @click="maximize">
                <SvgIcon icon-class="lucide-plus" width="16px" height="16px" />
              </button>
              <button class="icon-btn control-btn close-btn" title="关闭" @click="close">
                <SvgIcon icon-class="lucide-x" width="16px" height="16px" />
              </button>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/update'
import { ElMessageBox } from 'element-plus'

const appStore = useAppStore()
const updateStore = useUpdateStore()
const route = useRoute()

const isLoginPage = computed(() => route.path === '/' || route.path === '/login')
const isMac = computed(() => window.process?.platform === 'darwin')

const currentVersion = computed(() => updateStore.currentVersion)
const latestVersion = computed(() => updateStore.latestVersion)
const updateAvailable = computed(() => updateStore.updateAvailable)

const showUpdateDialog = () => {
  ElMessageBox.confirm(
    `检测到新版本 ${latestVersion.value}，当前版本 ${currentVersion.value}。是否立即更新？`,
    '应用更新',
    {
      confirmButtonText: '立即更新',
      cancelButtonText: '稍后',
      type: 'info'
    }
  )
    .then(() => {
      window.ipcRenderer.send('start-download')
    })
    .catch(() => {
      // 用户取消更新
    })
}

// const sidebarWidth = computed(() => {
//   return appStore.sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
// })

const reload = () => location.reload()

const minimize = () => window.ipcRenderer.send('window-minimize')
const maximize = () => window.ipcRenderer.send('window-maximize')
const close = () => window.ipcRenderer.send('window-close')
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
  &-login {
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: center;
    padding: 0 0 0 12px;
    background-color: var(--color-bg-titlebar);

    .title-bar-actions {
      margin-left: auto;
    }
  }

  // 左侧侧边栏标题部分
  &-sidebar {
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
  &-content {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    padding: 0 0 0 4px;
    background-color: var(--color-bg-titlebar);
  }

  &-app-name {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-logo {
    width: 18px;
    height: 18px;
  }

  &-actions {
    display: flex;
    gap: 2px;
    align-items: center;
    height: 100%;
    margin-left: auto;
  }
}

.window-controls {
  display: flex;
  align-items: center;
  height: 100%;
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

  &.control-btn {
    width: 32px;
    height: var(--titlebar-height);
    border-radius: 0;

    &.close-btn:hover {
      color: #fff !important;
      background-color: #e81123 !important;
    }
  }

  &.update-btn {
    gap: 4px;
    width: auto;
    padding: 0 8px;
    color: var(--color-info);

    .version-info {
      font-size: 11px;
      font-weight: 600;
    }
  }
}

.sidebar-toggle {
  width: 26px;
  height: 26px;
  font-size: 15px;
}
</style>
