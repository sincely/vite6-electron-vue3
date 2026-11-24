<template>
  <card class="age-metrics">
    <template #header>
      <div class="dash-header">
        <h4>受众年龄指标</h4>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="280px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 受众年龄分布柱状图
 */
const ages = ['10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80']
const values = [470, 455, 345, 535, 480, 505, 492]

const barOption = ref({})

function buildOptions() {
  const { primary, info, textMuted } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 0, left: 0, bottom: 0, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase()
    },
    xAxis: {
      type: 'category',
      data: ages,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: {
        lineStyle: { type: 'dashed', color: 'rgba(128,128,128,0.25)' }
      },
      axisLabel: { color: textMuted, fontSize: 11 }
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        data: values,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: primary },
              { offset: 1, color: info }
            ]
          }
        }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.age-metrics {
  height: 100%;
}
</style>
