<template>
  <nav class="top-menu">
    <div
      v-for="item in mainItems"
      :key="item.id"
      class="top-menu-item"
      :class="{ active: isParentActive(item) }"
      @click="handleNav(item)"
    >
      <SvgIcon
        :icon-class="item.icon"
        class="menu-icon"
        width="16px"
        height="16px"
      />
      <span>{{ item.label }}</span>

      <!-- 二级菜单 Dropdown (仅非混合模式显示) -->
      <div v-if="item.children?.length && !isTopMixed" class="top-submenu">
        <div
          v-for="child in item.children"
          :key="child.id"
          class="top-submenu-item"
          :class="{ active: isChildActive(child) }"
          @click.stop="router.push(child.route)"
        >
          <Icon
            v-if="child.icon"
            :icon="`lucide:${child.icon}`"
            class="top-submenu-icon"
            width="14px"
            height="14px"
          />
          <span>{{ child.label }}</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/store/modules/app'
import { menuItems } from '@/config/menu'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isTopMixed = computed(() => appStore.layoutMode === 'top-mixed')
const mainItems = menuItems.filter((item) => !item.footer)

const isParentActive = (item) => {
  const selfMatch = item.route === route.path
  const childMatch = item.children?.some((c) => c.route === route.path) ?? false
  return selfMatch || childMatch
}

const isChildActive = (child) => child.route === route.path

const handleNav = (item) => {
  if (isTopMixed.value) {
    // top-mixed 模式：点击一级菜单导航到其路由（或第一个子项），子菜单由 MixedSubmenu 组件显示
    if (item.children?.length) {
      router.push(item.children[0].route).catch(() => {})
    } else {
      router.push(item.route).catch(() => {})
    }
  } else if (!item.children?.length) {
    router.push(item.route).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
.top-menu {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 100%;
  margin-left: 24px;
  -webkit-app-region: no-drag;
}

.top-menu-item {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  height: 38px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  .menu-icon {
    color: var(--color-text-secondary);
    transition: color 0.2s ease;
  }

  &::after {
    position: absolute;
    bottom: -13px; // 距离底部的距离，根据 title-bar 高度微调
    left: 50%;
    width: 0;
    height: 3px;
    content: '';
    background: var(--color-primary);
    border-radius: 3px 3px 0 0;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-50%);
  }

  &:hover {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 40%);

    .menu-icon {
      color: var(--color-primary);
    }

    .top-submenu {
      visibility: visible;
      opacity: 1;
    }
  }

  &.active {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);

    .menu-icon {
      color: var(--color-primary);
    }

    &::after {
      width: 24px;
      opacity: 1;
    }
  }
}

.top-submenu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  z-index: 100;
  min-width: 180px;
  padding: 8px;
  visibility: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate(-50%, 10px);

  // 增加隐形感应区，防止鼠标移出时下拉菜单消失过快
  &::before {
    position: absolute;
    top: -12px;
    left: 0;
    width: 100%;
    height: 12px;
    content: '';
    background: transparent;
  }
}

.top-submenu-item {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  &:hover:not(.active) {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 20%);

    .top-submenu-icon {
      color: var(--color-primary);
    }
  }

  &.active,
  &.active:hover {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
    transform: none;

    .top-submenu-icon {
      color: var(--color-primary);
    }

    &::before {
      position: absolute;
      left: 6px;
      width: 3px;
      height: 14px;
      content: '';
      background: var(--color-primary);
      border-radius: 2px;
    }
  }
}

.top-submenu-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}
</style>
