<!-- 折线图：支持单系列 / 多系列、渐变面积 -->
<template>
  <div class="line-chart" :style="{ height }">
    <chart :options="options" />
  </div>
</template>

<script setup>
import { graphic } from 'echarts/core'
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'LineChart' })

const props = defineProps({
  /** 图表高度 */
  height: { type: String, default: '16rem' },
  /** 自定义色板 */
  colors: { type: Array, default: null },
  /** 数据：number[] 或 { name, data, lineWidth?, showAreaColor?, areaStyle?, smooth?, symbol? }[] */
  data: { type: Array, default: () => [0, 0, 0, 0, 0, 0, 0] },
  /** x 轴类目 */
  xAxisData: { type: Array, default: () => [] },
  /** 线宽 */
  lineWidth: { type: Number, default: 2.5 },
  /** 显示渐变面积（单系列） */
  showAreaColor: { type: Boolean, default: false },
  /** 平滑曲线 */
  smooth: { type: Boolean, default: true },
  /** 数据点类型 */
  symbol: { type: String, default: 'none' },
  /** 数据点大小 */
  symbolSize: { type: Number, default: 6 },
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
  hexToRgba,
  getAxisLineStyle,
  getAxisLabelStyle,
  getAxisTickStyle,
  getSplitLineStyle,
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

// y 轴最大值
const maxValue = computed(() => {
  if (isMultipleData.value) {
    return props.data.reduce((max, item) => {
      if (item.data?.length) {
        return Math.max(max, Math.max(...item.data))
      }
      return max
    }, 0)
  }
  return props.data?.length ? Math.max(...props.data) : 0
})

// 获取颜色配置
function getColor(customColor, index) {
  if (customColor) return customColor
  if (index !== undefined)
    return seriesColors.value[index % seriesColors.value.length]
  return getThemeColor()
}

// 多系列面积样式
function generateAreaStyle(item, color) {
  // 有 areaStyle 配置或显式开启区域颜色时才显示
  if (!item.areaStyle && !item.showAreaColor && !props.showAreaColor)
    return undefined

  const areaConfig = item.areaStyle || {}
  if (areaConfig.custom) return areaConfig.custom

  return {
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: hexToRgba(color, areaConfig.startOpacity || 0.2).rgba
      },
      { offset: 1, color: hexToRgba(color, areaConfig.endOpacity || 0.02).rgba }
    ])
  }
}

// 单系列面积样式
function generateSingleAreaStyle() {
  if (!props.showAreaColor) return undefined

  const color = getColor(seriesColors.value[0])
  return {
    color: new graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: hexToRgba(color, 0.2).rgba },
      { offset: 1, color: hexToRgba(color, 0.02).rgba }
    ])
  }
}

// 创建系列配置
function createSeriesItem(config) {
  return {
    name: config.name,
    data: config.data,
    type: 'line',
    color: config.color,
    smooth: config.smooth ?? props.smooth,
    symbol: config.symbol ?? props.symbol,
    symbolSize: config.symbolSize ?? props.symbolSize,
    lineStyle: {
      width: config.lineWidth ?? props.lineWidth,
      color: config.color
    },
    areaStyle: config.areaStyle,
    emphasis: {
      focus: 'series',
      lineStyle: {
        width: (config.lineWidth ?? props.lineWidth) + 1
      }
    }
  }
}

function buildOptions() {
  const options = {
    animation: true,
    animationDuration: 1300,
    animationDurationUpdate: 1300,
    grid: getGridWithLegend(
      props.showLegend && isMultipleData.value,
      props.legendPosition,
      {
        top: 15,
        right: 15,
        left: 0
      }
    ),
    tooltip: props.showTooltip ? getTooltipStyle() : undefined,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.xAxisData,
      axisTick: getAxisTickStyle(),
      axisLine: getAxisLineStyle(props.showAxisLine),
      axisLabel: getAxisLabelStyle(props.showAxisLabel)
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: maxValue.value,
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
      const itemColor = getColor(seriesColors.value[index], index)
      return createSeriesItem({
        name: item.name,
        data: item.data,
        color: itemColor,
        smooth: item.smooth,
        symbol: item.symbol,
        lineWidth: item.lineWidth,
        areaStyle: generateAreaStyle(item, itemColor)
      })
    })
  } else {
    options.series = [
      createSeriesItem({
        data: props.data,
        color: getColor(seriesColors.value[0]),
        areaStyle: generateSingleAreaStyle()
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
.line-chart {
  width: 100%;
}
</style>
