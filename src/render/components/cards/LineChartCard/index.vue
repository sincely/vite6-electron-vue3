<!-- 折线图卡片：数值 + 涨跌 + 迷你/大图表 -->
<template>
  <div
    class="line-chart-card"
    :class="{ 'line-chart-card--mini': isMiniChart }"
    :style="{ height: `${height}rem` }"
  >
    <div class="line-chart-card__header">
      <div>
        <p class="line-chart-card__value">{{ value }}</p>
        <p class="line-chart-card__label">{{ label }}</p>
      </div>
      <div
        class="line-chart-card__trend"
        :class="percentage > 0 ? 'is-up' : 'is-down'"
      >
        {{ percentage > 0 ? '+' : '' }}{{ percentage }}%
      </div>
      <div v-if="date" class="line-chart-card__date">{{ date }}</div>
    </div>
    <div
      class="line-chart-card__chart"
      :style="isMiniChart ? {} : { height: `calc(${height}rem - 5rem)` }"
    >
      <chart :options="options" />
    </div>
  </div>
</template>

<script setup>
import { graphic } from 'echarts/core'
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'LineChartCard' })

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
  /** 显示渐变面积 */
  showAreaColor: { type: Boolean, default: false },
  /** 图表数据 */
  chartData: { type: Array, required: true },
  /** 迷你图表模式（图表位于右上角） */
  isMiniChart: { type: Boolean, default: false }
})

const { getThemeColor, hexToRgba, onThemeChange } = useChartTheme()

function buildOptions() {
  const computedColor = props.color || getThemeColor()

  return {
    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        data: props.chartData,
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: computedColor
        },
        areaStyle: props.showAreaColor
          ? {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: hexToRgba(computedColor, 0.2).rgba },
                { offset: 1, color: hexToRgba(computedColor, 0.01).rgba }
              ])
            }
          : undefined
      }
    ]
  }
}

const options = ref({})
const rebuild = () => {
  options.value = buildOptions()
}
onThemeChange(rebuild)
watch(() => [props.chartData, props.color, props.showAreaColor], rebuild, {
  deep: true
})
</script>

<style lang="scss" scoped>
.line-chart-card {
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
    margin-bottom: 10px;
  }

  &__value {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    line-height: 1;
    color: var(--color-text-primary);
  }

  &__label {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--color-text-muted);
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
    color: var(--color-text-muted);
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
    .line-chart-card__trend {
      position: absolute;
      bottom: 20px;
      left: 20px;
    }

    .line-chart-card__chart {
      inset: 20px 20px auto auto;
      width: 40%;
      height: 60px;
    }
  }
}
</style>
