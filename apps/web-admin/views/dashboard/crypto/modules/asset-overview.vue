<template>
  <card class="asset-overview">
    <template #header>
      <div class="dash-header">
        <h4>资产概览</h4>
      </div>
    </template>
    <template #content>
      <div class="asset-overview-grid">
        <div
          v-for="item in accounts"
          :key="item.label"
          class="asset-overview-item"
        >
          <div class="asset-overview-item-icon" :style="{ color: item.color }">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="asset-overview-item-main">
            <div class="asset-overview-item-label">{{ item.label }}</div>
            <div class="asset-overview-item-value">{{ item.value }}</div>
          </div>
          <div class="asset-overview-item-tail">
            <span class="text-down">▼ {{ item.trend }}</span>
            <span class="asset-overview-item-unit">本年度</span>
          </div>
        </div>
      </div>
      <chart :options="barOption" height="180px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 资产概览：资金 / 交易账户 + 月度对比
 */
const accounts = [
  {
    label: '资金账户',
    value: '$56,180 USD',
    trend: '0.95%',
    icon: 'Wallet',
    color: 'var(--color-primary)'
  },
  {
    label: '交易账户',
    value: '$24,260 USD',
    trend: '0.88%',
    icon: 'TrendCharts',
    color: 'var(--color-success)'
  }
]

const barOption = ref({})

function buildOptions() {
  const { primary, success, textMuted } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 0, left: 0, bottom: 24, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase()
    },
    legend: {
      bottom: 0,
      data: ['资金账户', '交易账户'],
      textStyle: { color: textMuted, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: {
        lineStyle: { type: 'dashed', color: 'rgba(128,128,128,0.25)' }
      },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    series: [
      {
        name: '资金账户',
        type: 'bar',
        barWidth: 12,
        data: [52, 56, 54, 58, 57, 56],
        itemStyle: { color: primary, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '交易账户',
        type: 'bar',
        barWidth: 12,
        data: [22, 25, 24, 26, 25, 24],
        itemStyle: { color: success, borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.asset-overview {
  &-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  &-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 16px;
    background: color-mix(in srgb, var(--color-text-primary), transparent 96%);
    border-radius: 10px;

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: color-mix(in srgb, currentcolor, transparent 88%);
      border-radius: 10px;

      :deep(.el-icon) {
        font-size: 20px;
      }
    }

    &-main {
      flex: 1;
    }

    &-label {
      margin-bottom: 4px;
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    &-value {
      font-size: 17px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    &-tail {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-end;
      font-size: 12px;
    }

    &-unit {
      color: var(--color-text-muted);
    }
  }
}

@media (width <= 900px) {
  .asset-overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
