<template>
  <div class="page-placeholder">
    <SvgIcon icon-class="lucide-key" width="32px" height="32px" class="page-placeholder__icon" />
    <p class="page-placeholder__title">API 密钥</p>
    <p class="page-placeholder__desc">管理你的 API 访问密钥</p>
  </div>
</template>

<style lang="scss" scoped>
.page-placeholder {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);

  &__icon {
    opacity: 0.4;
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &__desc {
    margin: 0;
    font-size: 13px;
  }
}
</style>
