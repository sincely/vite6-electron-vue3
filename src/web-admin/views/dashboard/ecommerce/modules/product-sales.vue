<template>
  <card class="ec-mini-card">
    <template #header>
      <div class="dash-header">
        <h4 class="ec-mini-card-value">
          <span>14.5k</span>
          <el-icon class="ec-mini-card-arrow"><TopRight /></el-icon>
        </h4>
        <p>销售量</p>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="76px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { TopRight } from '@element-plus/icons-vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, onThemeChange } = useChartTheme()

const barOption = ref({})

function buildOptions() {
  const { primary } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 0, right: 0, left: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: [1, 2, 3, 4, 5, 6, 7] },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'bar',
        data: [50, 80, 50, 90, 60, 70, 50],
        barWidth: 16,
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
