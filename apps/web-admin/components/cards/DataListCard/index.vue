<!-- 数据列表卡片：图标 + 标题状态 + 时间，可滚动、可带查看更多按钮 -->
<template>
  <div class="data-list-card">
    <div class="data-list-card__header">
      <p class="data-list-card__title">{{ title }}</p>
      <p class="data-list-card__subtitle">{{ subtitle }}</p>
    </div>
    <ElScrollbar :style="{ height: maxHeight }">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="data-list-card__item"
      >
        <div
          v-if="item.icon"
          class="data-list-card__icon"
          :style="iconStyle(item)"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <div class="data-list-card__main">
          <div class="data-list-card__item-title">{{ item.title }}</div>
          <div class="data-list-card__status">{{ item.status }}</div>
        </div>
        <div class="data-list-card__time">{{ item.time }}</div>
      </div>
    </ElScrollbar>
    <ElButton
      v-if="showMoreButton"
      class="data-list-card__more"
      @click="handleMore"
    >
      查看更多
    </ElButton>
  </div>
</template>

<script setup>
defineOptions({ name: 'DataListCard' })

const props = defineProps({
  /** 数据列表：{ title, status, time, tone, icon } */
  list: { type: Array, required: true },
  /** 标题 */
  title: { type: String, required: true },
  /** 副标题 */
  subtitle: { type: String, default: '' },
  /** 最大显示条数（限高） */
  maxCount: { type: Number, default: 5 },
  /** 是否显示查看更多按钮 */
  showMoreButton: { type: Boolean, default: false }
})

const emit = defineEmits(['more'])

const ITEM_HEIGHT = 66

// 色调映射为项目主题色
const toneColors = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  secondary: 'var(--color-violet)'
}

const maxHeight = computed(() => `${ITEM_HEIGHT * props.maxCount}px`)

const iconStyle = (item) => {
  const color = toneColors[item.tone] || toneColors.primary
  return {
    background: `color-mix(in srgb, ${color} 12%, transparent)`,
    color
  }
}

const handleMore = () => emit('more')
</script>

<style lang="scss" scoped>
.data-list-card {
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

  &__item {
    display: flex;
    align-items: center;
    padding: 12px 0;
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-right: 12px;
    border-radius: 10px;
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__item-title {
    margin-bottom: 4px;
    overflow: hidden;
    font-size: 14px;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__status {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__time {
    margin-left: 12px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__more {
    width: 100%;
    margin-top: 25px;
  }
}
</style>
