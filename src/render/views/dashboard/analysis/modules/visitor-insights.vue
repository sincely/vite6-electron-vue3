<template>
  <card class="visitor-insights">
    <template #header>
      <div class="dash-header">
        <h4>访客洞察</h4>
      </div>
    </template>
    <template #content>
      <chart :options="lineOption" height="230px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// X 轴数据配置，表示一年的月份（1-12月）
const xAxisData = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12'
]

/**
 * 访客洞察图表数据
 * 对比老客户和新客户的全年访问趋势
 */
const chartData = [
  {
    name: '老客户',
    data: [280, 350, 300, 250, 230, 210, 240, 280, 320, 350, 300, 200]
  },
  {
    name: '新客户',
    data: [260, 200, 150, 130, 180, 270, 340, 380, 300, 220, 170, 130]
  }
]

const lineOption = ref({})

function buildOptions() {
  const { primary, success, textSecondary, textMuted, border } =
    getThemeColors()
  const colors = [primary, success]

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
      itemStyle: { color: colors[i] }
    }))
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.visitor-insights {
  height: 328px;
  overflow: hidden;
}
</style>
