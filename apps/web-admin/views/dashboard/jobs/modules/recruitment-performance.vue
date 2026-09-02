<template>
  <card class="recruitment-performance">
    <template #header>
      <div class="dash-header">
        <h4>招聘绩效</h4>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="320px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 招聘绩效：本周 / 本月分组柱状图
 */
const months = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]
const weekData = [42, 48, 39, 55, 30, 45, 31, 47, 52, 35, 43, 36]
const monthData = [48, 60, 45, 90, 28, 47, 26, 45, 60, 29, 46, 31]

const barOption = ref({})

function buildOptions() {
  const { primary, success, textMuted } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 0, left: 0, bottom: 30, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase()
    },
    legend: {
      bottom: 0,
      data: ['本周', '本月'],
      textStyle: { color: textMuted, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: months,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: {
        lineStyle: { type: 'dashed', color: 'rgba(128,128,128,0.25)' }
      },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    series: [
      {
        name: '本周',
        type: 'bar',
        barWidth: 14,
        data: weekData,
        itemStyle: { color: primary, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '本月',
        type: 'bar',
        barWidth: 14,
        data: monthData,
        itemStyle: { color: success, borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.recruitment-performance {
  height: 100%;
}
</style>
