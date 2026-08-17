<!-- 柱状图卡片：数值 + 涨跌 + 迷你/大图表 -->
<template>
  <div
    class="bar-chart-card"
    :class="{ 'bar-chart-card--mini': isMiniChart }"
    :style="{ height: `${height}rem` }"
  >
    <div class="bar-chart-card__header">
      <div>
        <p class="bar-chart-card__value">{{ value }}</p>
        <p class="bar-chart-card__label">{{ label }}</p>
      </div>
      <div
        class="bar-chart-card__trend"
        :class="percentage > 0 ? 'is-up' : 'is-down'"
      >
        {{ percentage > 0 ? '+' : '' }}{{ percentage }}%
      </div>
      <div v-if="date" class="bar-chart-card__date">{{ date }}</div>
    </div>
    <div
      class="bar-chart-card__chart"
      :style="isMiniChart ? {} : { height: `calc(${height}rem - 5rem)` }"
    >
      <chart :options="options" />
    </div>
  </div>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'BarChartCard' })

const props = defineProps({
  /** 数值 */
  value: { type: Number, required: true },
  /** 标签 */
  label: { type: String, required: true },
  /** 涨跌百分比，正绿负红 */
  percentage: { type: Number, required: true },
  /** 日期说明 */
  date: { type: String, default: '' },
  /** 卡片高度（rem） */
  height: { type: Number, default: 11 },
  /** 图表颜色 */
  color: { type: String, default: '' },
  /** 图表数据 */
  chartData: { type: Array, required: true },
  /** 柱条宽度 */
  barWidth: { type: String, default: '26%' },
  /** 迷你图表模式（图表位于右上角） */
  isMiniChart: { type: Boolean, default: false }
})

const { getThemeColor, onThemeChange } = useChartTheme()

function buildOptions() {
  const computedColor = props.color || getThemeColor()

  return {
    grid: {
      top: 0,
      right: 0,
      bottom: 15,
      left: 0
    },
    xAxis: {
      type: 'category',
      show: false
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        data: props.chartData,
        type: 'bar',
        barWidth: props.barWidth,
        showBackground: false,
        itemStyle: {
          color: computedColor,
          borderRadius: 2
        }
      }
    ]
  }
}

const options = ref({})
const rebuild = () => {
  options.value = buildOptions()
}
onThemeChange(rebuild)
watch(() => [props.chartData, props.color, props.barWidth], rebuild, {
  deep: true
})
</script>

<style lang="scss" scoped>
.bar-chart-card {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px;
    margin-bottom: 20px;
  }

  &__value {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--color-text-primary);
  }

  &__label {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__trend {
    font-size: 14px;
    font-weight: 500;

    &.is-up {
      color: var(--color-success);
    }

    &.is-down {
      color: var(--color-danger);
    }
  }

  &__date {
    position: absolute;
    right: 20px;
    bottom: 20px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__chart {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  // 迷你模式：图表移至右上角，涨跌移至左下角
  &--mini {
    .bar-chart-card__trend {
      position: absolute;
      bottom: 20px;
      left: 20px;
    }

    .bar-chart-card__chart {
      inset: 20px 20px auto auto;
      width: 40%;
      height: 60px;
    }
  }
}
</style>
