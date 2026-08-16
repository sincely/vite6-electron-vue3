<template>
  <div class="page-header">
    <div class="header-left">
      <div v-if="icon" class="header-icon">
        <SvgIcon :icon-class="icon" width="20px" height="20px" />
      </div>
      <div class="header-info">
        <h2 class="header-title">{{ title }}</h2>
        <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  color: #fff;
  background: var(--gradient-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-glow-primary);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: scale(1.08) rotate(-3deg);
  }
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.header-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
