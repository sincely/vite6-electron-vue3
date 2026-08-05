<template>
  <div
    class="logo-block"
    :class="{ 'is-mac': isMac, 'is-top-mode': isTopMenu }"
  >
    <img src="@/assets/bar/icon.png" class="logo-block__img" alt="logo" />
    <span
      class="logo-block__name"
      :class="{
        'is-hidden': (appStore.sidebarCollapsed || isLeftMixed) && !isTopMenu
      }"
    >
      AI Desktop
    </span>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { isMac } from '@/utils/platform'
import { computed } from 'vue'

const appStore = useAppStore()
const isTopMenu = computed(
  () => appStore.layoutMode === 'top' || appStore.layoutMode === 'top-mixed'
)
const isLeftMixed = computed(() => appStore.layoutMode === 'left-mixed')
</script>

<style lang="scss" scoped>
$transition: 0.3s cubic-bezier(0.22, 0.7, 0.2, 1);

.logo-block {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 74px;
  padding: 20px 16px 0;
  cursor: default;
  transition: padding $transition;

  &.is-mac {
    height: 80px;
  }

  &.is-top-mode {
    height: 100%;
    padding: 0;
    padding: 0 16px;
    -webkit-app-region: no-drag;

    &.is-mac {
      height: 100%;
    }
  }

  &__img {
    flex-shrink: 0;
    width: 42px;
    height: 42px;
  }

  &__name {
    margin-left: 12px;
    overflow: hidden;
    font-size: 16px;
    font-weight: 700;
    color: var(--menu-text, var(--color-primary));
    text-overflow: ellipsis;
    letter-spacing: 0.3px;
    white-space: nowrap;
    opacity: 1;
    transition:
      opacity $transition,
      width $transition;

    &.is-hidden {
      width: 0;
      opacity: 0;
    }
  }
}
</style>
