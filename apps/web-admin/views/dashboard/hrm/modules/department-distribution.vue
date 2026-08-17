<template>
  <card class="department-distribution">
    <template #header>
      <div class="dash-header">
        <h4>部门分布</h4>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="300px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 部门分布：横向柱状图
 */
const departments = [
  '人力资源部',
  '客服部',
  '销售部',
  '财务部',
  '运营部',
  '市场部',
  '技术研发'
]
const counts = [445, 490, 510, 480, 360, 430, 520]

const barOption = ref({})

function buildOptions() {
  const { primary, textMuted } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 0, right: 20, left: 0, bottom: 0, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase()
    },
    xAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    yAxis: {
      type: 'category',
      data: departments,
      inverse: true,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        barWidth: 12,
        data: counts,
        itemStyle: { color: primary, borderRadius: 4 }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.department-distribution {
  height: 100%;
}
</style>
