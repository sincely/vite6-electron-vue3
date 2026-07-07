<template>
  <footer class="global-footer" :style="{ height: `${footerHeight}px` }">
    <div class="global-footer__left">
      <span class="global-footer__item">
        <SvgIcon icon-class="cpu" width="11px" height="11px" />
        {{ currentVersion || '--' }}
      </span>
    </div>
    <div class="global-footer__right">
      <span class="global-footer__item global-footer__item--online">
        <span class="global-footer__dot" />
        运行中
      </span>
    </div>
  </footer>
</template>

<script setup>
import { useUpdateStore } from '@/store/modules/version'
import { useAppStore } from '@/store/modules/app'

const updateStore = useUpdateStore()
const appStore = useAppStore()
const currentVersion = computed(() => updateStore.currentVersion)
const footerHeight = computed(() => appStore.footerHeight || 26)
</script>

<style lang="scss" scoped>
.global-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  padding: 0 14px;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);

  &__left,
  &__right {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__item {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 11px;
    color: var(--color-text-muted);
    letter-spacing: 0.2px;

    &--online {
      color: var(--color-success);
    }
  }

  &__dot {
    width: 5px;
    height: 5px;
    background: currentcolor;
    border-radius: 50%;
    animation: dot-pulse 2.4s ease-in-out infinite;
  }
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}
</style>
