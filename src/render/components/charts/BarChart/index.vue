<!-- 柱状图：支持单系列 / 多系列 / 堆叠 -->
<template>
  <div class="bar-chart" :style="{ height }">
    <chart :options="options" />
  </div>
</template>

<script setup>
import { graphic } from 'echarts/core'
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'BarChart' })

const props = defineProps({
  /** 图表高度 */
  height: { type: String, default: '16rem' },
  /** 自定义色板 */
  colors: { type: Array, default: null },
  /** 数据：number[] 或 { name, data, barWidth?, stack? }[] */
  data: { type: Array, default: () => [0, 0, 0, 0, 0, 0, 0] },
  /** x 轴类目 */
  xAxisData: { type: Array, default: () => [] },
  /** 柱条宽度 */
  barWidth: { type: [String, Number], default: '40%' },
  /** 是否堆叠 */
  stack: { type: Boolean, default: false },
  /** 圆角大小 */
  borderRadius: { type: [Number, Array], default: 4 },
  /** 显示坐标轴标签 */
  showAxisLabel: { type: Boolean, default: true },
  /** 显示坐标轴线 */
  showAxisLine: { type: Boolean, default: true },
  /** 显示分割线 */
  showSplitLine: { type: Boolean, default: true },
  /** 显示提示框 */
  showTooltip: { type: Boolean, default: true },
  /** 显示图例（仅多系列生效） */
  showLegend: { type: Boolean, default: false },
  /** 图例位置 bottom / top / left / right */
  legendPosition: { type: String, default: 'bottom' }
})

const {
  getThemeColor,
  getDefaultColors,
  lightenColor,
  getAxisLineStyle,
  getAxisLabelStyle,
  getAxisTickStyle,
  getSplitLineStyle,
  getAnimationConfig,
  getTooltipStyle,
  getLegendStyle,
  getGridWithLegend,
  onThemeChange
} = useChartTheme()

// 判断是否为多系列数据
const isMultipleData = computed(() => {
  return (
    Array.isArray(props.data) &&
    props.data.length > 0 &&
    typeof props.data[0] === 'object' &&
    'name' in props.data[0]
  )
})

const seriesColors = computed(() => props.colors || getDefaultColors())

// 获取颜色配置
function getColor(customColor, index) {
  if (customColor) return customColor

  if (index !== undefined) {
    return seriesColors.value[index % seriesColors.value.length]
  }

  // 默认渐变色
  return new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: lightenColor(getThemeColor(), 0.4) },
    { offset: 1, color: getThemeColor() }
  ])
}

// 将纯色包装为渐变对象，保持 itemStyle.color 类型一致
function createGradientColor(color) {
  return new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color },
    { offset: 1, color }
  ])
}

// 柱条基础样式
function getBaseItemStyle(color) {
  return {
    borderRadius: props.borderRadius,
    color: typeof color === 'string' ? createGradientColor(color) : color
  }
}

// 创建系列配置
function createSeriesItem(config) {
  return {
    name: config.name,
    data: config.data,
    type: 'bar',
    stack: config.stack,
    itemStyle: getBaseItemStyle(config.color),
    barWidth: config.barWidth || props.barWidth,
    showBackground: false,
    ...getAnimationConfig()
  }
}

function buildOptions() {
  const options = {
    grid: getGridWithLegend(
      props.showLegend && isMultipleData.value,
      props.legendPosition,
      {
        top: 15,
        right: 0,
        left: 0
      }
    ),
    tooltip: props.showTooltip ? getTooltipStyle() : undefined,
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisTick: getAxisTickStyle(),
      axisLine: getAxisLineStyle(props.showAxisLine),
      axisLabel: getAxisLabelStyle(props.showAxisLabel)
    },
    yAxis: {
      type: 'value',
      axisLabel: getAxisLabelStyle(props.showAxisLabel),
      axisLine: getAxisLineStyle(props.showAxisLine),
      splitLine: getSplitLineStyle(props.showSplitLine)
    }
  }

  // 图例配置（仅多系列）
  if (props.showLegend && isMultipleData.value) {
    options.legend = getLegendStyle(props.legendPosition)
  }

  // 生成系列数据
  if (isMultipleData.value) {
    options.series = props.data.map((item, index) => {
      return createSeriesItem({
        name: item.name,
        data: item.data,
        color: getColor(seriesColors.value[index], index),
        barWidth: item.barWidth,
        stack: props.stack ? item.stack || 'total' : undefined
      })
    })
  } else {
    options.series = [
      createSeriesItem({
        data: props.data,
        color: getColor()
      })
    ]
  }

  return options
}

const options = ref({})
const rebuild = () => {
  options.value = buildOptions()
}
onThemeChange(rebuild)
watch(() => [props.data, props.xAxisData, props.colors], rebuild, {
  deep: true
})
</script>

<style lang="scss" scoped>
.bar-chart {
  width: 100%;
}
</style>
