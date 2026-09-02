<template>
  <card class="volume-service">
    <template #header>
      <div class="dash-header">
        <h4>业务量与服务水平</h4>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="240px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// 服务类别数据，不同产品的分类标签
const serviceCategories = ['产品A', '产品B', '产品C', '产品D', '产品E']

/**
 * 业务量与服务量数据
 * 展示各产品的业务量和服务量对比，使用堆叠柱状图展示
 */
const volumeServiceData = [
  {
    name: '业务量',
    data: [20, 25, 30, 35, 40]
  },
  {
    name: '服务量',
    data: [30, 35, 40, 45, 50]
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
      data: volumeServiceData.map((item) => item.name),
      textStyle: { color: textSecondary, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: serviceCategories,
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
    series: volumeServiceData.map((item, i) => ({
      name: item.name,
      type: 'bar',
      stack: 'total',
      data: item.data,
      barWidth: '22%',
      itemStyle: {
        color: colors[i],
        // 仅顶部系列加圆角，贴合堆叠效果
        borderRadius: i === volumeServiceData.length - 1 ? [4, 4, 0, 0] : 0
      }
    }))
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.volume-service {
  height: 328px;
  overflow: hidden;
}
</style>
