<template>
  <card class="sales-trend">
    <template #header>
      <div class="dash-header">
        <h4>销售趋势</h4>
        <p>月度销售对比</p>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="300px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// 正向数据与负向数据
const positiveData = [50, 80, 120, 90, 60]
const negativeData = [30, 60, 90, 70, 40]
const xAxisData = ['一月', '二月', '三月', '四月', '五月']

const barOption = ref({})

function buildOptions() {
  const { primary, info, textSecondary, textMuted } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 36, right: 0, left: 0, bottom: 30, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'none' },
      // 负向数据显示绝对值
      valueFormatter: (value) => Math.abs(value),
      ...tooltipBase()
    },
    legend: {
      bottom: 0,
      data: ['线上销售', '线下销售'],
      textStyle: { color: textSecondary, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: -100,
      max: 100,
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: {
        color: textMuted,
        fontSize: 12,
        formatter: (v) => Math.abs(v)
      }
    },
    series: [
      {
        name: '线下销售',
        type: 'bar',
        stack: 'total',
        barWidth: 16,
        barGap: '-100%',
        data: negativeData.map((v) => -v),
        itemStyle: { color: info, borderRadius: [0, 0, 10, 10] }
      },
      {
        name: '线上销售',
        type: 'bar',
        stack: 'total',
        barWidth: 16,
        data: positiveData,
        itemStyle: { color: primary, borderRadius: [10, 10, 0, 0] }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.sales-trend {
  height: 420px;
  overflow: hidden;
}
</style>
