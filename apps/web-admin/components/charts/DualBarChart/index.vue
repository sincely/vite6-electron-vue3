<!-- 双向堆叠柱状图（正负对比，如年龄分布） -->
<template>
  <div class="dual-bar-chart" :style="{ height }">
    <chart :options="options" />
  </div>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'DualBarChart' })

const props = defineProps({
  /** 图表高度 */
  height: { type: String, default: '16rem' },
  /** 自定义色板 [正向色, 负向色] */
  colors: { type: Array, default: null },
  /** 正向数据 */
  positiveData: { type: Array, default: () => [] },
  /** 负向数据（内部会转为负值） */
  negativeData: { type: Array, default: () => [] },
  /** x 轴类目 */
  xAxisData: { type: Array, default: () => [] },
  /** 正向系列名称 */
  positiveName: { type: String, default: '正向数据' },
  /** 负向系列名称 */
  negativeName: { type: String, default: '负向数据' },
  /** 柱条宽度 */
  barWidth: { type: [String, Number], default: 16 },
  /** y 轴最小值 */
  yAxisMin: { type: Number, default: -100 },
  /** y 轴最大值 */
  yAxisMax: { type: Number, default: 100 },
  /** 显示数据标签 */
  showDataLabel: { type: Boolean, default: false },
  /** 正向柱条圆角 */
  positiveBorderRadius: { type: Array, default: () => [10, 10, 0, 0] },
  /** 负向柱条圆角 */
  negativeBorderRadius: { type: Array, default: () => [0, 0, 10, 10] },
  /** 显示坐标轴标签 */
  showAxisLabel: { type: Boolean, default: true },
  /** 显示坐标轴线 */
  showAxisLine: { type: Boolean, default: false },
  /** 显示分割线 */
  showSplitLine: { type: Boolean, default: false },
  /** 显示提示框 */
  showTooltip: { type: Boolean, default: true },
  /** 显示图例 */
  showLegend: { type: Boolean, default: false },
  /** 图例位置 bottom / top / left / right */
  legendPosition: { type: String, default: 'bottom' }
})

const {
  getDefaultColors,
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

const seriesColors = computed(() => props.colors || getDefaultColors())

// 创建系列配置
function createSeriesConfig(config) {
  return {
    name: config.name,
    type: 'bar',
    stack: 'total',
    barWidth: props.barWidth,
    barGap: '-100%',
    data: config.data,
    showBackground: false,
    itemStyle: {
      borderRadius: config.borderRadius,
      color: seriesColors.value[config.colorIndex]
    },
    label: {
      show: props.showDataLabel,
      position: config.labelPosition,
      formatter: config.formatter || ((params) => String(params.value)),
      color: '#999',
      fontSize: 12
    },
    ...getAnimationConfig()
  }
}

function buildOptions() {
  // 处理负向数据，确保为负值
  const processedNegativeData = props.negativeData.map((val) =>
    val > 0 ? -val : val
  )

  const gridConfig = {
    top: props.showLegend ? 50 : 20,
    right: 0,
    left: 0,
    bottom: 0,
    containLabel: true
  }

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    grid: getGridWithLegend(props.showLegend, props.legendPosition, gridConfig),
    tooltip: props.showTooltip
      ? {
          ...getTooltipStyle(),
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          }
        }
      : undefined,
    legend: props.showLegend
      ? {
          ...getLegendStyle(props.legendPosition),
          data: [props.negativeName, props.positiveName]
        }
      : undefined,
    xAxis: {
      type: 'category',
      data: props.xAxisData,
      axisTick: getAxisTickStyle(),
      axisLine: getAxisLineStyle(props.showAxisLine),
      axisLabel: getAxisLabelStyle(props.showAxisLabel),
      boundaryGap: true
    },
    yAxis: {
      type: 'value',
      min: props.yAxisMin,
      max: props.yAxisMax,
      axisLabel: getAxisLabelStyle(props.showAxisLabel),
      axisLine: getAxisLineStyle(props.showAxisLine),
      splitLine: getSplitLineStyle(props.showSplitLine)
    },
    series: [
      // 负向数据系列
      createSeriesConfig({
        name: props.negativeName,
        data: processedNegativeData,
        borderRadius: props.negativeBorderRadius,
        labelPosition: 'bottom',
        colorIndex: 1,
        formatter: (params) => String(Math.abs(params.value))
      }),
      // 正向数据系列
      createSeriesConfig({
        name: props.positiveName,
        data: props.positiveData,
        borderRadius: props.positiveBorderRadius,
        labelPosition: 'top',
        colorIndex: 0
      })
    ]
  }
}

const options = ref({})
const rebuild = () => {
  options.value = buildOptions()
}
onThemeChange(rebuild)
watch(
  () => [props.positiveData, props.negativeData, props.xAxisData, props.colors],
  rebuild,
  { deep: true }
)
</script>

<style lang="scss" scoped>
.dual-bar-chart {
  width: 100%;
}
</style>
