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
  backdrop-filter: blur(16px) saturate(1.06);
  border-right: 1px solid var(--glass-surface-border);
  border-radius: 0;
  transition: width $transition;

  &::before {
    position: absolute;
    inset: 0 0 auto;
    height: 120px;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
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
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 10%) 0%,
      rgb(255 255 255 / 2%) 100%
    );
  }

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
    border-radius: 12px;

    &:hover {
      transform: none;
    }

    &::before {
      display: none;
    }
  }
}
</style>
