<!-- 雷达图 -->
<template>
  <div class="radar-chart" :style="{ height }">
    <chart :options="options" />
  </div>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({ name: 'RadarChart' })

const props = defineProps({
  /** 图表高度 */
  height: { type: String, default: '16rem' },
  /** 自定义色板 */
  colors: { type: Array, default: null },
  /** 雷达指标：{ name, max }[] */
  indicator: { type: Array, default: () => [] },
  /** 数据：{ name, value: number[] }[] */
  data: { type: Array, default: () => [] },
  /** 显示提示框 */
  showTooltip: { type: Boolean, default: true }
})

const { getDefaultColors, getAnimationConfig, getChartColors, getTooltipStyle, hexToRgba, onThemeChange } =
  useChartTheme()

const seriesColors = computed(() => props.colors || getDefaultColors())

function buildOptions() {
  // 中性色实时读取，跟随明暗主题
  const chartColors = getChartColors()
  return {
    tooltip: props.showTooltip ? getTooltipStyle('item') : undefined,
    radar: {
      indicator: props.indicator,
      center: ['50%', '50%'],
      radius: '70%',
      axisName: {
        color: chartColors.label,
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: chartColors.grid
        }
      },
      axisLine: {
        lineStyle: {
          color: chartColors.grid
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          // 扇区分隔底色由网格色派生，避免明暗主题各写一套 rgba
          color: [hexToRgba(chartColors.grid, 0.5).rgba, hexToRgba(chartColors.grid, 0.8).rgba]
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: props.data.map((item, index) => {
          const color = seriesColors.value[index % seriesColors.value.length]
          return {
            name: item.name,
            value: item.value,
            symbolSize: 4,
            lineStyle: {
              width: 2,
              color
            },
            itemStyle: { color },
            areaStyle: {
              color,
              opacity: 0.1
            },
            emphasis: {
              areaStyle: {
                opacity: 0.25
              },
              lineStyle: {
                width: 3
              }
            }
          }
        }),
        ...getAnimationConfig(200, 1800)
      }
    ]
  }
}

const options = ref({})
const rebuild = () => {
  options.value = buildOptions()
}
onThemeChange(rebuild)
watch(() => [props.data, props.indicator, props.colors], rebuild, {
  deep: true
})
</script>

<style lang="scss" scoped>
.radar-chart {
  width: 100%;
}
</style>
