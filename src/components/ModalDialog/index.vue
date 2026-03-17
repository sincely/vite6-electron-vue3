<template>
  <el-dialog
    v-bind="$attrs"
    ref="dialogRef"
    class="modal-dialog"
    :class="{ 'modal-dialog--glass': glass }"
    :show-close="showClose"
    append-to-body
    align-center
    draggable
  >
    <!-- 顶部装饰光晕 -->
    <div class="modal-dialog__glow" aria-hidden="true"></div>

    <!-- Header 插槽 -->
    <template #header>
      <div class="modal-dialog__header">
        <div class="header-content">
          <div class="header-text">
            <h3 class="header-title">{{ title }}</h3>
          </div>
        </div>
        <div class="header-actions">
          <slot name="header-actions"></slot>
          <!-- 头部按钮 -->
          <template v-for="item in headerActions" :key="item.icon">
            <button
              v-if="item.isShow"
              class="close-btn"
              :title="item.title"
              @click="$emit(item.event, false)"
            >
              <SvgIcon :icon-class="item.icon" width="16px" height="16px" />
            </button>
          </template>
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
defineOptions({
  inheritAttrs: true
})

defineProps({
  title: {
    type: String,
    default: ''
  },
  showClose: {
    type: Boolean,
    default: false
  },
  glass: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue', 'update:download'])

// 获取当前组件插槽
const slots = getCurrentInstance().slots
console.log(slots)

// 头部按钮集合
const headerActions = ref([
  {
    icon: 'download',
    title: '下载',
    isShow: true,
    event: 'update:download'
  },
  {
    icon: 'close',
    title: '取消',
    isShow: true,
    event: 'update:modelValue'
  }
])
</script>

<style lang="scss">
// 注意：el-dialog是append-to-body 的，所以样式不能scoped，或者需要穿透
.modal-dialog {
  overflow: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(5px);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-xl);
  box-shadow:
    var(--glass-shadow-soft),
    0 0 0 1px color-mix(in srgb, var(--color-primary), transparent 80%);

  &__glow {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    pointer-events: none;
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--color-primary), transparent 68%) 0%,
      transparent 70%
    );
    border-radius: 999px;
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

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px;
  }

  &__content {
    padding: 12px;
    font-size: 14px;
    color: var(--color-text-primary);
  }

  &__footer {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px;
  }

  // Body 样式
  .el-dialog__body {
    padding: 0;
  }

  // Footer 样式
  .el-dialog__footer {
    padding: 0;
  }

  // Header 样式
  .el-dialog__header {
    padding: 0;
    margin: 0;
  }
}
</style>
