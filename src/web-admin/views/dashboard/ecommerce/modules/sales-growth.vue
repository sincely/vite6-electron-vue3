<template>
  <card class="ec-mini-card">
    <template #header>
      <div class="dash-header">
        <h4 class="ec-mini-card-value">
          <span>12%</span>
          <el-icon class="ec-mini-card-arrow"><TopRight /></el-icon>
        </h4>
        <p>增长</p>
      </div>
    </template>
    <template #content>
      <chart :options="lineOption" height="70px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { TopRight } from '@element-plus/icons-vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, onThemeChange } = useChartTheme()

const lineOption = ref({})

function buildOptions() {
  const { primary } = getThemeColors()

  lineOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 2, right: 0, left: 0, bottom: 0 },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: false,
      data: [1, 2, 3, 4, 5, 6, 7]
    },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: [50, 85, 65, 95, 75, 130, 180],
        smooth: true,
        showSymbol: false,
        lineStyle: { color: primary, width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: primary + '33' },
              { offset: 1, color: primary + '03' }
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
  height: 184px;
  overflow: hidden;

  &-value {
    display: flex;
    align-items: center;
    font-size: 24px !important;
    font-weight: 600;
  }

  &-arrow {
    margin-left: 4px;
    font-size: 16px;
    color: var(--color-success);
  }
}
</style>
