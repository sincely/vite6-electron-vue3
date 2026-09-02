<template>
  <footer class="global-footer" :style="{ height: `${footerHeight}px` }">
    <div class="global-footer__left">
      <span class="global-footer__item global-footer__item--brand">
        <SvgIcon icon-class="office-building" width="11px" height="11px" />
        {{ company.shortName }}
      </span>
      <span class="global-footer__separator" />
      <span class="global-footer__item global-footer__item--version">
        v{{ currentVersion || '--' }}
      </span>
    </div>

    <div class="global-footer__center">
      <span class="global-footer__item">
        © {{ copyrightYear }} {{ company.fullName }} 版权所有
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

// 公司信息（可按需修改或抽到独立配置文件）
const company = {
  shortName: import.meta.env.VITE_COMPANY_SHORT_NAME || '闪电科技',
  fullName: import.meta.env.VITE_COMPANY_FULL_NAME || '闪电科技有限公司'
}

// 版权年份（跟随当前年份）
const copyrightYear = new Date().getFullYear()
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
    transition: color 0.2s ease;

    &--brand {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    &--version {
      font-family: var(--font-mono, monospace);
      color: var(--color-text-tertiary, var(--color-text-secondary));
    }

    &--link {
      text-decoration: none;
      cursor: pointer;

      &:hover {
        color: var(--color-primary, #1890ff);
      }
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
