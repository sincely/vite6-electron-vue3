<template>
  <card class="price-stats">
    <template #header>
      <div class="dash-header">
        <h4>币种价格统计</h4>
      </div>
    </template>
    <template #content>
      <div class="price-stats-hero">
        <span class="price-stats-hero-label">比特币美元价值</span>
        <span class="price-stats-hero-value">$98,420.00</span>
        <span class="price-stats-hero-change text-up">
          上涨 +1,112.00（1.14%） 今日
        </span>
      </div>
      <div class="price-stats-grid">
        <div v-for="item in stats" :key="item.label" class="price-stats-item">
          <span class="price-stats-item-label">{{ item.label }}</span>
          <span class="price-stats-item-value">{{ item.value }}</span>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
/**
 * 比特币价格统计
 */
const stats = [
  { label: '交易额', value: '$35.28 billion' },
  { label: '市场排名', value: '#1' },
  { label: '本周最高', value: '$98,760.24' },
  { label: '本周最低', value: '$95,880.00' },
  { label: '市场占有率', value: '69%' },
  { label: '历史最高', value: '$109,358.01' },
  { label: '24H 波动率', value: '3.46%' },
  { label: '流通供应量', value: '19.72M BTC' },
  { label: '市值估算', value: '$1.94 trillion' }
]
</script>

<style lang="scss" scoped>
.price-stats {
  &-hero {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    margin-bottom: 16px;
    background: color-mix(in srgb, var(--color-primary), transparent 94%);
    border-radius: 10px;

    &-label {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    &-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    &-change {
      font-size: 12px;
    }
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  &-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    background: color-mix(in srgb, var(--color-text-primary), transparent 96%);
    border-radius: 10px;

    &-label {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    &-value {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }
}
</style>
