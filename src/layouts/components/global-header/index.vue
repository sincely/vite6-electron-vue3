<template>
  <header class="title-bar" :class="{ 'is-top-mode': isTopMenu }">
    <div class="title-bar__inner">
      <!-- 侧边栏折叠切换 -->
      <button
        v-if="!isTopMenu"
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

      <!-- Logo 区域 (仅顶部菜单模式显示) -->
      <GlobalLogo v-if="isTopMenu" class="top-mode-logo" />

      <!-- 顶部菜单 (仅顶部菜单模式显示) -->
      <GlobalTopMenu v-if="isTopMenu" />

      <!-- 中间操作区 -->
      <div class="title-bar__center" :class="{ 'is-top-mode': isTopMenu }">
        <slot name="center" />
      </div>

      <!-- 右侧操作区 -->
      <div class="title-bar__actions">
        <!-- 更新提示 -->
        <button
          v-if="updateAvailable"
          class="icon-btn update-btn"
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
          <button ref="bellBtnRef" class="icon-btn" @click="handleNotice">
            <SvgIcon icon-class="notice" width="18px" height="18px" />
            <span v-if="noticeStore.hasUnread" class="notif-badge">
              {{
                noticeStore.unreadCount > 99 ? '99+' : noticeStore.unreadCount
              }}
            </span>
          </button>
          <NotificationPanel :anchor-ref="bellBtnRef" />
        </div>
        <!-- 主题切换 -->
        <button
          class="icon-btn"
          @click="
            appStore.toggleThemeWithTransition(
              $event,
              isDark ? 'light' : 'dark'
            )
          "
        >
          <SvgIcon
            :icon-class="appStore.isDark ? 'sun' : 'moon'"
            width="16px"
            height="16px"
          />
        </button>
        <!-- 顶部模式下的用户信息和设置 -->
        <UserDropdown v-if="isTopMenu" />
        <!-- 窗口控制 -->
        <div v-if="isWindows()" class="window-controls">
          <el-tooltip content="最小化" placement="bottom" :show-after="200">
            <button class="icon-btn" @click="minimize">
              <SvgIcon icon-class="minus" width="16px" height="16px" />
            </button>
          </el-tooltip>
          <el-tooltip content="最大化" placement="bottom" :show-after="200">
            <button class="icon-btn" @click="maximize">
              <SvgIcon icon-class="plus" width="16px" height="16px" />
            </button>
          </el-tooltip>
          <el-tooltip content="关闭" placement="bottom" :show-after="200">
            <button class="icon-btn" @click="close">
              <SvgIcon icon-class="close" width="16px" height="16px" />
            </button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
import { useNotificationStore } from '@/store/modules/notification'
import { isWindows } from '@/utils/platform'
import GlobalLogo from '../global-logo/index.vue'
import GlobalTopMenu from '../global-topMenu/index.vue'
import UserDropdown from './modules/UserDropdown.vue'
import { computed, ref } from 'vue'

const appStore = useAppStore()
const updateStore = useUpdateStore()
const noticeStore = useNotificationStore()

const latestVersion = computed(() => updateStore.latestVersion)
const updateAvailable = computed(
  () =>
    !!latestVersion.value && latestVersion.value !== updateStore.currentVersion
)
const bellBtnRef = ref(null)

const showUpdateDialog = () => {
  window.dispatchEvent(new Event('update:open-dialog'))
}

const handleNotice = () => {
  noticeStore.togglePanel()
}

const isTopMenu = computed(
  () => appStore.layoutMode === 'top' || appStore.layoutMode === 'top-mixed'
)
const isDark = computed(() => appStore.isDark)

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
  background: var(--color-bg-titlebar);
  border-bottom: 1px solid var(--color-border);
  -webkit-app-region: drag;

  &__inner {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    padding: 0 12px;
  }

  &__center {
    display: flex;
    flex: 1;
    align-items: flex-end;

    &.is-top-mode {
      flex: none;
    }
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
  gap: 6px;
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
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-hover);
    border-color: var(--color-border-light);
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
    background: var(--brand-accent-soft);
    border-color: color-mix(in srgb, var(--color-primary), transparent 40%);

    &:hover {
      background: var(--color-bg-active);
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
