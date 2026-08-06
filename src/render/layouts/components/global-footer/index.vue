<template>
  <footer class="global-footer" :style="{ height: `${footerHeight}px` }">
    <div class="global-footer__left">
      <span class="global-footer__item global-footer__item--brand">
        <SvgIcon icon-class="rocket" width="11px" height="11px" />
        {{ appName }}
      </span>
      <span class="global-footer__separator" />
      <span class="global-footer__item">
        <SvgIcon icon-class="cpu" width="11px" height="11px" />
        v{{ currentVersion || '--' }}
      </span>
    </div>
    <div class="global-footer__center">
      <span class="global-footer__item">Electron {{ electronVersion }}</span>
      <span class="global-footer__separator" />
      <span class="global-footer__item">Node {{ nodeVersion }}</span>
      <span class="global-footer__separator" />
      <span class="global-footer__item">Chromium {{ chromeVersion }}</span>
      <span class="global-footer__separator" />
      <span class="global-footer__item">
        {{ platformLabel }}
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

// 应用名称
const appName = computed(() => import.meta.env.VITE_APP_NAME || 'lightning')

// 运行时版本信息
const electronVersion = computed(() => window.versions?.electron || '--')
const nodeVersion = computed(() => window.versions?.node || '--')
const chromeVersion = computed(() => window.versions?.chrome || '--')

// 平台信息
const platformMap = {
  darwin: 'macOS',
  win32: 'Windows',
  linux: 'Linux'
}
const platformLabel = computed(() => {
  const platform = window.process?.platform || ''
  return platformMap[platform] || platform || '--'
})
</script>

<style lang="scss" scoped>
.global-footer {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  padding: 0 14px;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);

  &__left,
  &__center,
  &__right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__left {
    min-width: 0;
  }

  &__center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  &__item {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    color: var(--color-text-secondary);
    letter-spacing: 0.2px;
    white-space: nowrap;

    &--brand {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    &--online {
      color: var(--color-success);
    }
  }

  &__separator {
    width: 1px;
    height: 10px;
    background: var(--color-border);
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
