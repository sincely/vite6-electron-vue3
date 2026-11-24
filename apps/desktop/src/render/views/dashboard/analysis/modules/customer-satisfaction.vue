<template>
  <card class="customer-satisfaction">
    <template #header>
      <div class="dash-header">
        <h4>客户满意度</h4>
      </div>
    </template>
    <template #content>
      <chart :options="lineOption" height="310px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// X 轴数据配置，表示一周的天数（周一到周日）
const xAxisData = ['1', '2', '3', '4', '5', '6', '7']

/**
 * 客户满意度图表数据
 * 对比上个月和本月的满意度趋势
 */
const chartData = [
  {
    name: '上个月',
    data: [65, 72, 68, 75, 82, 78, 85]
  },
  {
    name: '本月',
    data: [78, 85, 82, 88, 92, 89, 95]
  }
]

const lineOption = ref({})

function buildOptions() {
  const { primary, violet, textSecondary, textMuted, border } = getThemeColors()
  const colors = [primary, violet]

  lineOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 36, right: 10, left: 0, bottom: 0, containLabel: true },
    tooltip: { trigger: 'axis', ...tooltipBase() },
    legend: {
      top: 0,
      data: chartData.map((item) => item.name),
      textStyle: { color: textSecondary, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: border, type: 'dashed' } },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    color: colors,
    series: chartData.map((item, i) => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      lineStyle: { color: colors[i], width: 2.5 },
      itemStyle: { color: colors[i] },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: colors[i] + '14' },
            { offset: 1, color: colors[i] + '00' }
          ]
        }
      }
    }))
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.customer-satisfaction {
  height: 400px;
  overflow: hidden;
}
</style>
