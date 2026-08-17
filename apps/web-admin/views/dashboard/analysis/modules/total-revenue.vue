<template>
  <card class="total-revenue">
    <template #header>
      <div class="dash-header">
        <h4>总收入</h4>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="310px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// 一周的日期标签
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/**
 * 总收入数据
 * 对比线上和线下销售的一周收入情况
 */
const revenueData = [
  {
    name: '线上销售',
    data: [12, 13, 5, 15, 10, 15, 18]
  },
  {
    name: '线下销售',
    data: [10, 11, 20, 5, 11, 13, 10]
  }
]

const barOption = ref({})

function buildOptions() {
  const { primary, info, textSecondary, textMuted, border } = getThemeColors()
  const colors = [primary, info]

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 36, right: 0, left: 0, bottom: 0, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase()
    },
    legend: {
      top: 0,
      data: revenueData.map((item) => item.name),
      textStyle: { color: textSecondary, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: weekDays,
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
    series: revenueData.map((item, i) => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      barWidth: '18%',
      itemStyle: {
        color: colors[i],
        borderRadius: 4
      }
    }))
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.total-revenue {
  height: 400px;
  overflow: hidden;
}
</style>
