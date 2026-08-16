<!-- K线图（蜡烛图），支持 dataZoom -->
<template>
  <div class="k-line-chart" :style="{ height }">
    <chart :options="options" />
  </div>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'KLineChart' })

const props = defineProps({
  /** 图表高度 */
  height: { type: String, default: '16rem' },
  /** 自定义色板 [涨色, 跌色] */
  colors: { type: Array, default: null },
  /** 数据：{ time, open, close, high, low }[] */
  data: { type: Array, default: () => [] },
  /** 显示 dataZoom */
  showDataZoom: { type: Boolean, default: false },
  /** dataZoom 起始百分比 */
  dataZoomStart: { type: Number, default: 0 },
  /** dataZoom 结束百分比 */
  dataZoomEnd: { type: Number, default: 100 }
})

const {
  getAxisLineStyle,
  getAxisLabelStyle,
  getAxisTickStyle,
  getSplitLineStyle,
  getAnimationConfig,
  getTooltipStyle,
  onThemeChange
} = useChartTheme()

// 涨/跌颜色
function getActualColors() {
  const defaultUpColor = '#4C87F3'
  const defaultDownColor = '#8BD8FC'
  return {
    upColor: props.colors?.[0] || defaultUpColor,
    downColor: props.colors?.[1] || defaultDownColor
  }
}

function buildOptions() {
  const { upColor, downColor } = getActualColors()

  return {
    grid: {
      top: 20,
      right: 20,
      bottom: props.showDataZoom ? 80 : 20,
      left: 20,
      containLabel: true
    },
    tooltip: getTooltipStyle('axis', {
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        const param = params[0]
        const data = param.data
        return `
          <div style="padding: 5px;">
            <div><strong>时间：</strong>${param.name}</div>
            <div><strong>开盘：</strong>${data[0]}</div>
            <div><strong>收盘：</strong>${data[1]}</div>
            <div><strong>最低：</strong>${data[2]}</div>
            <div><strong>最高：</strong>${data[3]}</div>
          </div>
        `
      }
    }),
    xAxis: {
      type: 'category',
      data: props.data.map((item) => item.time),
      axisTick: getAxisTickStyle(),
      axisLine: getAxisLineStyle(true),
      axisLabel: getAxisLabelStyle(true)
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: getAxisLabelStyle(true),
      axisLine: getAxisLineStyle(true),
      splitLine: getSplitLineStyle(true)
    },
    series: [
      {
        type: 'candlestick',
        data: props.data.map((item) => [
          item.open,
          item.close,
          item.low,
          item.high
        ]),
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upColor,
          borderColor0: downColor,
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        ...getAnimationConfig()
      }
    ],
    dataZoom: props.showDataZoom
      ? [
          {
            type: 'inside',
            start: props.dataZoomStart,
            end: props.dataZoomEnd
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            start: props.dataZoomStart,
            end: props.dataZoomEnd
          }
        ]
      : undefined
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
    props.colors,
    props.showDataZoom,
    props.dataZoomStart,
    props.dataZoomEnd
  ],
  rebuild,
  { deep: true }
)
</script>

<style lang="scss" scoped>
.k-line-chart {
  width: 100%;
}
</style>
