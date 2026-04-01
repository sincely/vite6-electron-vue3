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
        <el-tooltip content="有新版本" placement="bottom" :show-after="200">
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
        </el-tooltip>
        <!-- 顶部模式下的用户信息和设置 -->
        <el-dropdown
          v-if="isTopMenu"
          trigger="click"
          @command="handleUserCommand"
        >
          <div class="header-user-profile icon-btn">
            <SvgIcon icon-class="user" width="20px" height="20px" />
            <span class="user-name">{{ userStore.name }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item command="about">关于</el-dropdown-item>
              <el-dropdown-item divided command="logout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <!-- 通知铃铛 -->
        <div class="notif-btn-wrap">
          <el-tooltip content="消息通知" placement="bottom" :show-after="200">
            <button ref="bellBtnRef" class="icon-btn" @click="handleNotice">
              <SvgIcon icon-class="notice" width="18px" height="18px" />
              <span v-if="noticeStore.hasUnread" class="notif-badge">
                {{
                  noticeStore.unreadCount > 99 ? '99+' : noticeStore.unreadCount
                }}
              </span>
            </button>
          </el-tooltip>
          <NotificationPanel :anchor-ref="bellBtnRef" />
        </div>
        <!-- 主题切换 -->
        <el-tooltip content="切换主题" placement="bottom" :show-after="200">
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
        </el-tooltip>
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
import { useUserStore } from '@/store/modules/user'
import { isWindows } from '@/utils/platform'
import GlobalLogo from '../global-logo/index.vue'
import GlobalTopMenu from '../global-topMenu/index.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

console.log(isWindows)

const appStore = useAppStore()
const updateStore = useUpdateStore()
const noticeStore = useNotificationStore()
const userStore = useUserStore()
const router = useRouter()

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

const handleUserCommand = (command) => {
  if (command === 'settings') {
    appStore.toggleSettings(true)
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/login').catch(() => {})
  } else {
    router.push(`/${command}`).catch(() => {})
  }
}

const isTopMenu = computed(
  () => appStore.layoutMode === 'top' || appStore.layoutMode === 'top-mixed'
)
const isDark = computed(() => appStore.isDark)

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

  &__center {
    display: flex;
    flex: 1;
    align-items: center;

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

.header-user-profile {
  display: flex;
  align-items: center;
  margin: 0 4px;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 10%);
  }

  .user-name {
    font-size: 13px;
    font-weight: 500;
  }
}
</style>
