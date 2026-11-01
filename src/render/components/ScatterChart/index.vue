<!-- 散点图 -->
<template>
  <div class="scatter-chart" :style="{ height }">
    <chart :options="options" />
  </div>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'ScatterChart' })

const props = defineProps({
  /** 图表高度 */
  height: { type: String, default: '16rem' },
  /** 自定义色板 */
  colors: { type: Array, default: null },
  /** 数据：{ value: [x, y] }[] */
  data: { type: Array, default: () => [{ value: [0, 0] }, { value: [0, 0] }] },
  /** 数据点大小 */
  symbolSize: { type: Number, default: 14 },
  /** 显示坐标轴标签 */
  showAxisLabel: { type: Boolean, default: true },
  /** 显示坐标轴线 */
  showAxisLine: { type: Boolean, default: true },
  /** 显示分割线 */
  showSplitLine: { type: Boolean, default: true },
  /** 显示提示框 */
  showTooltip: { type: Boolean, default: true }
})

const {
  getThemeColor,
  getDefaultColors,
  getAxisLineStyle,
  getAxisLabelStyle,
  getAxisTickStyle,
  getSplitLineStyle,
  getAnimationConfig,
  getChartColors,
  getTooltipStyle,
  hexToRgba,
  onThemeChange
} = useChartTheme()

const seriesColors = computed(() => props.colors || getDefaultColors())

function buildOptions() {
  const computedColor = seriesColors.value[0] || getThemeColor()
  // 投影色由中性色派生，跟随明暗主题
  const labelColor = getChartColors().label

  return {
    grid: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
      containLabel: true
    },
    tooltip: props.showTooltip
      ? getTooltipStyle('item', {
          formatter: (params) => {
            const [x, y] = params.value
            return `X: ${x}<br/>Y: ${y}`
          }
        })
      : undefined,
    xAxis: {
      type: 'value',
      axisLabel: getAxisLabelStyle(props.showAxisLabel),
      axisLine: getAxisLineStyle(props.showAxisLine),
      axisTick: getAxisTickStyle(),
      splitLine: getSplitLineStyle(props.showSplitLine)
    },
    yAxis: {
      type: 'value',
      axisLabel: getAxisLabelStyle(props.showAxisLabel),
      axisLine: getAxisLineStyle(props.showAxisLine),
      axisTick: getAxisTickStyle(),
      splitLine: getSplitLineStyle(props.showSplitLine)
    },
    series: [
      {
        type: 'scatter',
        data: props.data,
        symbolSize: props.symbolSize,
        itemStyle: {
          color: computedColor,
          shadowBlur: 6,
          shadowColor: hexToRgba(labelColor, 0.1).rgba,
          shadowOffsetY: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: hexToRgba(labelColor, 0.2).rgba
          },
          scale: true
        },
        ...getAnimationConfig()
      }
    ]
  }
}

const options = ref({})
const rebuild = () => {
  options.value = buildOptions()
}
onThemeChange(rebuild)
watch(() => [props.data, props.colors, props.symbolSize], rebuild, {
  deep: true
})
</script>

<style lang="scss" scoped>
.scatter-chart {
  width: 100%;
}
</style>
