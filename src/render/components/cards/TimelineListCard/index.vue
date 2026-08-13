<!-- 时间轴列表卡片：时间节点 + 内容 + 可选编号 -->
<template>
  <div class="timeline-list-card">
    <div class="timeline-list-card__header">
      <p class="timeline-list-card__title">{{ title }}</p>
      <p class="timeline-list-card__subtitle">{{ subtitle }}</p>
    </div>
    <ElScrollbar :style="{ height: maxHeight }">
      <ElTimeline class="timeline-list-card__timeline">
        <ElTimelineItem
          v-for="item in list"
          :key="item.time + item.content"
          :timestamp="item.time"
          placement="top"
          :color="item.status"
          :center="true"
        >
          <div class="timeline-list-card__content">
            <span class="timeline-list-card__text">{{ item.content }}</span>
            <span v-if="item.code" class="timeline-list-card__code">
              #{{ item.code }}
            </span>
          </div>
        </ElTimelineItem>
      </ElTimeline>
    </ElScrollbar>
  </div>
</template>

<script setup>
defineOptions({ name: 'TimelineListCard' })

const props = defineProps({
  /** 时间轴数据：{ time, status(节点颜色), content, code? } */
  list: { type: Array, required: true },
  /** 标题 */
  title: { type: String, default: '' },
  /** 副标题 */
  subtitle: { type: String, default: '' },
  /** 最大显示条数（限高） */
  maxCount: { type: Number, default: 5 }
})

const ITEM_HEIGHT = 65

const maxHeight = computed(() => `${ITEM_HEIGHT * props.maxCount}px`)
</script>

<style lang="scss" scoped>
.timeline-list-card {
  padding: 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);

  &__header {
    padding-bottom: 14px;
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__subtitle {
    margin: 2px 0 0;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__timeline {
    padding-left: 2px;
  }

  &__content {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__text {
    font-size: 14px;
    color: var(--color-text-primary);
  }

  &__code {
    font-size: 14px;
    color: var(--color-primary);
  }
}
</style>
