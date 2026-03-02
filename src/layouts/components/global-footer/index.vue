<template>
  <footer class="global-footer">
    <div class="global-footer__left">
      <span class="global-footer__item">
        <SvgIcon icon-class="lucide-cpu" width="11px" height="11px" />
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
import { useUpdateStore } from '@/store/modules/update'

const updateStore = useUpdateStore()
const currentVersion = computed(() => updateStore.currentVersion)
</script>

<style lang="scss" scoped>
.global-footer {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  padding: 0 14px;
  background: color-mix(in srgb, var(--color-bg-card), transparent 60%);
  border-top: 1px solid color-mix(in srgb, var(--glass-surface-border), transparent 20%);

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
      color: #22c55e;
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
