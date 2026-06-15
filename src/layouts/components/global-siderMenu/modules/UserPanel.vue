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
$transition: 0.2s ease;

.sidebar-footer {
  position: relative;
  z-index: 2;
  padding: 8px;
}

.user-profile {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition: all $transition;

  &:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-border-light);
  }

  .user-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    overflow: hidden;
    background-color: var(--color-bg-input);
    border: 2px solid var(--color-border);
    border-radius: 50%;

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
    font-size: 13px;
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
  bottom: 66px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 200px;
  padding: 8px;
  background-color: var(--glass-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);

  .sidebar-setting-item {
    padding: 8px 12px;
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    transition: all $transition;

    &:hover {
      background: var(--color-bg-hover);
      border-color: var(--color-border-light);
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
