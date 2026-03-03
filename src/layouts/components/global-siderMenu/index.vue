<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed, 'is-mac': isMac }">
    <!-- Logo 区域 -->
    <GlobalLogo />

    <!-- 主导航 -->
    <nav class="sidebar-nav">
      <template v-for="item in mainItems" :key="item.id">
        <!-- 顶级菜单项 -->
        <a
          class="sidebar-item"
          :class="{ 'sidebar-item-active': isParentActive(item) }"
          :title="appStore.sidebarCollapsed ? item.label : ''"
          @click="handleNav(item)"
        >
          <div class="sidebar-icon-wrap">
            <SvgIcon :icon-class="item.icon" class="sidebar-icon" width="18px" height="18px" />
          </div>
          <span class="sidebar-label">{{ item.label }}</span>
          <!-- 有子菜单时显示箭头指示器 -->
          <SvgIcon
            v-if="item.children?.length && !appStore.sidebarCollapsed"
            icon-class="chevron-right"
            class="sidebar-chevron"
            :class="{ 'sidebar-chevron-open': isExpanded(item.id) }"
            width="13px"
            height="13px"
          />
        </a>
        <!-- 二级子菜单（侧边栏折叠时自动隐藏） -->
        <div
          v-if="item.children?.length"
          class="sidebar-submenu"
          :class="{ 'sidebar-submenu-open': !appStore.sidebarCollapsed && isExpanded(item.id) }"
        >
          <a
            v-for="child in item.children"
            :key="child.id"
            class="sidebar-item sidebar-item-child"
            :class="{ 'sidebar-item-active': isChildActive(child) }"
            @click="router.push(child.route).catch(() => {})"
          >
            <span class="sidebar-child-dot" />
            <span class="sidebar-label">{{ child.label }}</span>
          </a>
        </div>
      </template>
    </nav>

    <!-- 底部用户信息区 -->
    <div class="sidebar-footer">
      <div
        class="user-profile"
        :class="{ 'user-profile-active': route.path.startsWith('/settings') }"
        @click="router.push('/settings')"
      >
        <div class="user-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
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
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'
import { menuItems } from '@/config/menu'
import GlobalLogo from '../global-logo/index.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 检测平台
const isMac = ref(false)
if (typeof process !== 'undefined' && process.platform) {
  isMac.value = process.platform === 'darwin'
} else {
  isMac.value = navigator.platform.toLowerCase().indexOf('mac') >= 0
}

// 按footer字段拆分为主导航（排除底部固定的设置项）
const mainItems = menuItems.filter((item) => !item.footer)

// 子菜单展开状态（存 ID 数组）
const expandedIds = ref([])
const isExpanded = (id) => expandedIds.value.includes(id)
const toggleExpand = (id) => {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) expandedIds.value.splice(idx, 1)
  else expandedIds.value.push(id)
}

// 当前路由激活状态（computed 保证响应式）
// 展开状态：父级只在自身路由匹配时高亮，子菜单有自己的高亮；
// 折叠状态：父级在自身路由或任意子路由匹配时高亮
const isParentActive = (item) => {
  const selfMatch = item.route === route.path
  const childMatch = item.children?.some((c) => c.route === route.path) ?? false
  return appStore.sidebarCollapsed ? selfMatch || childMatch : selfMatch
}
const isChildActive = (child) => child.route === route.path

// 导航到子路由时自动展开父菜单
watch(
  () => route.path,
  (path) => {
    for (const item of menuItems) {
      if (item.children?.some((c) => c.route === path)) {
        if (!expandedIds.value.includes(item.id)) {
          expandedIds.value.push(item.id)
        }
      }
    }
  },
  { immediate: true }
)

