<template>
  <header class="title-bar">
    <div class="title-bar__inner">
      <!-- 侧边栏折叠切换 -->
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
      <div class="title-bar__actions">
        <!-- 更新提示 -->
        <button v-if="updateAvailable" class="icon-btn update-btn" title="有新版本" @click="showUpdateDialog">
          <SvgIcon icon-class="lucide-download" class="update-icon" width="16px" height="16px" />
          <span>v{{ currentVersion }}</span>
        </button>
        <!-- 刷新 -->
        <button class="icon-btn" title="刷新" @click="reload">
          <SvgIcon icon-class="lucide-refresh-cw" width="16px" height="16px" />
        </button>
        <!-- 主题切换 -->
        <button class="icon-btn" title="切换主题" @click="appStore.toggleTheme()">
          <SvgIcon :icon-class="appStore.isDark ? 'lucide-sun' : 'lucide-moon'" width="16px" height="16px" />
        </button>
        <!-- Windows 窗口控制 -->
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
  </header>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/update'

const appStore = useAppStore()
const updateStore = useUpdateStore()

const isMac = computed(() => window.process?.platform === 'darwin')
const updateAvailable = computed(() => updateStore.updateAvailable)

const showUpdateDialog = () => {
  updateStore.setDialogVisible(true)
}

const reload = () => location.reload()
const minimize = () => window.ipcRenderer.send('window-minimize')
const maximize = () => window.ipcRenderer.send('window-maximize')
const close = () => window.ipcRenderer.send('window-close')
</script>

<style lang="scss" scoped>
.title-bar {
  position: relative;
  z-index: 1000;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: var(--titlebar-height);
  overflow: hidden;
  user-select: none;
  background: color-mix(in srgb, var(--color-bg-titlebar), transparent 12%);
  border-bottom: 1px solid color-mix(in srgb, var(--color-border), transparent 24%);
  -webkit-app-region: drag;

  &__inner {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    padding: 0 12px;
  }

  &__actions {
    display: flex;
    gap: 6px;
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

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: color-mix(in srgb, var(--color-bg-hover), transparent 38%);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-text-primary);
    background-color: color-mix(in srgb, var(--color-bg-hover), transparent 10%);
    border-color: color-mix(in srgb, var(--color-border), transparent 38%);
  }

  &:active {
    background-color: var(--color-bg-active);
  }

  &.control-btn {
    width: 42px;
    height: 100%;
    background: transparent;
    border-radius: 0;

    &:hover {
      background-color: var(--color-bg-hover);
    }

    &.close-btn:hover {
      color: #fff !important;
      background-color: #e81123 !important;
    }
  }

  &.update-btn {
    gap: 6px;
    width: auto;
    height: 30px;
    padding: 0 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-primary);
    background: linear-gradient(
      100deg,
      color-mix(in srgb, var(--color-primary), transparent 88%) 0%,
      color-mix(in srgb, var(--brand-accent-alt), transparent 90%) 100%
    );
    border-color: color-mix(in srgb, var(--color-primary), transparent 64%);

    &:hover {
      background: linear-gradient(
        100deg,
        color-mix(in srgb, var(--color-primary), transparent 82%) 0%,
        color-mix(in srgb, var(--brand-accent-alt), transparent 84%) 100%
      );
    }

    .update-icon {
      color: var(--color-primary);
    }
  }
}

.sidebar-toggle {
  width: 34px;
  height: 34px;
  margin-right: 8px;
}
</style>
