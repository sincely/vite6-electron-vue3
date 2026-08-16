<template>
  <div
    class="sidebar"
    :class="{
      'sidebar-collapsed': isCollapsed
    }"
  >
    <!-- Logo 区域 -->
    <GlobalLogo />

    <SidebarMenu />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import GlobalLogo from '../global-logo/index.vue'
import SidebarMenu from './modules/Menu.vue'

const appStore = useAppStore()

const isCollapsed = computed(() => appStore.sidebarCollapsed)
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
  border-right: 1px solid var(--color-border);
  transition: width $transition;

  &-collapsed {
    width: var(--sidebar-collapsed-width);
  }

  &-collapsed :deep(.sidebar-submenu) {
    max-height: 0 !important;
  }

  &-collapsed :deep(.sidebar-label) {
    display: none;
  }

  &-collapsed :deep(.sidebar-item) {
    gap: 0;
    justify-content: center;
    padding: 0;
    margin-inline: 4px;
    border-radius: var(--radius-md);
  }

  &-collapsed :deep(.sidebar-item):hover {
    transform: none;
  }

  &-collapsed :deep(.sidebar-item)::before {
    display: none;
  }

  // 深色/品牌色风格下的文字颜色调整
  :deep(.sidebar-item) {
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
    }
  }

  :deep(.sidebar-item-active) {
    color: var(--color-primary) !important;
    background: var(--brand-accent-soft);
  }

  :deep(.sidebar-icon) {
    color: var(--color-menu-icon);
  }

  :deep(.sidebar-label) {
    color: var(--color-text-secondary);
  }
}
</style>
