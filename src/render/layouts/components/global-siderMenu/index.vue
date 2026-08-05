<template>
  <div
    class="sidebar"
    :class="{
      'sidebar-collapsed': isCollapsed,
      'is-mac': isMac,
      'is-left-mixed': isLeftMixed
    }"
  >
    <!-- Logo 区域 -->
    <GlobalLogo />

    <SidebarMenu />

    <UserPanel v-if="!isLeftMixed" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import GlobalLogo from '../global-logo/index.vue'
import SidebarMenu from './modules/Menu.vue'
import UserPanel from './modules/UserPanel.vue'
import { isMac } from '@/utils/platform'

const appStore = useAppStore()

const isLeftMixed = computed(() => appStore.layoutMode === 'left-mixed')
const isCollapsed = computed(
  () => appStore.sidebarCollapsed || isLeftMixed.value
)
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
  background-color: var(--menu-bg, var(--sidebar-surface-bg));
  background-image: var(--menu-bg-gradient, none);
  border-right: 1px solid var(--menu-border, var(--color-border));
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

  // left-mixed 模式：紧凑图标栏，不显示 logo 文本
  &.is-left-mixed {
    width: var(--sidebar-collapsed-width);

    :deep(.sidebar-item) {
      gap: 0;
      justify-content: center;
      padding: 0;
      margin-inline: 4px;
      border-radius: var(--radius-md);
    }
  }

  // 深色/品牌色风格下的文字颜色调整
  :deep(.sidebar-item) {
    color: var(--menu-text-secondary, var(--color-text-secondary));

    &:hover {
      color: var(--menu-text, var(--color-text-primary));
      background: var(--menu-hover-bg, var(--color-bg-hover));
    }
  }

  :deep(.sidebar-item-active) {
    color: var(--color-primary) !important;
    background: var(--menu-active-bg, var(--brand-accent-soft));
  }

  :deep(.sidebar-icon) {
    color: var(--menu-icon, var(--color-text-muted));
  }

  :deep(.sidebar-label) {
    color: var(--menu-text-secondary, var(--color-text-secondary));
  }
}
</style>
