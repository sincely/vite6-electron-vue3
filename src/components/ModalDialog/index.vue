<template>
  <el-dialog
    v-bind="$attrs"
    class="modal-dialog"
    :class="{ 'modal-dialog--glass': glass }"
    :show-close="false"
    append-to-body
    align-center
  >
    <!-- Header 插槽 -->
    <template #header>
      <div class="modal-dialog__header">
        <div class="header-content">
          <div v-if="icon" class="header-icon">
            <SvgIcon :icon-class="icon" width="20px" height="20px" />
          </div>
          <div class="header-text">
            <h3 class="header-title">{{ title }}</h3>
            <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <div class="header-actions">
          <slot name="header-actions"></slot>
          <button
            v-if="showClose"
            class="close-btn"
            title="关闭"
            @click="$emit('update:modelValue', false)"
          >
            <SvgIcon icon-class="close" width="16px" height="16px" />
          </button>
        </div>
      </div>
    </template>

    <!-- Content 插槽 -->
    <div class="modal-dialog__content">
      <slot></slot>
    </div>

    <!-- Footer 插槽 -->
    <template v-if="$slots.footer" #footer>
      <div class="modal-dialog__footer">
        <slot name="footer"></slot>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  showClose: {
    type: Boolean,
    default: true
  },
  glass: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style lang="scss">
// 注意：el-dialog 是 append-to-body 的，所以样式不能 scoped，或者需要穿透
.modal-dialog {
  // 覆盖 el-dialog 默认样式
  --el-dialog-bg-color: var(--color-bg-card);
  --el-dialog-box-shadow: var(--shadow-lg);
  --el-dialog-border-radius: 20px;
  --el-dialog-padding-primary: 0;

  overflow: hidden;
  border: 1px solid var(--color-border);

  // Glassmorphism 变体
  &--glass {
    --el-dialog-bg-color: var(--glass-surface);

    background-color: var(--el-dialog-bg-color);
    backdrop-filter: blur(24px);
    border-color: var(--glass-surface-border);
    box-shadow:
      0 25px 50px -12px rgb(0 0 0 / 25%),
      0 0 0 1px rgb(255 255 255 / 10%) inset;
  }

  // Header 样式
  .el-dialog__header {
    padding: 0;
    margin: 0;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px 24px 0;
    margin-bottom: 20px;
  }

  .header-content {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .header-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    color: var(--color-primary);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary), transparent 85%),
      color-mix(in srgb, var(--brand-accent), transparent 90%)
    );
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 20%);
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .header-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text-primary);
    letter-spacing: -0.01em;
  }

  .header-subtitle {
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--color-text-secondary);
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .close-btn {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
    }
  }

  // Body 样式
  .el-dialog__body {
    padding: 0;
  }

  &__content {
    padding: 0 24px 24px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-text-primary);
  }

  // Footer 样式
  .el-dialog__footer {
    padding: 0;
  }

  &__footer {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 16px 24px;
    background: color-mix(in srgb, var(--el-dialog-bg-color), transparent 50%);
    border-top: 1px solid var(--color-border-light);
  }
}
</style>
