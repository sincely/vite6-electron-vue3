<template>
  <div class="card-container">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.card-container {
  display: flex;
  flex-direction: column;
  padding: 12px 24px;
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--glass-shadow-hover);
    transform: translateY(-4px);
  }
}

.card-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
</style>
