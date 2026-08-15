<template>
  <nav class="sidebar-nav">
    <div v-for="item in mainItems" :key="item.id">
      <a
        class="sidebar-item"
        :class="{ 'sidebar-item-active': isParentActive(item) }"
        :title="isCollapsed ? item.label : ''"
        @click="handleNav(item)"
      >
        <div class="sidebar-icon-wrap">
          <Icon
            v-if="item.icon"
            :icon="`lucide:${item.icon}`"
            class="sidebar-icon"
            width="18px"
            height="18px"
          />
          <span
            v-if="isCollapsed && item.showBadge"
            class="menu-badge menu-badge-icon"
          ></span>
        </div>
        <span v-if="!isCollapsed" class="sidebar-label">{{ item.label }}</span>
        <span v-if="!isCollapsed && item.showBadge" class="menu-badge"></span>
        <span
          v-else-if="!isCollapsed && item.showTextBadge"
          class="menu-text-badge"
        >
          {{ item.showTextBadge }}
        </span>
        <SvgIcon
          v-if="item.children?.length && !isCollapsed"
          icon-class="chevron-right"
          class="sidebar-chevron"
          :class="{ 'sidebar-chevron-open': isExpanded(item.id) }"
          width="13px"
          height="13px"
        />
      </a>

      <div
        v-if="item.children?.length"
        class="sidebar-submenu"
        :class="{
          'sidebar-submenu-open': !isCollapsed && isExpanded(item.id)
        }"
      >
        <div class="sidebar-submenu-inner">
          <SubMenuNode
            v-for="child in item.children"
            :key="child.id"
            :item="child"
            :depth="2"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/store/modules/app'
import { menuItems, findMenuPath, containsRoute } from '@/config/menu'
import SubMenuNode from './SubMenuNode.vue'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const mainItems = computed(() => menuItems.filter((item) => !item.footer))
const expandedIds = ref([])

const isCollapsed = computed(() => appStore.sidebarCollapsed)

const isExpanded = (id) => expandedIds.value.includes(id)

// 一级菜单手风琴展开（同时只展开一个）；更深层级各自独立展开
const toggleExpand = (id, level = 1) => {
  const idx = expandedIds.value.indexOf(id)
  if (level <= 1) {
    expandedIds.value = idx >= 0 ? [] : [id]
  } else if (idx >= 0) {
    expandedIds.value.splice(idx, 1)
  } else {
    expandedIds.value.push(id)
  }
}

// 递归子菜单节点（SubMenuNode）通过 inject 共享展开状态
provide('menu-expanded-ids', expandedIds)
provide('menu-toggle-expand', toggleExpand)
provide('menu-collapsed', isCollapsed)

// 展开态仅自身路由命中时高亮；折叠态（纯图标模式）任一后代激活即高亮
const isParentActive = (item) => {
  if (isCollapsed.value) return containsRoute(item, route.path)
  return item.route === route.path
}

watch(
  () => route.path,
  (path) => {
    // 自动展开当前页面的所有祖先菜单（不含页面自身）
    expandedIds.value = findMenuPath(path)
      .slice(0, -1)
      .map((item) => item.id)
  },
  { immediate: true }
)

const handleNav = (item) => {
  if (item.children?.length && !isCollapsed.value) {
    toggleExpand(item.id, 1)
  } else {
    router.push(item.route).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
.sidebar-nav {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: 8px;
  overflow: hidden auto;

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

.sidebar-item {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 42px;
  padding: 0 12px;
  margin-bottom: 4px;
  color: var(--color-text-secondary);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
    border-color: var(--color-border-light);

    .sidebar-icon {
      color: var(--brand-accent);
    }
  }

  &-active {
    font-weight: 600;
    color: var(--color-primary) !important;
    background: var(--brand-accent-soft);
    border-color: color-mix(in srgb, var(--color-primary), transparent 40%);

    .sidebar-icon {
      color: var(--color-primary);
    }

    .sidebar-child-dot {
      background: var(--color-primary);
    }

    .sidebar-child-icon {
      color: var(--color-primary);
    }

    &::before {
      position: absolute;
      inset: 8px auto 8px 0;
      width: 3px;
      content: '';
      background: linear-gradient(
        180deg,
        var(--color-primary),
        var(--color-violet)
      );
      border-radius: 4px;
    }
  }
}

// 子级菜单项（含递归渲染的所有层级，使用 :deep 穿透组件边界；
// :deep 选择器不支持 SCSS & 后缀写法，状态类均平铺书写）
:deep(.sidebar-item-child) {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 36px;
  padding-left: 42px;
  margin-bottom: 2px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  border-radius: var(--radius-sm);
  box-shadow: none;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.sidebar-item-child:hover) {
  background: var(--color-bg-hover);

  .sidebar-child-dot {
    background: var(--color-primary);
    transform: scale(1.4);
  }

  .sidebar-child-icon {
    color: var(--color-primary);
  }
}

:deep(.sidebar-item-child.sidebar-item-active) {
  .sidebar-child-dot {
    background: var(--color-primary);
  }

  .sidebar-child-icon {
    color: var(--color-primary);
  }
}

:deep(.sidebar-item-child::before) {
  display: none;
}

.sidebar-icon {
  color: var(--color-menu-icon);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sidebar-icon-wrap {
  position: relative; // 折叠态红点（.menu-badge-icon）的定位基准
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

// 菜单文字标签（含递归子级内部元素，使用 :deep 穿透）
:deep(.sidebar-label) {
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s;
}

:deep(.sidebar-child-dot) {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 2px;
  background: var(--color-border);
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.sidebar-child-icon) {
  flex-shrink: 0;
  color: var(--color-menu-icon);
  transition: color 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:deep(.sidebar-chevron) {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--color-text-secondary);
  transition: transform 0.2s;
}

:deep(.sidebar-chevron-open) {
  transform: rotate(90deg);
}

:deep(.sidebar-submenu) {
  display: grid;
  grid-template-rows: 0fr;
  margin: 0 4px;
  overflow: hidden;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition:
    grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s ease,
    border-color 0.3s ease;
}

:deep(.sidebar-submenu-inner) {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.25s ease;
}

:deep(.sidebar-submenu-open) {
  position: relative;
  grid-template-rows: 1fr;
  padding: 4px;
  margin: -2px 4px 4px;

  // background: var(--sidebar-surface-bg);
  // border-color: var(--color-border-light);

  .sidebar-submenu-inner {
    opacity: 1;
    transition-delay: 0.08s;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
