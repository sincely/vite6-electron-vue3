<template>
  <div class="card-container">
    <div class="card-header">
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
  padding: 20px;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.card-content {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
</style>
