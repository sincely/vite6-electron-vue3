<template>
  <div class="crypto-tickers">
    <card
      v-for="item in tickers"
      :key="item.symbol"
      class="crypto-tickers-card"
    >
      <template #content>
        <div class="crypto-tickers-top">
          <span
            class="crypto-tickers-symbol"
            :style="{
              color: item.color,
              background: `color-mix(in srgb, ${item.color}, transparent 88%)`
            }"
          >
            {{ item.icon }}
          </span>
          <span :class="item.up ? 'text-up' : 'text-down'">
            {{ item.up ? '↑' : '↓' }} {{ item.trend }}
          </span>
        </div>
        <div class="crypto-tickers-value">{{ item.value }}</div>
        <div class="crypto-tickers-label">{{ item.symbol }}</div>
      </template>
    </card>
  </div>
</template>

<script setup>
/**
 * 币种行情卡片
 */
const tickers = [
  {
    icon: '₿',
    symbol: 'BTC',
    value: '21.235',
    trend: '4.21%',
    up: true,
    color: '#f7931a'
  },
  {
    icon: 'Ξ',
    symbol: 'ETH',
    value: '164.75',
    trend: '2.21%',
    up: true,
    color: '#627eea'
  },
  {
    icon: '₮',
    symbol: 'USDT',
    value: '31,421',
    trend: '12.43%',
    up: true,
    color: '#26a17b'
  },
  {
    icon: '◆',
    symbol: 'BNB',
    value: '4,224',
    trend: '15.54%',
    up: false,
    color: '#f3ba2f'
  }
]
</script>

<style lang="scss" scoped>
.crypto-tickers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  &-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 12px;
  }

  &-symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 18px;
    font-weight: 700;
    border-radius: 10px;
  }

  &-value {
    margin-bottom: 4px;
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &-label {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

@media (width <= 1100px) {
  .crypto-tickers {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 640px) {
  .crypto-tickers {
    grid-template-columns: 1fr;
  }
}
</style>
