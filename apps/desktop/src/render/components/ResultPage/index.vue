<!-- 结果页基础组件：成功 / 失败两种形态，参考 art-design-pro 的 ArtResultPage -->
<template>
  <section class="result-page glass-card">
    <div class="result-icon" :class="`is-${type}`">
      <SvgIcon :icon-class="type" width="72px" height="72px" />
    </div>
    <h1 class="result-title">{{ title }}</h1>
    <p class="result-message">{{ message }}</p>

    <div v-if="$slots.content" class="result-content">
      <slot name="content" />
    </div>

    <div v-if="$slots.buttons" class="result-buttons">
      <slot name="buttons" />
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: 'ResultPage' })

defineProps({
  /** 结果类型：success / fail */
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'fail'].includes(value)
  },
  /** 标题 */
  title: { type: String, default: '' },
  /** 描述信息 */
  message: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.result-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 240px;
  padding: 56px 32px 48px;
  text-align: center;
  border-radius: var(--radius-lg);
}

.result-icon {
  display: grid;
  place-items: center;
  border-radius: 50%;
  animation: fade-up 0.42s cubic-bezier(0.2, 0.7, 0.2, 1) both;

  &.is-success {
    filter: drop-shadow(0 10px 24px rgb(16 185 129 / 28%));
  }

  &.is-fail {
    filter: drop-shadow(0 10px 24px rgb(239 68 68 / 28%));
  }
}

.result-title {
  margin-top: 26px;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.result-message {
  max-width: 480px;
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.result-content {
  width: 100%;
  max-width: 520px;
  padding: 12px 28px;
  margin-top: 28px;
  text-align: left;
  background: color-mix(in srgb, var(--color-text-secondary) 7%, transparent);
  border-radius: var(--radius-md);

  :deep(p) {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 7px 0;
    font-size: 13px;
    color: var(--color-text-muted);
  }
}

.result-buttons {
  margin-top: 40px;
}
</style>
