<template>
  <header class="title-bar" :class="{ 'is-top-mode': isTopMenu }">
    <div class="title-bar__inner">
      <!-- 侧边栏折叠 / 子菜单栏切换 -->
      <button
        v-if="showSidebarToggle"
        class="icon-btn sidebar-toggle"
        :title="toggleButtonTitle"
        @click="handleToggleClick"
      >
        <SvgIcon :icon-class="toggleIcon" width="20px" height="20px" />
      </button>

      <!-- Logo 区域 (顶部菜单模式显示) -->
      <GlobalLogo v-if="isTopMenu" class="top-mode-logo" />

      <!-- 顶部菜单 (顶部菜单模式显示) -->
      <GlobalTopMenu v-if="isTopMenu" />

      <!-- 中间操作区 -->
      <div class="title-bar__center" :class="{ 'is-top-mode': isTopMenu }">
        <slot name="center" />
      </div>

      <!-- 右侧操作区 -->
      <div class="title-bar__actions">
        <!-- 右侧插槽（搜索等） -->
        <slot name="right" />

        <!-- 更新提示 -->
        <button
          v-if="updateAvailable"
          class="icon-btn update-btn"
          @click="showUpdateDialog"
        >
          <SvgIcon
            icon-class="update"
            class="update-icon"
            width="16px"
            height="16px"
          />
          <span>更新</span>
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
        <!-- 混合模式下的设置按钮（left-mixed 时 UserPanel 被隐藏，提供直接入口） -->
        <button
          v-if="isMixedMode"
          class="icon-btn"
          title="设置"
          @click="appStore.toggleSettings(true)"
        >
          <SvgIcon icon-class="settings" width="18px" height="18px" />
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
          <el-tooltip
            :content="isMaximized ? '向下还原' : '最大化'"
            placement="bottom"
            :show-after="200"
          >
            <button class="icon-btn" @click="maximize">
              <SvgIcon
                :icon-class="isMaximized ? 'mini' : 'max'"
                width="16px"
                height="16px"
              />
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
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
import { useNotificationStore } from '@/store/modules/notification'
import { isWindows } from '@/utils/platform'
import GlobalLogo from '../global-logo/index.vue'
import GlobalTopMenu from '../global-topMenu/index.vue'
import UserDropdown from './modules/UserDropdown.vue'
import NotificationPanel from '@/components/NotificationPanel/index.vue'

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

// 是否显示侧边栏切换按钮：
// - left / left-mixed: 显示（控制侧边栏折叠 / 子菜单栏显隐）
// - top-mixed: 显示（控制子菜单栏显隐）
// - top: 不显示
const showSidebarToggle = computed(
  () => appStore.layoutMode !== 'top' && appStore.layoutMode !== 'top-mixed'
)

const isMixedMode = computed(
  () =>
    appStore.layoutMode === 'left-mixed' || appStore.layoutMode === 'top-mixed'
)

const toggleButtonTitle = computed(() => {
  if (isMixedMode.value) {
    return appStore.mixedSubmenuVisible ? '隐藏子菜单' : '显示子菜单'
  }
  return appStore.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'
})

const toggleIcon = computed(() => {
  if (isMixedMode.value) {
    return appStore.mixedSubmenuVisible ? 'panel-left-close' : 'panel-left-open'
  }
  return appStore.sidebarCollapsed ? 'panel-left-open' : 'panel-left-close'
})

const handleToggleClick = () => {
  if (isMixedMode.value) {
    appStore.toggleMixedSubmenu()
  } else {
    appStore.toggleSidebar()
  }
}

const minimize = () => ipcRenderer.send('minimize-window')
const maximize = () => ipcRenderer.send('maximize-window')
const close = () => ipcRenderer.send('close-window')

// 窗口最大化状态跟踪
const isMaximized = ref(false)

const onMaximizeChange = (_event, maximized) => {
  isMaximized.value = maximized
}

onMounted(async () => {
  // 初始化时查询当前最大化状态
  try {
    isMaximized.value = await ipcRenderer.invoke('get-window-maximized')
  } catch {
    // 登录窗口无此 handler，忽略
  }
  ipcRenderer.on('window-maximize-change', onMaximizeChange)
})

onBeforeUnmount(() => {
  ipcRenderer.off('window-maximize-change', onMaximizeChange)
})
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
  color: var(--color-text-primary);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-hover);
    border-color: var(--color-border-light);
  }

  &:active {
    background-color: var(--color-bg-active);
    transform: scale(0.94);
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
      box-shadow: var(--shadow-glow-primary);
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
  background: linear-gradient(135deg, var(--color-rose), var(--color-danger));
  border-radius: 999px;
  box-shadow: 0 2px 8px -2px
    color-mix(in srgb, var(--color-danger), transparent 50%);
  transform: translate(40%, -40%);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
</style>
