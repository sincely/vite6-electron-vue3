<template>
  <card class="annual-sales">
    <template #header>
      <div class="dash-header">
        <h4>年度销售额</h4>
        <p>按季度统计</p>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="240px" />
      <div class="annual-sales-totals">
        <div class="annual-sales-item">
          <div class="annual-sales-item-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div>
            <p class="annual-sales-item-value">¥200,858</p>
            <span class="annual-sales-item-label">线上销售</span>
          </div>
        </div>
        <div class="annual-sales-item">
          <div class="annual-sales-item-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div>
            <p class="annual-sales-item-value">¥102,927</p>
            <span class="annual-sales-item-label">线下销售</span>
          </div>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { Money, Wallet } from '@element-plus/icons-vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, onThemeChange } = useChartTheme()

const barOption = ref({})

function buildOptions() {
  const { primary } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 0, left: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: [1, 2, 3, 4, 5, 6, 7] },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'bar',
        data: [50, 80, 50, 90, 60, 70, 50],
        barWidth: 26,
        itemStyle: {
          borderRadius: 6,
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
.annual-sales {
  height: 451px;
  overflow: hidden;

  &-totals {
    display: flex;
    justify-content: space-around;
    margin-top: 40px;
  }

  &-item {
    display: flex;
    align-items: center;

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      margin-right: 10px;
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary), transparent 88%);
      border-radius: 10px;

      :deep(.el-icon) {
        font-size: 20px;
      }
    }

    &-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-label {
      font-size: 13px;
      color: var(--color-text-muted);
    }
  }
}
</style>
