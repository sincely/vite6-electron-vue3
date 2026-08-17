<template>
  <card class="ec-mini-card">
    <template #header>
      <div class="dash-header">
        <h4 class="ec-mini-card-value">55,231</h4>
        <p>商品总数</p>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="104px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, onThemeChange } = useChartTheme()

const barOption = ref({})

function buildOptions() {
  const { primary } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 0, right: 0, left: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: [1, 2, 3, 4, 5, 6] },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'bar',
        data: [50, 80, 40, 90, 60, 70],
        barWidth: 18,
        itemStyle: {
          borderRadius: 4,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: primary + 'b3' },
              { offset: 1, color: primary }
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
.ec-mini-card {
  height: 212px;
  overflow: hidden;

  &-value {
    font-size: 24px !important;
    font-weight: 600;
  }
}
</style>
