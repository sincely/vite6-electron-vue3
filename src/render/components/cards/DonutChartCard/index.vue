<!-- 环形图卡片：左侧数值说明 + 右侧双片饼图 -->
<template>
  <div class="donut-chart-card" :style="{ height: `${height}rem` }">
    <div class="donut-chart-card__left">
      <p class="donut-chart-card__title">{{ title }}</p>
      <div>
        <p class="donut-chart-card__value">{{ formatNumber(value) }}</p>
        <div
          class="donut-chart-card__trend"
          :class="percentage > 0 ? 'is-up' : 'is-down'"
        >
          {{ percentage > 0 ? '+' : '' }}{{ percentage }}%
          <span v-if="percentageLabel">{{ percentageLabel }}</span>
        </div>
      </div>
      <div class="donut-chart-card__legend">
        <div v-if="currentValue" class="donut-chart-card__legend-item">
          <span
            class="donut-chart-card__dot"
            :style="{ background: sliceColor }"
          ></span>
          {{ currentValue }}
        </div>
        <div v-if="previousValue" class="donut-chart-card__legend-item">
          <span
            class="donut-chart-card__dot donut-chart-card__dot--prev"
          ></span>
          {{ previousValue }}
        </div>
      </div>
    </div>
    <div class="donut-chart-card__right">
      <div class="donut-chart-card__chart">
        <chart :options="options" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'DonutChartCard' })

const props = defineProps({
  /** 数值 */
  value: { type: Number, required: true },
  /** 标题 */
  title: { type: String, required: true },
  /** 涨跌百分比，正绿负红 */
  percentage: { type: Number, required: true },
  /** 百分比说明文字 */
  percentageLabel: { type: String, default: '' },
  /** 当前周期标签 */
  currentValue: { type: String, default: '' },
  /** 对比周期标签 */
  previousValue: { type: String, default: '' },
  /** 卡片高度（rem） */
  height: { type: Number, default: 9 },
  /** 图表颜色 */
  color: { type: String, default: '' },
  /** 饼图半径 [内, 外] */
  radius: { type: Array, default: () => ['70%', '90%'] },
  /** 双片数据 [当前, 对比] */
  data: { type: Array, default: () => [0, 0] }
})

const { isDark, getThemeColor, onThemeChange } = useChartTheme()

const formatNumber = (num) => num.toLocaleString()

// 当前切片颜色
const sliceColor = computed(() => props.color || getThemeColor())
// 对比切片颜色（暗色适配）
const prevSliceColor = computed(() => (isDark.value ? '#3f3f46' : '#e6e8f7'))

function buildOptions() {
  return {
    series: [
      {
        type: 'pie',
        radius: props.radius,
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          {
            value: props.data[0],
            name: props.currentValue,
            itemStyle: { color: sliceColor.value }
          },
          {
            value: props.data[1],
            name: props.previousValue,
            itemStyle: { color: prevSliceColor.value }
          }
        ]
      }
    ]
  }
}

const options = ref({})
const rebuild = () => {
  options.value = buildOptions()
}
onThemeChange(rebuild)
watch(
  () => [
    props.data,
    props.color,
    props.radius,
    props.currentValue,
    props.previousValue
  ],
  rebuild,
  { deep: true }
)
</script>

<style lang="scss" scoped>
.donut-chart-card {
  display: flex;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);

  &__left {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 8px 20px 20px;
  }

  &__title {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--color-text-primary);
  }

  &__value {
    margin: 10px 0 0;
    font-size: 20px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--color-text-primary);
  }

  &__trend {
    margin-top: 6px;
    font-size: 12px;
    font-weight: 500;

    &.is-up {
      color: var(--color-success);
    }

    &.is-down {
      color: var(--color-danger);
    }
  }

  &__legend {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__legend-item {
    display: flex;
    align-items: center;
  }

  &__dot {
    width: 8px;
    height: 8px;
    margin-right: 8px;
    border-radius: 2px;

    &--prev {
      background: var(--color-border);
    }
  }

  &__right {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    max-width: 160px;
  }

  &__chart {
    width: 100%;
    height: 120px;
  }
}
</style>
