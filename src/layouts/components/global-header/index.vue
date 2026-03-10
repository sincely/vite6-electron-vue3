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
          :icon-class="
            appStore.sidebarCollapsed ? 'panel-left-open' : 'panel-left-close'
          "
          width="20px"
          height="20px"
        />
      </button>

      <!-- 中间操作区 -->
      <div class="title-bar__center">
        <slot name="center" />
      </div>

      <!-- 右侧操作区 -->
      <div class="title-bar__actions">
        <!-- 更新提示 -->
        <button
          v-if="updateAvailable"
          class="icon-btn update-btn"
          title="有新版本"
          @click="showUpdateDialog"
        >
          <SvgIcon
            icon-class="download"
            class="update-icon"
            width="16px"
            height="16px"
          />
          <span>{{ latestVersion }}</span>
        </button>
        <!-- 通知铃铛 -->
        <div class="notif-btn-wrap">
          <button
            ref="bellBtnRef"
            class="icon-btn"
            title="消息通知"
            @click="handleNotice"
          >
            <SvgIcon icon-class="notice" width="18px" height="18px" />
            <span v-if="noticeStore.hasUnread" class="notif-badge">
              {{
                noticeStore.unreadCount > 99 ? '99+' : noticeStore.unreadCount
              }}
            </span>
          </button>
          <NotificationPanel :anchor-ref="bellBtnRef" />
        </div>
        <!-- 刷新 -->
        <button class="icon-btn" title="刷新" @click="reload">
          <SvgIcon icon-class="refresh-cw" width="16px" height="16px" />
        </button>
        <!-- 主题切换 -->
        <button
          class="icon-btn"
          title="切换主题"
          @click="appStore.toggleThemeWithTransition($event)"
        >
          <SvgIcon
            :icon-class="appStore.isDark ? 'sun' : 'moon'"
            width="16px"
            height="16px"
          />
        </button>
        <!-- Windows 窗口控制 -->
        <template v-if="!isMac">
          <div class="window-controls">
            <button class="icon-btn" title="最小化" @click="minimize">
              <SvgIcon icon-class="minus" width="16px" height="16px" />
            </button>
            <button class="icon-btn" title="最大化" @click="maximize">
              <SvgIcon icon-class="plus" width="16px" height="16px" />
            </button>
            <button class="icon-btn" title="关闭" @click="close">
              <SvgIcon icon-class="close" width="16px" height="16px" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
import { useNotificationStore } from '@/store/modules/notification'
const appStore = useAppStore()
const updateStore = useUpdateStore()
const noticeStore = useNotificationStore()

const latestVersion = computed(() => updateStore.latestVersion)
const isMac = computed(() => window.process?.platform === 'darwin')
const updateAvailable = computed(() => updateStore.updateAvailable)
const bellBtnRef = ref(null)

const showUpdateDialog = () => {
  updateStore.setDialogVisible(true)
}

const handleNotice = () => {
  noticeStore.togglePanel()
}

const reload = () => location.reload()
const minimize = () => ipcRenderer.send('minimize-window')
const maximize = () => ipcRenderer.send('maximize-window')
const close = () => ipcRenderer.send('close-window')
</script>

<style lang="scss" scoped>
.title-bar {
  position: relative;
  z-index: 1000;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: var(--titlebar-height);
  overflow: visible;
  user-select: none;
  background: color-mix(in srgb, var(--color-bg-titlebar), transparent 12%);
  border-bottom: 1px solid
    color-mix(in srgb, var(--color-border), transparent 24%);
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
    background-color: color-mix(
      in srgb,
      var(--color-bg-hover),
      transparent 10%
    );
    border-color: color-mix(in srgb, var(--color-border), transparent 38%);
  }

  &:active {
    background-color: var(--color-bg-active);
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

// 通知按鈕包裃
.notif-btn-wrap {
  position: relative;
  -webkit-app-region: no-drag;
}

// 未读徽章
.notif-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  color: #fff;
  text-align: center;
  pointer-events: none;
  background: var(--color-danger);
  border-radius: 999px;
  transform: translate(40%, -40%);
}
</style>
