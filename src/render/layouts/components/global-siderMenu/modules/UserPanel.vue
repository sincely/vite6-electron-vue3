<template>
  <div class="sidebar-footer">
    <div class="user-profile" :class="{ 'is-collapsed': isCollapsed }">
      <div class="user-avatar" :title="isCollapsed ? displayName : ''">
        <img
          v-if="userAvatar && !avatarLoadFailed"
          :src="userAvatar"
          :alt="displayName"
          @error="avatarLoadFailed = true"
        />
        <span v-else class="user-avatar-fallback">{{ userInitial }}</span>
      </div>
      <div class="user-info">
        <div class="user-name">{{ displayName }}</div>
        <div class="user-detail">系统管理员</div>
      </div>
      <SvgIcon
        v-if="!isCollapsed"
        icon-class="settings"
        class="user-settings-icon"
        width="18px"
        height="18px"
        @click="handleSettingsClick"
      />
      <div v-if="showSettings && !isCollapsed" class="sidebar-footer-settings">
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()

const showSettings = ref(false)
const avatarLoadFailed = ref(false)

const isLeftMixed = computed(() => appStore.layoutMode === 'left-mixed')
// left-mixed 模式下侧边栏固定为折叠宽度，按折叠态渲染（仅显示头像）
const isCollapsed = computed(
  () => appStore.sidebarCollapsed || isLeftMixed.value
)

const displayName = computed(
  () =>
    userStore.userInfo?.nickname ||
    userStore.userInfo?.name ||
    userStore.userInfo?.username ||
    'Admin'
)
const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())
const userAvatar = computed(() => userStore.userInfo?.avatar || '')
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
  // {
  //   id: 'feedback',
  //   label: '反馈',
  //   route: '/feedback',
  //   icon: 'feedback'
  // },
  // {
  //   id: 'contact',
  //   label: '联系我们',
  //   route: '/contact',
  //   icon: 'contact'
  // },
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

const handleClick = async (item) => {
  showSettings.value = false

  if (item.id === 'settings') {
    appStore.toggleSettings(true)
  } else if (item.id === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'modal-message-box'
      })
      await userStore.logoutAction().catch(() => {})
      // 通知主进程关闭主窗口并打开登录窗口
      window.ipcRenderer?.send('logout')
    } catch {
      // 用户取消退出
    }
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

    .user-avatar-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      background: var(--color-primary);
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
    color: var(--color-text-secondary);
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
