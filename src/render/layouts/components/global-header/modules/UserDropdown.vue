<template>
  <el-dropdown
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
              <Icon :icon="item.icon" width="16" height="16" />
            </span>
            <span class="header-user-menu__item-label">
              {{ item.label }}
            </span>
          </button>
        </div>

        <div class="header-user-menu__group header-user-menu__group--secondary">
          <button
            v-for="item in secondaryUserActions"
            :key="item.action"
            class="header-user-menu__item"
            :class="{ 'is-danger': item.danger }"
            type="button"
            @click="handleUserAction(item.action)"
          >
            <span class="header-user-menu__item-icon">
              <Icon :icon="item.icon" width="16" height="16" />
            </span>
            <span class="header-user-menu__item-label">
              {{ item.label }}
            </span>
          </button>
        </div>
      </div>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useLockStore } from '@/store/modules/lock'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const lockStore = useLockStore()

const userDropdownRef = ref(null)
const avatarLoadFailed = ref(false)

const primaryUserActions = [
  { action: 'center', label: '个人中心', icon: 'lucide:user' },
  { action: 'profile', label: '设置', icon: 'lucide:settings' },
  { action: 'lock', label: '锁屏', icon: 'lucide:lock' },
  { action: 'docs', label: '文档', icon: 'lucide:file-text' },
  { action: 'help', label: '问题 & 帮助', icon: 'ri:question-line' }
]

const secondaryUserActions = [
  {
    action: 'logout',
    label: '退出登录',
    icon: 'lucide:log-out',
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

const closeUserDropdown = () => {
  userDropdownRef.value?.handleClose?.()
}

const openExternal = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const handleUserAction = async (action) => {
  closeUserDropdown()

  if (action === 'center') {
    router.push('/profile')
  } else if (action === 'profile') {
    appStore.toggleSettings(true)
  } else if (action === 'docs') {
    openExternal('https://element-plus.org/zh-CN/')
  } else if (action === 'github') {
    openExternal('https://github.com')
  } else if (action === 'help') {
    openExternal('https://github.com/issues')
  } else if (action === 'lock') {
    lockStore.openLockDialog()
  } else if (action === 'logout') {
    try {
      await userStore.logoutAction().catch(() => {})
      window.ipcRenderer?.send('logout')
    } catch {
      // 用户取消退出
    }
  }
}
</script>

<style lang="scss" scoped>
.header-user-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 50%;
  outline: none;
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-border-light);
  }

  &__avatar,
  &__fallback {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    overflow: hidden;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    background: var(--color-primary);
    border: 2px solid var(--color-border);
    border-radius: 50%;
  }

  &__avatar {
    object-fit: cover;
  }

  &__status {
    position: absolute;
    right: 2px;
    bottom: 2px;
    z-index: 2;
    width: 10px;
    height: 10px;
    background: #10b981;
    border: 2px solid var(--color-bg-titlebar);
    border-radius: 50%;
  }
}

:deep(.header-user-dropdown-popper.el-popper) {
  padding: 0;
  background: var(--glass-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

:deep(.header-user-dropdown-popper .el-popper__arrow) {
  display: none;
}

.header-user-menu {
  width: 220px;
  overflow: hidden;

  &__hero {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid var(--color-border);
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
    width: 38px;
    height: 38px;
    overflow: hidden;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    background: var(--color-primary);
    border: 2px solid var(--color-border);
    border-radius: 50%;
  }

  &__avatar {
    object-fit: cover;
  }

  &__avatar-status {
    position: absolute;
    right: 1px;
    bottom: 1px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border: 2px solid var(--glass-surface);
    border-radius: 50%;
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
    padding: 2px 6px;
    font-size: 10px;
    font-weight: 700;
    color: var(--color-primary);
    background: var(--brand-accent-soft);
    border: 1px solid color-mix(in srgb, var(--color-primary), transparent 40%);
    border-radius: 8px;
  }

  &__email {
    overflow: hidden;
    font-size: 12px;
    color: var(--color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__group {
    padding: 6px;

    &--secondary {
      border-top: 1px solid var(--color-border);
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
      background: var(--color-bg-hover);
      border-color: var(--color-border-light);
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
    width: 16px;
    height: 16px;
    color: var(--color-text-secondary);
    background: transparent;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  &__item-label {
    flex: 1;
    font-size: 14px;
    font-weight: 400;
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
