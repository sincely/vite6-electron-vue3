<template>
  <card class="ec-mini-card">
    <template #header>
      <div class="dash-header">
        <h4 class="ec-mini-card-value">205,216</h4>
        <p>这个月增长</p>
      </div>
    </template>
    <template #content>
      <chart :options="ringOption" height="104px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// 订单状态分布
const data = [
  { value: 30, name: '已完成' },
  { value: 25, name: '处理中' },
  { value: 45, name: '待发货' }
]

const COLORS = ['#4C87F3', '#93F1B4', '#8BD8FC']

const ringOption = ref({})

function buildOptions() {
  ringOption.value = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      ...tooltipBase()
    },
    color: COLORS,
    series: [
      {
        name: '订单分布',
        type: 'pie',
        radius: ['56%', '76%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 0 },
        label: { show: false },
        emphasis: { label: { show: false } },
        data
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.ec-mini-card {
  height: 212px;
  overflow: hidden;

  &-value {
    font-size: 24px !important;
    font-weight: 600;
  }
}
</style>
