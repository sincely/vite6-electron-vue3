<template>
  <Transition name="notif-panel">
    <div
      v-if="store.panelVisible"
      ref="panelRef"
      class="notif-panel"
      @click.stop
    >
      <!-- 头部 -->
      <div class="notif-panel__header" :class="{ 'is-scrolled': isScrolled }">
        <div class="notif-panel__title-wrap">
          <span class="notif-panel__title">消息通知</span>
          <span v-if="store.hasUnread" class="notif-panel__badge">
            {{ store.unreadCount > 99 ? '99+' : store.unreadCount }} 条未读
          </span>
        </div>
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
      <div
        ref="bodyRef"
        class="notif-panel__body"
        @scroll.passive="onBodyScroll"
      >
        <!-- 空状态 -->
        <div v-if="!store.list.length" class="notif-empty">
          <div class="notif-empty__badge">
            <SvgIcon icon-class="bell-off" width="24px" height="24px" />
          </div>
          <p class="notif-empty__title">暂无通知</p>
          <p class="notif-empty__desc">有新消息时会第一时间在这里提醒你</p>
        </div>

        <!-- 通知条目 -->
        <TransitionGroup
          v-else
          name="notif-item"
          tag="div"
          class="notif-list"
          appear
        >
          <div
            v-for="(item, index) in store.list"
            :key="item.id"
            class="notif-item"
            :class="{ 'notif-item--unread': !item.read }"
            :style="{ '--stagger': Math.min(index, 8) }"
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
const bodyRef = ref(null)
/** 列表是否已滚动（用于头部投影） */
const isScrolled = ref(false)

const onBodyScroll = (e) => {
  isScrolled.value = e.target.scrollTop > 2
}

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
// 类型 → 主题色映射（celebrate/announce/exception 主题变量未定义时使用回退色）
$notif-types: (
  info: var(--color-info),
  success: var(--color-success),
  warning: var(--color-warning),
  error: var(--color-danger),
  celebrate: var(--color-celebrate, #fd9816),
  announce: var(--color-announce, #ff506d),
  exception: var(--color-exception, #ff725a)
);

.notif-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  width: 360px;
  max-height: 480px;
  overflow: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-xl);
  box-shadow:
    0 16px 40px -12px rgb(15 23 42 / 16%),
    var(--shadow-lg);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 12px 12px 16px;
    border-bottom: 1px solid var(--color-border-light);
    transition: box-shadow 0.2s ease;

    &.is-scrolled {
      box-shadow: var(--shadow-md);
    }
  }

  &__title-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: 0.2px;
  }

  // 未读数量徽标
  &__badge {
    flex-shrink: 0;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
    border-radius: 999px;
  }

  &__header-actions {
    display: flex;
    flex-shrink: 0;
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
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 999px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 92%);
  }

  &--danger:hover {
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger), transparent 90%);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-primary), transparent 50%);
    outline-offset: 1px;
  }
}

// 空状态
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;

  &__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 92%);
    border-radius: 50%;
  }

  &__title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__desc {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

// 通知列表
.notif-list {
  position: relative;
  padding: 8px;
}

// 条目
.notif-item {
  position: relative;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background 0.2s ease;

  &:hover {
    background: var(--color-bg-hover);

    .notif-item__remove {
      opacity: 1;
      transform: translateX(0);
    }
  }

  // 未读：主色微染底色 + 标题加重
  &--unread {
    // background: color-mix(in srgb, var(--color-primary), transparent 94%);

    &:hover {
      background: color-mix(in srgb, var(--color-primary), transparent 90%);
    }

    .notif-item__title {
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-top: 1px;
    border-radius: var(--radius-md);

    @each $name, $color in $notif-types {
      &--#{$name} {
        color: #{$color};
        background: color-mix(in srgb, #{$color}, transparent 88%);
      }
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s ease;
  }

  &__body {
    display: -webkit-box;
    margin-top: 3px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-secondary);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__time {
    margin-top: 5px;
    font-size: 11px;
    color: var(--color-text-muted);
  }

  // 未读圆点：主色 + 呼吸光环
  &__dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-top: 6px;
    background: var(--color-primary);
    border-radius: 50%;
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-primary), transparent 84%);
    animation: notif-dot-pulse 2.2s ease-in-out infinite;
  }

  @keyframes notif-dot-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 3px
        color-mix(in srgb, var(--color-primary), transparent 84%);
    }

    50% {
      box-shadow: 0 0 0 6px
        color-mix(in srgb, var(--color-primary), transparent 92%);
    }
  }

  &__remove {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-top: 2px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    opacity: 0;
    transition: all 0.2s ease;
    transform: translateX(4px);

    &:hover {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 88%);
    }

    &:focus-visible {
      outline: 2px solid
        color-mix(in srgb, var(--color-primary), transparent 50%);
      outline-offset: 1px;
      opacity: 1;
      transform: translateX(0);
    }
  }
}

// 面板动画
.notif-panel-enter-active {
  transition: all 0.26s cubic-bezier(0.34, 1.35, 0.64, 1);
}

.notif-panel-leave-active {
  transition: all 0.16s ease;
}

.notif-panel-enter-from,
.notif-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

// 列表项动画（入场按 --stagger 交错延迟）
.notif-item-enter-active {
  transition: all 0.24s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--stagger, 0) * 28ms);
}

.notif-item-leave-active {
  position: absolute;
  width: calc(100% - 16px);
  transition: all 0.18s ease;
}

.notif-item-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}

.notif-item-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

// 减少动态偏好：关闭呼吸与交错动画
@media (prefers-reduced-motion: reduce) {
  .notif-item__dot {
    animation: none;
  }

  .notif-item-enter-active {
    transition-delay: 0ms;
  }
}
</style>
