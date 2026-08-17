<!-- 统计卡片：文字 / 数字滚动两种模式，plainIcon 为自定义样式模式 -->
<template>
  <div
    class="stats-card"
    :class="{ 'stats-card--plain': plainIcon }"
    :style="cardStyle"
  >
    <div v-if="icon" class="stats-card__icon" :style="iconBoxStyle">
      <el-icon :size="plainIcon ? 30 : 20">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="stats-card__body">
      <p
        v-if="title"
        class="stats-card__title"
        :style="plainIcon ? { color } : {}"
      >
        {{ title }}
      </p>
      <CountTo
        v-if="count !== undefined"
        class="stats-card__count"
        :target="count"
        :duration="2000"
        :decimals="decimals"
        :separator="separator"
      />
      <p v-if="description" class="stats-card__desc">{{ description }}</p>
    </div>
    <div v-if="showArrow" class="stats-card__arrow">
      <el-icon :size="20"><ArrowRight /></el-icon>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'StatsCard' })

const props = defineProps({
  /** Element Plus 图标名（全局注册） */
  icon: { type: String, default: '' },
  /** 标题（文字模式） */
  title: { type: String, default: '' },
  /** 数值（数字滚动模式） */
  count: { type: Number, default: undefined },
  /** 小数位 */
  decimals: { type: Number, default: 0 },
  /** 千分位分隔符 */
  separator: { type: String, default: ',' },
  /** 描述 */
  description: { type: String, default: '' },
  /** 卡片主色 */
  color: { type: String, default: 'var(--color-info)' },
  /** 自定义样式模式：浅色底 + 彩色图标 + 彩色标题 */
  plainIcon: { type: Boolean, default: false },
  /** 是否显示箭头 */
  showArrow: { type: Boolean, default: false }
})

const cardStyle = computed(() => {
  if (!props.plainIcon) return {}
  return { background: `color-mix(in srgb, ${props.color} 10%, transparent)` }
})

const iconBoxStyle = computed(() => {
  if (props.plainIcon) return { color: props.color }
  return { background: props.color, color: '#fff' }
})
</script>

<style lang="scss" scoped>
.stats-card {
  display: flex;
  align-items: center;
  height: 128px;
  padding: 0 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-right: 16px;
    border-radius: 10px;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__count {
    display: block;
    font-size: 24px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__desc {
    margin: 4px 0 0;
    overflow: hidden;
    font-size: 14px;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.9;
  }

  &__arrow {
    margin-left: 8px;
    color: var(--color-text-muted);
  }
}
</style>
