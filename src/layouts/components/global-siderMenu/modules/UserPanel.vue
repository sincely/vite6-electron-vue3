<template>
  <div class="sidebar-footer">
    <div
      class="user-profile"
      :class="{ 'is-collapsed': appStore.sidebarCollapsed }"
    >
      <div class="user-avatar">
        <SvgIcon icon-class="user" width="26px" height="26px" />
      </div>
      <div class="user-info">
        <div class="user-name">{{ userStore.name }}</div>
        <div class="user-detail">系统管理员</div>
      </div>
      <SvgIcon
        v-if="!appStore.sidebarCollapsed"
        icon-class="settings"
        class="user-settings-icon"
        width="18px"
        height="18px"
        @click="handleSettingsClick"
      />
      <div v-if="showSettings" class="sidebar-footer-settings">
        <div v-for="item in actionList" :key="item.id">
          <div class="sidebar-setting-item" @click="handleClick(item)">
            <div class="sidebar-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const showSettings = ref(false)
const actionList = ref([
  {
    id: 'settings',
    label: '设置',
    route: '/settings',
    icon: 'settings'
  },
  {
    id: 'about',
    label: '关于',
    route: '/about',
    icon: 'about'
  },
  {
    id: 'feedback',
    label: '反馈',
    route: '/feedback',
    icon: 'feedback'
  },
  {
    id: 'contact',
    label: '联系我们',
    route: '/contact',
    icon: 'contact'
  },
  {
    id: 'logout',
    label: '退出登录',
    route: '/logout',
    icon: 'logout'
  }
])

const handleSettingsClick = () => {
  showSettings.value = !showSettings.value
}

const handleClick = (item) => {
  showSettings.value = false

  if (item.id === 'settings') {
    appStore.toggleSettings(true)
  } else if (item.id === 'logout') {
    userStore.logout()
    router.push('/login').catch(() => {})
  } else {
    router.push(item.route).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
$transition: 0.3s cubic-bezier(0.22, 0.7, 0.2, 1);

.sidebar-footer {
  position: relative;
  z-index: 2;
  padding: 10px 8px;
}

.user-profile {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  background: color-mix(in srgb, var(--glass-surface), transparent 22%);
  border: 1px solid
    color-mix(in srgb, var(--glass-surface-border), transparent 24%);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all $transition;

  &:hover {
    background: color-mix(in srgb, var(--color-bg-hover), transparent 16%);
    border-color: color-mix(in srgb, var(--brand-accent), transparent 74%);
  }

  .user-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    overflow: hidden;
    background-color: var(--color-bg-input);
    border: 2px solid
      color-mix(in srgb, var(--color-bg-sidebar), transparent 16%);
    border-radius: 50%;
    box-shadow:
      var(--shadow-sm),
      inset 0 0 0 1px rgb(255 255 255 / 32%);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .user-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-detail {
    font-size: 11px;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-settings-icon {
    color: var(--color-text-muted);
  }

  &.is-collapsed {
    justify-content: center;
    padding: 8px;

    .user-info,
    .user-settings-icon {
      display: none;
    }
  }
}

.sidebar-footer-settings {
  position: absolute;
  right: 8px;
  bottom: 70px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 220px;
  padding: 8px;
  background-color: color-mix(in srgb, var(--glass-surface), transparent 22%);
  border: 1px solid
    color-mix(in srgb, var(--glass-surface-border), transparent 24%);
  border-radius: var(--radius-lg);

  .sidebar-setting-item {
    padding: 8px 12px;
    cursor: pointer;
    background: color-mix(in srgb, var(--glass-surface), transparent 22%);
    border: 1px solid
      color-mix(in srgb, var(--glass-surface-border), transparent 24%);
    border-radius: 8px;
    transition: all $transition;

    &:hover {
      background: color-mix(in srgb, var(--color-bg-hover), transparent 16%);
      border-color: color-mix(in srgb, var(--brand-accent), transparent 74%);
    }
  }
}

.sidebar-label {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
