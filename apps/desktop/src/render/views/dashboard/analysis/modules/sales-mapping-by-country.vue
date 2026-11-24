<template>
  <card class="sales-mapping">
    <template #header>
      <div class="dash-header">
        <h4>全国销售分布</h4>
      </div>
    </template>
    <template #content>
      <chart :options="ringOption" height="240px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// 全国销售分布数据
const data = [
  { value: 30, name: '北京' },
  { value: 25, name: '上海' },
  { value: 45, name: '广州' }
]

const COLORS = ['#4C87F3', '#93F1B4', '#8BD8FC']

const ringOption = ref({})

function buildOptions() {
  const { textSecondary, bgCard } = getThemeColors()

  ringOption.value = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      ...tooltipBase()
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'center',
      textStyle: { color: textSecondary, fontSize: 12 }
    },
    color: COLORS,
    series: [
      {
        name: '销售分布',
        type: 'pie',
        radius: ['46%', '60%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: bgCard,
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: false }
        },
        data
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.sales-mapping {
  height: 328px;
  overflow: hidden;
}
</style>
