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
        <el-dropdown
          v-if="isTopMenu"
          ref="userDropdownRef"
          class="header-user-dropdown"
          placement="bottom-end"
          popper-class="header-user-dropdown-popper"
          trigger="click"
        >
          <button class="header-user-trigger" type="button">
            <span class="header-user-trigger__halo"></span>
            <img
              v-if="userAvatar && !avatarLoadFailed"
              :src="userAvatar"
              :alt="displayName"
              class="header-user-trigger__avatar"
              @error="avatarLoadFailed = true"
            />
            <span v-else class="header-user-trigger__fallback">
              {{ userInitial }}
            </span>
            <span class="header-user-trigger__status"></span>
          </button>
          <template #dropdown>
            <div class="header-user-menu">
              <div class="header-user-menu__hero">
                <div class="header-user-menu__avatar-wrap">
                  <img
                    v-if="userAvatar && !avatarLoadFailed"
                    :src="userAvatar"
                    :alt="displayName"
                    class="header-user-menu__avatar"
                    @error="avatarLoadFailed = true"
                  />
                  <span v-else class="header-user-menu__avatar-fallback">
                    {{ userInitial }}
                  </span>
                  <span class="header-user-menu__avatar-status"></span>
                </div>
                <div class="header-user-menu__meta">
                  <div class="header-user-menu__name-row">
                    <span class="header-user-menu__name">
                      {{ displayName }}
                    </span>
                    <span class="header-user-menu__badge">{{ userBadge }}</span>
                  </div>
                  <p class="header-user-menu__email">{{ userEmail }}</p>
                </div>
              </div>

              <div class="header-user-menu__group">
                <button
                  v-for="item in primaryUserActions"
                  :key="item.action"
                  class="header-user-menu__item"
                  type="button"
                  @click="handleUserAction(item.action)"
                >
                  <span class="header-user-menu__item-icon">
                    <component :is="item.icon" />
                  </span>
                  <span class="header-user-menu__item-label">
                    {{ item.label }}
                  </span>
                </button>
              </div>

              <div
                class="header-user-menu__group header-user-menu__group--secondary"
              >
                <button
                  v-for="item in secondaryUserActions"
                  :key="item.action"
                  class="header-user-menu__item"
                  :class="{ 'is-danger': item.danger }"
                  type="button"
                  @click="handleUserAction(item.action)"
                >
                  <span class="header-user-menu__item-icon">
                    <component :is="item.icon" />
                  </span>
                  <span class="header-user-menu__item-label">
                    {{ item.label }}
                  </span>
                </button>
              </div>
            </div>
          </template>
        </el-dropdown>
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
const userDropdownRef = ref(null)
const avatarLoadFailed = ref(false)

const primaryUserActions = [
  { action: 'profile', label: '设置', icon: 'setting' },
  { action: 'docs', label: '文档', icon: 'Document' },
  // { action: 'github', label: 'GitHub', icon: 'Link' },
  { action: 'help', label: '问题 & 帮助', icon: 'QuestionFilled' }
]

const secondaryUserActions = [
  // { action: 'lock', label: '锁定屏幕', icon: 'Lock', shortcut: '⌥ L' },
  {
    action: 'logout',
    label: '退出登录',
    icon: 'SwitchButton',
    shortcut: '⌥ Q',
    danger: true
  }
]

const displayName = computed(
  () =>
    userStore.userInfo?.nickname ||
    userStore.userInfo?.name ||
    userStore.userInfo?.username ||
    'Admin'
)
const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())
const userAvatar = computed(() => userStore.userInfo?.avatar || '')
const userEmail = computed(() => {
  if (userStore.userInfo?.email) return userStore.userInfo.email
  const account = userStore.userInfo?.username || 'admin'
  return `${account}@lightning.app`
})
const userBadge = computed(() =>
  userStore.roles?.length ? userStore.roles[0].toUpperCase() : 'PRO'
)

const showUpdateDialog = () => {
  window.dispatchEvent(new Event('update:open-dialog'))
}

const handleNotice = () => {
  noticeStore.togglePanel()
}

const closeUserDropdown = () => {
  userDropdownRef.value?.handleClose?.()
}

