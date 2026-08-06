<template>
  <Transition name="notif-panel">
    <div
      v-if="store.panelVisible"
      ref="panelRef"
      class="notif-panel"
      @click.stop
    >
      <!-- 头部 -->
      <div class="notif-panel__header">
        <span class="notif-panel__title">消息通知</span>
        <div class="notif-panel__header-actions">
          <button
            v-if="store.hasUnread"
            class="notif-text-btn"
            title="全部标为已读"
            @click="store.markAllRead()"
          >
            <SvgIcon icon-class="check-check" width="13px" height="13px" />
            全部已读
          </button>
          <button
            v-if="store.list.length"
            class="notif-text-btn notif-text-btn--danger"
            title="清空通知"
            @click="store.clear()"
          >
            <SvgIcon icon-class="trash" width="13px" height="13px" />
            清空
          </button>
        </div>
      </div>

      <!-- 列表 -->
      <div class="notif-panel__body">
        <!-- 空状态 -->
        <div v-if="!store.list.length" class="notif-empty">
          <SvgIcon
            icon-class="bell-off"
            width="28px"
            height="28px"
            class="notif-empty__icon"
          />
          <p>暂无通知</p>
        </div>

        <!-- 通知条目 -->
        <TransitionGroup v-else name="notif-item" tag="div" class="notif-list">
          <div
            v-for="item in store.list"
            :key="item.id"
            class="notif-item"
            :class="{ 'notif-item--unread': !item.read }"
            @click="store.markRead(item.id)"
          >
            <!-- 类型图标 -->
            <div
              class="notif-item__icon"
              :class="`notif-item__icon--${item.type}`"
            >
              <SvgIcon
                :icon-class="typeIcon(item.type)"
                width="16px"
                height="16px"
              />
            </div>

            <!-- 内容 -->
            <div class="notif-item__content">
              <div class="notif-item__title">{{ item.title }}</div>
              <div class="notif-item__body">{{ item.body }}</div>
              <div class="notif-item__time">{{ formatTime(item.time) }}</div>
            </div>

            <!-- 未读圆点 -->
            <span v-if="!item.read" class="notif-item__dot" />

            <!-- 删除 -->
            <button
              class="notif-item__remove"
              title="删除"
              @click.stop="store.remove(item.id)"
            >
              <SvgIcon icon-class="close" width="12px" height="12px" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useNotificationStore } from '@/store/modules/notification'

const props = defineProps({
  /** 触发按钮的 ref，点击该元素时不触发外部关闭逻辑，交由按钮自身的 togglePanel 处理 */
  anchorRef: { type: Object, default: null }
})

const store = useNotificationStore()
const panelRef = ref(null)

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

const formatTime = (ts) => {
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return new Date(ts).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 点击外部关闭（捕获阶段，能穿透 @click.stop）
const onClickOutside = (e) => {
  // 点击触发按钮时，交由按钮自身的 togglePanel 逻辑处理，此处忽略
  if (props.anchorRef?.value && props.anchorRef.value.contains(e.target)) return
  if (panelRef.value && !panelRef.value.contains(e.target)) {
    store.setPanelVisible(false)
  }
}
onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>

<style lang="scss" scoped>
.notif-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  width: 340px;
  max-height: 480px;
  overflow: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--color-border-light);
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: 0.2px;
  }

  &__header-actions {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  &__body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border-radius: 4px;
    }
  }
}

// 文字按钮
.notif-text-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  &--danger:hover {
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger), transparent 90%);
  }
}

// 空状态
.notif-empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--color-text-muted);

  &__icon {
    opacity: 0.6;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

// 通知列表
.notif-list {
  padding: 6px 0;
}

// 条目
.notif-item {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: color-mix(in srgb, var(--color-bg-hover), transparent 30%);

    .notif-item__remove {
      opacity: 1;
    }
  }

  &--unread {
    background: color-mix(in srgb, var(--color-primary), transparent 94%);
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-top: 1px;
    border-radius: var(--radius-sm);

    &--info {
      color: var(--color-info);
      background: color-mix(in srgb, var(--color-info), transparent 86%);
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-info), transparent 90%);
    }

    &--success {
      color: var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 86%);
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-success), transparent 90%);
    }

    &--warning {
      color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning), transparent 86%);
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-warning), transparent 90%);
    }

    &--error {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 86%);
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-danger), transparent 90%);
    }

    &--celebrate {
      color: var(--color-celebrate, #fd9816);
      background: color-mix(
        in srgb,
        var(--color-celebrate, #fd9816),
        transparent 86%
      );
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-celebrate, #fd9816), transparent 90%);
    }

    &--announce {
      color: var(--color-announce, #ff506d);
      background: color-mix(
        in srgb,
        var(--color-announce, #ff506d),
        transparent 86%
      );
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-announce, #ff506d), transparent 90%);
    }

    &--exception {
      color: var(--color-exception, #ff725a);
      background: color-mix(
        in srgb,
        var(--color-exception, #ff725a),
        transparent 86%
      );
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-exception, #ff725a), transparent 90%);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__body {
    display: -webkit-box;
    margin-top: 2px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-secondary);
    line-clamp: 2;

    // box-orient: vertical;
  }

  &__time {
    margin-top: 4px;
    font-size: 11px;
    color: var(--color-text-muted);
  }

  &__dot {
    position: absolute;
    top: 12px;
    right: 32px;
    width: 6px;
    height: 6px;
    background: var(--color-primary);
    border-radius: 999px;
  }

  &__remove {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-top: 4px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 4px;
    opacity: 0;
    transition: all 0.15s ease;

    &:hover {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 88%);
    }
  }
}

// 面板动画
.notif-panel-enter-active {
  transition: all 0.22s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.notif-panel-leave-active {
  transition: all 0.16s ease;
}

.notif-panel-enter-from,
.notif-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

// 列表项动画
.notif-item-enter-active {
  transition: all 0.2s ease;
}

.notif-item-leave-active {
  position: absolute;
  width: 100%;
  transition: all 0.18s ease;
}

.notif-item-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.notif-item-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
