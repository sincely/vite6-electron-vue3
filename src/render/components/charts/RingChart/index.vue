<!-- 环形图 / 饼图：支持中心文字、标签、图例位置 -->
<template>
  <div class="ring-chart" :style="{ height }">
    <chart :options="options" />
  </div>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'RingChart' })

const props = defineProps({
  /** 图表高度 */
  height: { type: String, default: '16rem' },
  /** 自定义色板 */
  colors: { type: Array, default: null },
  /** 数据：{ name, value }[] */
  data: { type: Array, default: () => [] },
  /** 半径 [内, 外]，['0%', '70%'] 即为饼图 */
  radius: { type: Array, default: () => ['50%', '80%'] },
  /** 扇区圆角 */
  borderRadius: { type: Number, default: 10 },
  /** 中心文字 */
  centerText: { type: String, default: '' },
  /** 显示扇区标签 */
  showLabel: { type: Boolean, default: false },
  /** 显示提示框 */
  showTooltip: { type: Boolean, default: true },
  /** 显示图例 */
  showLegend: { type: Boolean, default: false },
  /** 图例位置 bottom / top / left / right */
  legendPosition: { type: String, default: 'right' }
})

const {
  isDark,
  getDefaultColors,
  getAnimationConfig,
  getTooltipStyle,
  getLegendStyle,
  onThemeChange
} = useChartTheme()

const seriesColors = computed(() => props.colors || getDefaultColors())

// 根据图例位置计算环形图中心位置
function getCenterPosition() {
  if (!props.showLegend) return ['50%', '50%']

  switch (props.legendPosition) {
    case 'left':
      return ['60%', '50%']
    case 'right':
      return ['40%', '50%']
    case 'top':
      return ['50%', '60%']
    case 'bottom':
      return ['50%', '40%']
    default:
      return ['50%', '50%']
  }
}

function buildOptions() {
  const options = {
    tooltip: props.showTooltip
      ? getTooltipStyle('item', { formatter: '{b}: {c} ({d}%)' })
      : undefined,
    legend: props.showLegend ? getLegendStyle(props.legendPosition) : undefined,
    series: [
      {
        name: '数据占比',
        type: 'pie',
        radius: props.radius,
        center: getCenterPosition(),
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: props.borderRadius,
          borderColor: isDark.value ? '#2c2c2c' : '#fff',
          borderWidth: 0
        },
        label: {
          show: props.showLabel,
          formatter: '{b}\n{d}%',
          position: 'outside',
          color: isDark.value ? '#ccc' : '#999',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: props.showLabel,
          length: 15,
          length2: 25,
          smooth: true
        },
        data: props.data,
        color: seriesColors.value,
        ...getAnimationConfig(),
        animationType: 'expansion'
      }
    ]
  }

  // 中心文字
  if (props.centerText) {
    const centerPos = getCenterPosition()
    options.title = {
      text: props.centerText,
      left: centerPos[0],
      top: centerPos[1],
      textAlign: 'center',
      textVerticalAlign: 'middle',
      textStyle: {
        fontSize: 18,
        fontWeight: 500,
        color: isDark.value ? '#999' : '#ADB0BC'
      }
    }
  }

  return options
}

const options = ref({})
const rebuild = () => {
  options.value = buildOptions()
}
onThemeChange(rebuild)
watch(() => [props.data, props.centerText, props.colors], rebuild, {
  deep: true
})
</script>

<style lang="scss" scoped>
.ring-chart {
  width: 100%;
}
</style>
