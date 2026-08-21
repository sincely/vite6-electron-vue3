<template>
  <card class="cart-conversion">
    <template #content>
      <div class="cart-conversion-header">
        <div>
          <p class="cart-conversion-value">2,545</p>
          <p class="cart-conversion-label">购物车转化率</p>
        </div>
        <div class="cart-conversion-percentage">+1.2%</div>
      </div>
      <chart :options="lineOption" height="118px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, onThemeChange } = useChartTheme()

const lineOption = ref({})

function buildOptions() {
  const { primary } = getThemeColors()

  lineOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 0, right: 0, left: 0, bottom: 0 },
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
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
        showSymbol: false,
        lineStyle: { color: primary, width: 3 },
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
.cart-conversion {
  height: 216px;
  overflow: hidden;

  &-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &-value {
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--color-text-primary);
  }

  &-label {
    margin-top: 4px;
    font-size: 13px;
    color: var(--color-text-muted);
  }

  &-percentage {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-success);
  }
}
</style>
