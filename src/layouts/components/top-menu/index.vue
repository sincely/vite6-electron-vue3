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

      <!-- 二级菜单 Dropdown -->
      <div v-if="item.children?.length" class="top-submenu">
        <div
          v-for="child in item.children"
          :key="child.id"
          class="top-submenu-item"
          :class="{ active: isChildActive(child) }"
          @click.stop="router.push(child.route)"
        >
          {{ child.label }}
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { menuItems } from '@/config/menu'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const mainItems = menuItems.filter((item) => !item.footer)

const isParentActive = (item) => {
  const selfMatch = item.route === route.path
  const childMatch = item.children?.some((c) => c.route === route.path) ?? false
  return selfMatch || childMatch
}

const isChildActive = (child) => child.route === route.path

const handleNav = (item) => {
  if (!item.children?.length) {
    router.push(item.route).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
.top-menu {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 100%;
  margin-left: 20px;
  -webkit-app-region: no-drag;
}

.top-menu-item {
  position: relative;
  display: flex;
  gap: 6px;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s;

  &:hover {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 20%);

    .top-submenu {
      visibility: visible;
      opacity: 1;
      transform: translateY(0);
    }
  }

  &.active {
    font-weight: 500;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
  }
}

.top-submenu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  min-width: 140px;
  padding: 8px 0;
  margin-top: 4px;
  visibility: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  opacity: 0;
  transition: all 0.2s;
  transform: translateY(10px);
}

.top-submenu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all 0.2s;

  &:hover {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 20%);
  }

  &.active {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
  }
}
</style>
