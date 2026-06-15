<template>
  <div
    class="sidebar"
    :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed, 'is-mac': isMac }"
  >
    <!-- Logo 区域 -->
    <GlobalLogo />

    <SidebarMenu />

    <UserPanel />
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import GlobalLogo from '../global-logo/index.vue'
import SidebarMenu from './modules/Menu.vue'
import UserPanel from './modules/UserPanel.vue'
import { isMac } from '@/utils/platform'

const appStore = useAppStore()
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

    &:hover {
      transform: none;
    }

    &::before {
      display: none;
    }
  }
}
</style>
