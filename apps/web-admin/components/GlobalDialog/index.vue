<template>
  <Teleport to="body">
    <Transition name="glass-dialog">
      <div
        v-if="modelValue"
        class="glass-overlay"
        @click.self="handleOverlayClick"
      >
        <div
          class="glass-dialog"
          :style="{ width, height: height || 'auto' }"
          role="dialog"
          aria-modal="true"
        >
          <!-- 顶部光晕装饰 -->
          <div class="glass-dialog__glow" aria-hidden="true" />

          <!-- Header -->
          <div class="glass-dialog__header">
            <div class="header-content">
              <div v-if="icon" class="header-icon">
                <SvgIcon :icon-class="icon" width="24px" height="24px" />
              </div>
              <div class="header-text">
                <h3 class="header-title">{{ title }}</h3>
                <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <button
              v-if="showClose"
              class="close-btn"
              title="关闭"
              @click="close"
            >
              <SvgIcon icon-class="close" width="16px" height="16px" />
            </button>
          </div>

          <!-- Body -->
          <div class="glass-dialog__body">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="glass-dialog__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
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
  width: {
    type: String,
    default: '500px'
  },
  height: {
    type: String,
    default: ''
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    close()
  }
}
</script>

<style lang="scss" scoped>
.glass-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  background-color: rgb(0 0 0 / 40%);
  backdrop-filter: blur(8px);
}

.glass-dialog {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-surface-border);
  border-radius: 20px;
  box-shadow:
    0 25px 50px -12px rgb(0 0 0 / 25%),
    0 0 0 1px rgb(255 255 255 / 10%) inset;

  &__glow {
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    pointer-events: none;
    background: radial-gradient(
      circle,
      var(--brand-accent-soft) 0%,
      transparent 70%
    );
    filter: blur(60px);
    opacity: 0.5;
  }

  &__header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px 24px 0;
    margin-bottom: 20px;
  }

  &__body {
    position: relative;
    z-index: 1;
    flex: 1;
    padding: 0 24px 24px;
    overflow-y: auto;
  }

  &__footer {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 16px 24px;
    background: color-mix(in srgb, var(--glass-surface), transparent 50%);
    border-top: 1px solid var(--color-border-light);
  }
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

/* Animations */
.glass-dialog-enter-active,
.glass-dialog-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .glass-dialog {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.glass-dialog-enter-from,
.glass-dialog-leave-to {
  opacity: 0;

  .glass-dialog {
    transform: scale(0.95) translateY(10px);
  }
}
</style>
