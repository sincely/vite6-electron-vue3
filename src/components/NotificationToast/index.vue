<template>
  <Teleport to="body">
    <div class="notif-toast-container">
      <TransitionGroup name="notif-toast" tag="div" class="notif-toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="notif-toast"
          :class="`notif-toast--${toast.type}`"
          @click="dismiss(toast.id)"
        >
          <!-- 左侧类型图标 -->
          <div class="notif-toast__icon">
            <SvgIcon
              :icon-class="typeIcon(toast.type)"
              width="16px"
              height="16px"
            />
          </div>

          <!-- 内容 -->
          <div class="notif-toast__content">
            <div class="notif-toast__title">{{ toast.title }}</div>
            <div v-if="toast.body" class="notif-toast__body">
              {{ toast.body }}
            </div>
          </div>

          <!-- 关闭按钮 -->
          <button class="notif-toast__close" @click.stop="dismiss(toast.id)">
            <SvgIcon icon-class="x" width="12px" height="12px" />
          </button>

          <!-- 进度条（倒计时） -->
          <div class="notif-toast__progress">
            <div
              class="notif-toast__progress-fill"
              :style="{ animationDuration: `${DURATION}ms` }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useNotificationStore } from '@/store/modules/notification'

const DURATION = 4000 // 自动消失时间 ms
const MAX_TOASTS = 5 // 最多同时显示条数

const store = useNotificationStore()
const toasts = ref([])
const timers = new Map()

const typeIcon = (type) => {
  const map = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    celebrate: 'celebrate',
    announce: 'announce',
    exception: 'exception'
  }
  return map[type] ?? 'info'
}

const dismiss = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id)
  if (timers.has(id)) {
    clearTimeout(timers.get(id))
    timers.delete(id)
  }
}

// 由外部调用，传入通知对象
const show = (notif) => {
  // 超出最大数时移除最旧的
  if (toasts.value.length >= MAX_TOASTS) {
    const oldest = toasts.value[toasts.value.length - 1]
    dismiss(oldest.id)
  }
  toasts.value.unshift({ ...notif })
  const timer = setTimeout(() => dismiss(notif.id), DURATION)
  timers.set(notif.id, timer)
}

console.log(store.list)

// 监听 store 每次 push action，action 执行完后立即显示 toast
// 使用 $onAction 而非 watch，可以捕获同一 tick 内的每次调用
store.$onAction(({ name, after }) => {
  if (name === 'push') {
    after(() => {
      // action 执行完毕，list[0] 已是最新推入的条目
      show(store.list[0])
    })
  }
})

// 卸载时清除所有定时器
onUnmounted(() => {
  timers.forEach((t) => clearTimeout(t))
  timers.clear()
})
</script>

<style lang="scss" scoped>
.notif-toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 99999;
  pointer-events: none;
}

.notif-toast-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.notif-toast {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 320px;
  padding: 12px 14px 16px;
  overflow: hidden;
  pointer-events: all;
  cursor: pointer;
  background: var(--glass-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateX(-2px);

    .notif-toast__progress-fill {
      animation-play-state: paused;
    }
  }

  // 左侧彩色边框
  &::before {
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    content: '';
    border-radius: 3px 0 0 3px;
  }

  &--info::before {
    background: var(--color-info);
  }

  &--success::before {
    background: var(--color-success);
  }

  &--warning::before {
    background: var(--color-warning);
  }

  &--error::before {
    background: var(--color-danger);
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    margin-top: 1px;
    border-radius: var(--radius-sm);
  }

  &--info .notif-toast__icon {
    color: var(--color-info);
    background: color-mix(in srgb, var(--color-info), transparent 86%);
  }

  &--success .notif-toast__icon {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success), transparent 86%);
  }

  &--warning .notif-toast__icon {
    color: var(--color-warning);
    background: color-mix(in srgb, var(--color-warning), transparent 86%);
  }

  &--error .notif-toast__icon {
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger), transparent 86%);
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__body {
    display: -webkit-box;
    margin-top: 3px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-secondary);
    line-clamp: 2;

    // box-orient: vertical;
  }

  &__close {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-top: 2px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 4px;
    opacity: 0;
    transition: all 0.15s ease;
  }

  &:hover &__close {
    opacity: 1;

    &:hover {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 88%);
    }
  }

  // 底部进度条
  &__progress {
    position: absolute;
    inset: auto 0 0;
    height: 2px;
    overflow: hidden;
    background: color-mix(in srgb, var(--color-border), transparent 40%);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }

  &--info &__progress-fill {
    background: var(--color-info);
  }

  &--success &__progress-fill {
    background: var(--color-success);
  }

  &--warning &__progress-fill {
    background: var(--color-warning);
  }

  &--error &__progress-fill {
    background: var(--color-danger);
  }

  &__progress-fill {
    width: 100%;
    height: 100%;
    transform-origin: left;
    animation: toast-progress linear forwards;

    @keyframes toast-progress {
      from {
        transform: scaleX(1);
      }

      to {
        transform: scaleX(0);
      }
    }
  }
}

// 入场 / 离场动画
.notif-toast-enter-active {
  transition: all 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.notif-toast-leave-active {
  position: absolute;
  transition: all 0.2s ease;
}

.notif-toast-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.94);
}

.notif-toast-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.94);
}

.notif-toast-move {
  transition: transform 0.25s ease;
}
</style>
