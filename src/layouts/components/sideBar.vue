<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
    <!-- Logo 区域 -->
    <div class="sidebar-logo">
      <img src="@/assets/bar/logo.svg" class="logo-img" alt="logo" />
      <div class="logo-text">{{ appStore.sidebarCollapsed ? '' : 'AI Desktop' }}</div>
    </div>

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
          <SvgIcon :icon-class="item.icon" class="sidebar-icon" width="16px" height="16px" />
          <span class="sidebar-label">{{ item.label }}</span>
          <!-- 有子菜单时显示箭头指示器 -->
          <SvgIcon
            v-if="item.children?.length && !appStore.sidebarCollapsed"
            icon-class="lucide-chevron-right"
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
          icon-class="lucide-settings"
          class="user-settings-icon"
          width="14px"
          height="14px"
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

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 按 footer 字段拆分为主导航（排除底部固定的设置项）
const mainItems = menuItems.filter((item) => !item.footer)

// ───── 子菜单展开状态（存 ID 数组）─────
const expandedIds = ref([])
const isExpanded = (id) => expandedIds.value.includes(id)
const toggleExpand = (id) => {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) expandedIds.value.splice(idx, 1)
  else expandedIds.value.push(id)
}

// ───── 当前路由激活状态（computed 保证响应式）─────
const activeParentIds = computed(() => {
  const ids = new Set()
  for (const item of menuItems) {
    if (item.route === route.path) {
      ids.add(item.id)
    }
  }
  return ids
})

const isParentActive = (item) => activeParentIds.value.has(item.id)
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

// ───── 导航点击逻辑 ─────
const handleNav = (item) => {
  if (item.children?.length && !appStore.sidebarCollapsed) {
    toggleExpand(item.id)
  } else {
    router.push(item.route).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
$transition: 0.2s ease;

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

  &-collapsed {
    width: var(--sidebar-collapsed-width);
  }

  // ── Logo 区域 ──────────────────────────
  &-logo {
    display: flex;
    align-items: center;
    height: 65px;
    padding: 10px 16px;
    cursor: pointer;

    // 底部添加 1px 边框
    border-bottom: 2px solid var(--color-border);

    .logo-img {
      flex-shrink: 0;
      width: 30px;
      height: 30px;
    }

    .logo-text {
      margin-left: 10px;
      overflow: hidden;
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 1;
      transition: opacity $transition;
    }
  }

  &-collapsed &-logo {
    justify-content: center;
    padding: 0;

    .logo-text {
      width: 0;
      opacity: 0;
    }
  }

  // 导航区域
  &-nav {
    flex: 1;
    padding: 8px 6px;
    overflow: hidden auto;
  }

  // ── 通用导航项 ──────────────────────────
  &-item {
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

    &:hover {
      color: var(--color-text-primary);
      background-color: var(--color-bg-hover);
    }

    &-active {
      color: var(--color-text-active) !important;
      background-color: var(--color-bg-active);

      .sidebar-icon {
        color: var(--color-text-active);
      }
    }

    &-child {
      gap: 0;
      height: 32px;
      padding: 0 10px 0 26px;
      margin-bottom: 1px;
      font-size: 12px;
    }
  }

  &-icon {
    flex-shrink: 0;
    color: currentcolor;
  }

  &-label {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 1;
  }

  &-child-dot {
    flex-shrink: 0;
    width: 4px;
    height: 4px;
    margin-right: 10px;
    background-color: var(--color-text-muted);
    border-radius: 50%;
  }

  &-item-active &-child-dot {
    background-color: var(--color-text-active);
  }

  &-chevron {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--color-text-muted);

    &-open {
      transform: rotate(90deg);
    }
  }

  &-submenu {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;

    &-open {
      max-height: 240px;
    }
  }

  &-collapsed &-submenu {
    max-height: 0 !important;
  }

  &-collapsed &-label {
    width: 0;
    pointer-events: none;
    opacity: 0;
  }

  &-collapsed &-item {
    gap: 0;
    justify-content: center;
    padding: 0;
  }

  // ── 底部用户信息区 ──────────────────────
  &-footer {
    padding: 12px 8px;
    border-top: 1px solid var(--color-border);
  }

  .user-profile {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color $transition;

    &:hover {
      background-color: var(--color-bg-hover);
    }

    &-active {
      background-color: var(--color-bg-active);

      .user-name {
        color: var(--color-text-active);
      }
    }

    .user-avatar {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      overflow: hidden;
      background-color: var(--color-bg-input);
      border-radius: 50%;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .user-info {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      opacity: 1;
      transition: opacity $transition;
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
  }

  &-collapsed .user-profile {
    justify-content: center;
    padding: 6px 0;

    .user-info,
    .user-settings-icon {
      display: none;
    }
  }
}
</style>
