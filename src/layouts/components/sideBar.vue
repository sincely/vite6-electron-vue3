<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
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

    <!-- 底部固定区（设置等） -->
    <div class="sidebar-footer">
      <template v-for="item in footerItems" :key="item.id">
        <!-- 子菜单：在按钮上方展开 -->
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
        <!-- 底部固定按钮 -->
        <a
          class="sidebar-item sidebar-item-footer"
          :class="{ 'sidebar-item-active': isParentActive(item) }"
          :title="appStore.sidebarCollapsed ? item.label : ''"
          @click="handleNav(item)"
        >
          <SvgIcon :icon-class="item.icon" class="sidebar-icon" width="16px" height="16px" />
          <span class="sidebar-label">{{ item.label }}</span>
          <SvgIcon
            v-if="item.children?.length && !appStore.sidebarCollapsed"
            icon-class="lucide-chevron-right"
            class="sidebar-chevron"
            :class="{ 'sidebar-chevron-open': isExpanded(item.id) }"
            width="13px"
            height="13px"
          />
        </a>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { useRouter, useRoute } from 'vue-router'
import { menuItems } from '@/config/menu'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

// 按 footer 字段拆分为主导航 / 底部固定
const mainItems = menuItems.filter((item) => !item.footer)
const footerItems = menuItems.filter((item) => item.footer)

// ───── 子菜单展开状态（存 ID 数组）─────
const expandedIds = ref([])
const isExpanded = (id) => expandedIds.value.includes(id)
const toggleExpand = (id) => {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) expandedIds.value.splice(idx, 1)
  else expandedIds.value.push(id)
}

// ───── 当前路由激活状态（computed 保证响应式）─────
// 仅精确匹配父项自身路由才高亮，子路由激活时父项不高亮
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
    // 有子菜单且非折叠状态：切换展开
    toggleExpand(item.id)
  } else {
    // 无子菜单 或 折叠状态：直接跳转
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

  &-collapsed {
    width: var(--sidebar-collapsed-width);
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
    transition:
      background-color $transition,
      color $transition;

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

    &-footer {
      margin-bottom: 0;
    }

    // 二级菜单项：缩进 + 更小字号
    &-child {
      gap: 0;
      height: 32px;
      padding: 0 10px 0 26px;
      margin-bottom: 1px;
      font-size: 12px;
    }
  }

  // 图标
  &-icon {
    flex-shrink: 0;
    color: currentcolor;
    transition: color $transition;
  }

  // 标签文字
  &-label {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 1;
    transition:
      opacity $transition,
      width $transition;
  }

  // 子条目圆点指示器
  &-child-dot {
    flex-shrink: 0;
    width: 4px;
    height: 4px;
    margin-right: 10px;
    background-color: var(--color-text-muted);
    border-radius: 50%;
    transition: background-color $transition;
  }

  &-item-active &-child-dot {
    background-color: var(--color-text-active);
  }

  // 展开箭头
  &-chevron {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--color-text-muted);
    transition:
      transform $transition,
      color $transition;

    &-open {
      transform: rotate(90deg);
    }
  }

  // ── 子菜单容器 ──────────────────────────
  &-submenu {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;

    &-open {
      max-height: 240px; // 最多约 7 个子项
    }
  }

  // 折叠时强制隐藏所有子菜单
  &-collapsed &-submenu {
    max-height: 0 !important;
  }

  // 折叠时隐藏文字
  &-collapsed &-label {
    width: 0;
    pointer-events: none;
    opacity: 0;
  }

  // 折叠时图标居中
  &-collapsed &-item {
    gap: 0;
    justify-content: center;
    padding: 0;
  }

  // ── 底部区域 ────────────────────────────
  &-footer {
    padding: 6px 6px 10px;
    border-top: 1px solid var(--color-border);
  }
}
</style>
