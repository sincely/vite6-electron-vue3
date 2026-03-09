<template>
  <section class="page-placeholder page-enter glass-card">
    <div class="placeholder-icon" :style="{ color: color }">
      <SvgIcon :icon-class="icon" width="26px" height="26px" />
    </div>
    <span class="status-pill">{{ tag }}</span>
    <h2 class="placeholder-title">{{ title }}</h2>
    <p class="placeholder-desc">{{ description }}</p>
  </section>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'layout-dashboard' },
  title: { type: String, default: '页面建设中' },
  description: { type: String, default: '正在完善该模块的交互与内容。' },
  tag: { type: String, default: 'UI UX Pro Max' },
  color: { type: String, default: 'var(--color-primary)' }
})
</script>

<style lang="scss" scoped>
.page-placeholder {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 240px;
  padding: 32px;
  text-align: center;
  border-radius: var(--radius-lg);
}

.placeholder-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  background: color-mix(in srgb, currentcolor, transparent 84%);
  border: 1px solid color-mix(in srgb, currentcolor, transparent 66%);
  border-radius: 16px;
}

.placeholder-title {
  font-size: 24px;
  color: var(--color-text-primary);
}

.placeholder-desc {
  max-width: 460px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
</style>
