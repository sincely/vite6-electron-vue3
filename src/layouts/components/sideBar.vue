<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': appStore.sidebarCollapsed }">
    <!-- 导航菜单 -->
    <nav class="sidebar__nav">
      <a
        v-for="item in navItems"
        :key="item.id"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': activeId === item.id }"
        :title="appStore.sidebarCollapsed ? item.label : ''"
        @click="handleNav(item)"
      >
        <i :class="['sidebar__icon', item.icon]" />
        <span class="sidebar__label">{{ item.label }}</span>
      </a>
    </nav>

    <!-- 底部区域 -->
    <div class="sidebar__footer">
      <!-- 主题切换 -->
      <a class="sidebar__item sidebar__item--footer" title="切换主题" @click="appStore.toggleTheme()">
        <i :class="['sidebar__icon', appStore.isDark ? 'i-lucide-sun' : 'i-lucide-moon']" />
        <span class="sidebar__label">{{ appStore.isDark ? '浅色模式' : '深色模式' }}</span>
      </a>

      <!-- 状态卡片 -->
      <div v-show="!appStore.sidebarCollapsed" class="sidebar__status">
        <div class="status-card">
          <div class="status-card__row">
            <i class="i-lucide-server status-card__icon" />
            <span class="status-card__text">本地服务</span>
            <i class="i-lucide-chevron-right status-card__chevron" />
          </div>
          <div class="status-card__row status-card__row--sub">
            <span class="status-dot status-dot--online" />
            <span class="status-card__sub">运行中</span>
            <span class="status-card__port">:8317</span>
          </div>
        </div>
      </div>

      <!-- 折叠状态下的状态点 -->
      <div v-show="appStore.sidebarCollapsed" class="sidebar__status-dot-only">
        <span class="status-dot status-dot--online" title="运行中 :8317" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()

const activeId = ref(1)

const navItems = [
  { id: 1, label: '仪表板', icon: 'i-lucide-layout-dashboard', route: '/desktop' },
  { id: 2, label: '配额', icon: 'i-lucide-gauge', route: '/quota' },
  { id: 3, label: '提供商', icon: 'i-lucide-building-2', route: '/providers' },
  { id: 4, label: '回退', icon: 'i-lucide-undo-2', route: '/fallback' },
  { id: 5, label: '代理', icon: 'i-lucide-shield-check', route: '/proxy' },
  { id: 6, label: 'API 密钥', icon: 'i-lucide-key', route: '/apikeys' },
  { id: 7, label: '日志', icon: 'i-lucide-file-text', route: '/logs' },
  { id: 8, label: '设置', icon: 'i-lucide-settings', route: '/settings' },
  { id: 9, label: '关于', icon: 'i-lucide-info', route: '/about' }
]

const handleNav = (item) => {
  activeId.value = item.id
  if (router.hasRoute(item.route?.replace('/', ''))) {
    router.push(item.route).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
$transition: 0.25s ease;

.sidebar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: var(--sidebar-width);
  height: 100%;
  overflow: hidden;
  background-color: var(--color-bg-sidebar);
  border-right: 1px solid var(--color-border);
  border-bottom-left-radius: 10px;
  transition: width $transition;

  &--collapsed {
    width: var(--sidebar-collapsed-width);
  }

  // 导航区域
  &__nav {
    flex: 1;
    padding: 8px 6px;
    overflow: hidden auto;
  }

  // 导航项
  &__item {
    display: flex;
    gap: 10px;
    align-items: center;
    height: 36px;
    padding: 0 10px;
    margin-bottom: 2px;
    color: var(--color-text-secondary);
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    border-radius: 7px;
    transition:
      background-color $transition,
      color $transition;

    &:hover {
      color: var(--color-text-primary);
      background-color: var(--color-bg-hover);
    }

    &--active {
      color: var(--color-text-active) !important;
      background-color: var(--color-bg-active);

      .sidebar__icon {
        color: var(--color-text-active);
      }
    }

    &--footer {
      margin-bottom: 0;
    }
  }

  // 图标
  &__icon {
    flex-shrink: 0;
    font-size: 16px;
    transition: color $transition;
  }

  // 标签文字
  &__label {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 1;
    transition:
      opacity $transition,
      width $transition;
  }

  // 折叠时隐藏文字
  &--collapsed .sidebar__label {
    width: 0;
    pointer-events: none;
    opacity: 0;
  }

  // 折叠时图标居中
  &--collapsed .sidebar__item {
    justify-content: center;
    padding: 0;
  }

  // 底部区域
  &__footer {
    padding: 6px 6px 10px;
    border-top: 1px solid var(--color-border);
  }

  // 状态卡片
  &__status {
    margin-top: 6px;
    overflow: hidden;
  }

  &__status-dot-only {
    display: flex;
    justify-content: center;
    padding: 8px 0 2px;
  }
}

// 状态卡片
.status-card {
  padding: 8px 10px;
  cursor: default;
  background-color: var(--color-bg-status);
  border-radius: 8px;

  &__row {
    display: flex;
    gap: 6px;
    align-items: center;

    &--sub {
      margin-top: 5px;
    }
  }

  &__icon {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &__text {
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__sub {
    font-size: 11px;
    color: var(--color-text-secondary);
  }

  &__port {
    margin-left: auto;
    font-family: monospace;
    font-size: 11px;
    color: var(--color-text-muted);
  }
}

// 在线状态点
.status-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;

  &--online {
    background-color: var(--color-success);
    box-shadow: 0 0 4px var(--color-success);
  }

  &--offline {
    background-color: var(--color-danger);
  }
}
</style>
