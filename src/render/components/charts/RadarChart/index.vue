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

const {
  isDark,
  getDefaultColors,
  getAnimationConfig,
  getTooltipStyle,
  onThemeChange
} = useChartTheme()

const seriesColors = computed(() => props.colors || getDefaultColors())

function buildOptions() {
  return {
    tooltip: props.showTooltip ? getTooltipStyle('item') : undefined,
    radar: {
      indicator: props.indicator,
      center: ['50%', '50%'],
      radius: '70%',
      axisName: {
        color: isDark.value ? '#ccc' : '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: isDark.value ? '#444' : '#e6e6e6'
        }
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? '#444' : '#e6e6e6'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDark.value
            ? ['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)']
            : ['rgba(0, 0, 0, 0.02)', 'rgba(0, 0, 0, 0.05)']
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