// 导航点击逻辑
const handleNav = (item) => {
  if (item.children?.length && !appStore.sidebarCollapsed) {
    toggleExpand(item.id)
  } else {
    router.push(item.route).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
$transition: 0.3s cubic-bezier(0.22, 0.7, 0.2, 1);

.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: var(--sidebar-width);
  height: 100%;
  overflow: hidden;
  background: var(--sidebar-surface-bg);
  backdrop-filter: blur(16px) saturate(1.06);
  border-right: 1px solid var(--glass-surface-border);
  border-radius: 0;
  box-shadow:
    inset -1px 0 0 rgb(255 255 255 / 6%),
    0 22px 44px -30px rgb(2 6 23 / 85%);
  transition: width $transition;

  &::before {
    position: absolute;
    inset: 0 0 auto;
    height: 120px;
    pointer-events: none;
    content: '';
    background: radial-gradient(
        circle at 14% 0%,
        color-mix(in srgb, var(--brand-accent), transparent 82%) 0%,
        transparent 62%
      ),
      radial-gradient(
        circle at 84% 16%,
        color-mix(in srgb, var(--brand-accent-alt), transparent 84%) 0%,
        transparent 58%
      );
    opacity: 0.9;
  }

  &::after {
    position: absolute;
    inset: 0 0 0 auto;
    width: 1px;
    pointer-events: none;
    content: '';
    background: linear-gradient(180deg, rgb(255 255 255 / 10%) 0%, rgb(255 255 255 / 2%) 100%);
  }

  &-collapsed {
    width: var(--sidebar-collapsed-width);
  }

  &-nav {
    position: relative;
    z-index: 2;
    flex: 1;
    padding: 10px 8px;
    overflow: hidden auto;
    mask-image: linear-gradient(to bottom, transparent 0, black 16px, black calc(100% - 16px), transparent 100%);

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: transparent;
      border-radius: 4px;
    }

    &:hover::-webkit-scrollbar-thumb {
      background-color: var(--scrollbar-thumb);
    }
  }

  &-item {
    position: relative;
    display: flex;
    gap: 11px;
    align-items: center;
    height: 46px;
    padding: 0 14px;
    margin-bottom: 7px;
    color: var(--color-text-secondary);
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--color-bg-card), transparent 38%) 0%,
      color-mix(in srgb, var(--color-bg-sidebar), transparent 52%) 100%
    );
    border: 1px solid color-mix(in srgb, var(--glass-surface-border), transparent 52%);
    border-radius: 14px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 6%),
      0 8px 16px -14px rgb(2 6 23 / 78%);
    transition: all 0.24s ease;

    &:hover {
      color: var(--color-text-primary);
      background: color-mix(in srgb, var(--color-bg-hover), transparent 25%);
      border-color: color-mix(in srgb, var(--brand-accent), transparent 72%);
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 8%),
        0 10px 18px -14px color-mix(in srgb, var(--brand-accent), transparent 54%);
      transform: translate3d(2px, -1px, 0);

      .sidebar-icon-wrap {
        background: color-mix(in srgb, var(--brand-accent), transparent 88%);
        border-color: color-mix(in srgb, var(--brand-accent), transparent 76%);
      }

      .sidebar-icon {
        color: var(--brand-accent);
      }
    }

    &-active {
      font-weight: 600;
      color: var(--color-primary) !important;
      background: linear-gradient(
        100deg,
        color-mix(in srgb, var(--color-primary), transparent 86%) 0%,
        color-mix(in srgb, var(--brand-accent-alt), transparent 90%) 100%
      );
      border-color: color-mix(in srgb, var(--color-primary), transparent 66%);
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 12%),
        0 0 0 1px color-mix(in srgb, var(--color-primary), transparent 82%),
        0 8px 20px -12px color-mix(in srgb, var(--color-primary), transparent 38%);

      .sidebar-icon-wrap {
        background: color-mix(in srgb, var(--color-primary), transparent 76%);
        border-color: color-mix(in srgb, var(--color-primary), transparent 66%);
        box-shadow: 0 0 12px -2px color-mix(in srgb, var(--color-primary), transparent 46%);
      }

      .sidebar-icon {
        color: var(--color-primary);
      }

      .sidebar-child-dot {
        background: var(--color-primary);
        box-shadow:
          0 0 0 3px color-mix(in srgb, var(--color-primary), transparent 82%),
          0 0 8px color-mix(in srgb, var(--color-primary), transparent 52%);
      }

      &::before {
        position: absolute;
        inset: 9px auto 9px 4px;
        width: 3px;
        content: '';
        background: linear-gradient(180deg, var(--color-primary) 0%, var(--brand-accent-alt) 100%);
        border-radius: 4px;
        box-shadow: 0 0 8px color-mix(in srgb, var(--color-primary), transparent 30%);
      }
    }

    &-child {
      height: 38px;
      padding-left: 46px;
      margin-bottom: 2px;
      font-size: 13px;
      background: transparent;
      border-color: transparent;
      border-radius: 12px;
      box-shadow: none;
      opacity: 0.96;

      &:hover {
        background: color-mix(in srgb, var(--color-bg-hover), transparent 22%);
        transform: translate3d(0, 0, 0);
      }

      &::before {
        display: none;
      }
    }
  }

  &-icon {
    color: var(--color-text-muted);
    transition: color 0.22s;
  }

  &-icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: color-mix(in srgb, var(--color-bg-input), transparent 25%);
    border: 1px solid color-mix(in srgb, var(--glass-surface-border), transparent 30%);
    border-radius: 10px;
    transition: all 0.22s ease;
  }

  &-label {
    flex: 1;
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.2s;
  }

  &-child-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 2px;
    background: color-mix(in srgb, var(--brand-accent), transparent 15%);
    border-radius: 50%;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-accent), transparent 90%);
  }

  &-chevron {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--color-text-muted);
    transition: transform 0.2s;

    &-open {
      transform: rotate(90deg);
    }
  }

  &-submenu {
    max-height: 0;
    margin: -2px 6px 6px;
    overflow: hidden;
    border: 1px solid transparent;
    border-radius: 12px;
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &-submenu-open {
    position: relative;
    max-height: 240px;
    padding: 4px;
    background: color-mix(in srgb, var(--glass-surface), transparent 18%);
    border-color: color-mix(in srgb, var(--glass-surface-border), transparent 36%);

    &::before {
      position: absolute;
      top: 12px;
      bottom: 12px;
      left: 14px;
      width: 1px;
      content: '';
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--brand-accent), transparent 40%) 0%,
        transparent 100%
      );
      border-radius: 1px;
    }
  }

  &-collapsed &-submenu {
    max-height: 0 !important;
  }

  &-collapsed &-label {
    display: none;
  }

  &-collapsed &-item {
    gap: 0;
    justify-content: center;
    padding: 0;
    margin-inline: 4px;
    border-radius: 12px;

    &:hover {
      transform: none;
    }

    &::before {
      display: none;
    }
  }

  &-footer {
    position: relative;
    z-index: 2;
    padding: 10px 8px;
    border-top: 1px solid color-mix(in srgb, var(--glass-surface-border), transparent 15%);
  }

  .user-profile {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    background: color-mix(in srgb, var(--glass-surface), transparent 22%);
    border: 1px solid color-mix(in srgb, var(--glass-surface-border), transparent 24%);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: all $transition;

    &:hover {
      background: color-mix(in srgb, var(--color-bg-hover), transparent 16%);
      border-color: color-mix(in srgb, var(--brand-accent), transparent 74%);
    }

    &-active {
      background: linear-gradient(
        105deg,
        color-mix(in srgb, var(--color-primary), transparent 88%) 0%,
        color-mix(in srgb, var(--brand-accent-alt), transparent 92%) 100%
      );
      border-color: color-mix(in srgb, var(--color-primary), transparent 70%);
    }

    .user-avatar {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      overflow: hidden;
      background-color: var(--color-bg-input);
      border: 2px solid color-mix(in srgb, var(--color-bg-sidebar), transparent 16%);
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
  }

  &-collapsed .user-profile {
    justify-content: center;
    padding: 0;

    .user-info,
    .user-settings-icon {
      display: none;
    }
  }
}
</style>
