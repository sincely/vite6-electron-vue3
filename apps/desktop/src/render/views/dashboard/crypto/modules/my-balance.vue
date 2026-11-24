<template>
  <card class="my-balance">
    <template #header>
      <div class="dash-header">
        <h4>我的余额</h4>
      </div>
      <el-button class="my-balance-more" size="small">查看全部</el-button>
    </template>
    <template #content>
      <div class="my-balance-total">
        <div class="my-balance-total-value">$24,380.00</div>
        <div class="my-balance-total-desc">总估值：13.84234 BTC</div>
      </div>
      <chart :options="areaOption" height="140px" />
      <div class="my-balance-stats">
        <div class="my-balance-stats-item">
          <span class="my-balance-stats-value">$23,180.00</span>
          <span class="my-balance-stats-label">已投资</span>
        </div>
        <div class="my-balance-stats-item">
          <span class="my-balance-stats-value">$21,960.00</span>
          <span class="my-balance-stats-label">总支出</span>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, onThemeChange, hexToRgba } = useChartTheme()

/**
 * 我的余额：总额 + 走势面积图
 */
const areaOption = ref({})

function buildOptions() {
  const { success } = getThemeColors()

  const data = [22, 24, 23, 26, 25, 28, 27, 30, 29, 27, 28, 24.4]

  areaOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 4, right: 0, left: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        data,
        lineStyle: { color: success, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(success, 0.3).rgba },
              { offset: 1, color: hexToRgba(success, 0.02).rgba }
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
.my-balance {
  &-more {
    margin-left: auto;
  }

  &-total {
    margin-bottom: 12px;

    &-value {
      font-size: 26px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    &-desc {
      margin-top: 4px;
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }

  &-stats {
    display: flex;
    gap: 40px;
    margin-top: 12px;

    &-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    &-label {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}
</style>
