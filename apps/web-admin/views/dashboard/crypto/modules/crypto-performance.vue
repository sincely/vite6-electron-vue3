<template>
  <card class="crypto-performance">
    <template #header>
      <div class="dash-header">
        <h4>加密货币表现</h4>
      </div>
    </template>
    <template #content>
      <div class="crypto-performance-head">
        <div class="crypto-performance-coin">
          <span class="crypto-performance-coin-icon">₿</span>
          <div>
            <div class="crypto-performance-coin-name">比特币 - BTC</div>
            <div class="crypto-performance-coin-desc">
              主力币种 · 24 小时走势
            </div>
          </div>
        </div>
        <div class="crypto-performance-price">
          <div class="crypto-performance-price-value">$43,182.56 USD</div>
          <div class="text-up">0.28%（24小时）</div>
        </div>
      </div>
      <chart :options="lineOption" height="220px" />
      <div class="crypto-performance-ohlc">
        <div
          v-for="item in ohlc"
          :key="item.label"
          class="crypto-performance-ohlc-item"
        >
          <span class="crypto-performance-ohlc-label">{{ item.label }}</span>
          <span class="crypto-performance-ohlc-value">{{ item.value }}</span>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange, hexToRgba } =
  useChartTheme()

/**
 * 比特币 24 小时走势
 */
const ohlc = [
  { label: '开盘', value: '6612.98' },
  { label: '最高', value: '6625.97' },
  { label: '最低', value: '6612.34' },
  { label: '收盘', value: '6623.45' }
]

const lineOption = ref({})

function buildOptions() {
  const { warning, textMuted } = getThemeColors()

  // 24 小时价格曲线
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const prices = [
    6612, 6615, 6618, 6614, 6610, 6616, 6620, 6624, 6619, 6615, 6618, 6622,
    6626, 6621, 6617, 6613, 6616, 6620, 6624, 6628, 6623, 6619, 6622, 6623
  ]

  lineOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 0, left: 0, bottom: 0, containLabel: true },
    tooltip: { trigger: 'axis', ...tooltipBase() },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 11, interval: 3 }
    },
    yAxis: {
      type: 'value',
      min: 6600,
      max: 6640,
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: {
        lineStyle: { type: 'dashed', color: 'rgba(128,128,128,0.25)' }
      },
      axisLabel: { color: textMuted, fontSize: 11 }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: prices,
        lineStyle: { color: warning, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(warning, 0.3).rgba },
              { offset: 1, color: hexToRgba(warning, 0.02).rgba }
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
.crypto-performance {
  &-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &-coin {
    display: flex;
    gap: 12px;
    align-items: center;

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      font-size: 20px;
      font-weight: 700;
      color: #f7931a;
      background: color-mix(in srgb, #f7931a, transparent 88%);
      border-radius: 12px;
    }

    &-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-desc {
      margin-top: 2px;
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }

  &-price {
    text-align: right;

    &-value {
      margin-bottom: 4px;
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .text-up {
      font-size: 12px;
    }
  }

  &-ohlc {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 16px;

    &-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      padding: 12px 0;
      background: color-mix(
        in srgb,
        var(--color-text-primary),
        transparent 96%
      );
      border-radius: 10px;
    }

    &-label {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    &-value {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
}
</style>