const openExternal = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const handleUserAction = async (action) => {
  closeUserDropdown()

  if (action === 'profile') {
    appStore.toggleSettings(true)
  } else if (action === 'docs') {
    openExternal('https://element-plus.org/zh-CN/')
  } else if (action === 'github') {
    openExternal('https://github.com')
  } else if (action === 'help') {
    openExternal('https://github.com/issues')
  } else if (action === 'lock') {
    router.push('/login').catch(() => {})
  } else if (action === 'logout') {
    await userStore.logoutAction().catch(() => {})
    router.push('/login').catch(() => {})
  }
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

.header-user-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 50%;
  outline: none;
  transition: transform 0.25s ease;
  -webkit-app-region: no-drag;

  &:hover {
    transform: translateY(-1px);

    .header-user-trigger__halo {
      opacity: 1;
      transform: scale(1);
    }
  }

  &__halo {
    position: absolute;
    inset: 2px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary), transparent 68%) 0%,
      color-mix(in srgb, var(--brand-accent), transparent 72%) 100%
    );
    filter: blur(8px);
    border-radius: 50%;
    opacity: 0.88;
    transition: all 0.25s ease;
    transform: scale(0.92);
  }

  &__avatar,
  &__fallback {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    overflow: hidden;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--brand-accent), transparent 10%) 0%,
      color-mix(in srgb, var(--color-primary), transparent 20%) 100%
    );
    border: 2px solid color-mix(in srgb, #fff, transparent 78%);
    border-radius: 50%;
    box-shadow:
      0 10px 22px -14px rgb(15 23 42 / 65%),
      inset 0 1px 0 rgb(255 255 255 / 30%);
  }

  &__avatar {
    object-fit: cover;
  }

  &__status {
    position: absolute;
    right: 3px;
    bottom: 5px;
    z-index: 2;
    width: 12px;
    height: 12px;
    background: #4ade80;
    border: 2px solid var(--color-bg-titlebar);
    border-radius: 50%;
    box-shadow: 0 0 0 3px color-mix(in srgb, #4ade80, transparent 78%);
  }
}

:deep(.header-user-dropdown-popper.el-popper) {
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 12px;
  box-shadow: none;
}

:deep(.header-user-dropdown-popper .el-popper__arrow) {
  display: none;
}

.header-user-menu {
  width: 230px;
  overflow: hidden;

  &__hero {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 14px 14px 13px;
    border-bottom: 1px solid
      color-mix(in srgb, var(--color-border), transparent 34%);
  }

  &__avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  &__avatar,
  &__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    overflow: hidden;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--brand-accent), transparent 12%) 0%,
      color-mix(in srgb, var(--color-primary), transparent 18%) 100%
    );
    border: 2px solid color-mix(in srgb, #fff, transparent 84%);
    border-radius: 50%;
    box-shadow:
      0 16px 32px -18px rgb(15 23 42 / 55%),
      inset 0 1px 0 rgb(255 255 255 / 28%);
  }

  &__avatar {
    object-fit: cover;
  }

  &__avatar-status {
    position: absolute;
    right: 2px;
    bottom: 2px;
    width: 14px;
    height: 14px;
    background: #4ade80;
    border: 2px solid color-mix(in srgb, var(--color-bg-card), transparent 4%);
    border-radius: 50%;
    box-shadow: 0 0 0 3px color-mix(in srgb, #4ade80, transparent 82%);
  }

  &__meta {
    min-width: 0;
  }

  &__name-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__name {
    overflow: hidden;
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    flex-shrink: 0;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #86efac;
    letter-spacing: 0.04em;
    background: color-mix(in srgb, #22c55e, transparent 82%);
    border: 1px solid color-mix(in srgb, #22c55e, transparent 72%);
    border-radius: 12px;
  }

  &__email {
    overflow: hidden;
    font-size: 12px;
    color: var(--color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__group {
    padding: 8px;

    &--secondary {
      border-top: 1px solid
        color-mix(in srgb, var(--color-border), transparent 36%);
    }
  }

  &__item {
    display: flex;
    gap: 10px;
    align-items: center;
    width: 100%;
    height: 32px;
    padding: 0 12px;
    color: var(--color-text-primary);
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
      background: color-mix(in srgb, var(--color-bg-hover), transparent 4%);
      border-color: color-mix(in srgb, var(--color-border), transparent 42%);
    }

    &.is-danger {
      color: color-mix(
        in srgb,
        var(--color-danger),
        var(--color-text-primary) 18%
      );

      .header-user-menu__item-icon {
        color: inherit;
      }
    }
  }

  &__item-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 18%);
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  &__item-label {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
  }

  &__shortcut {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--color-text-muted);
    letter-spacing: 0.04em;
  }
}
</style>
