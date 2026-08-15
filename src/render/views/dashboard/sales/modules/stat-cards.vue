<template>
  <div class="sales-stats">
    <card v-for="item in stats" :key="item.label" class="sales-stats-card">
      <template #content>
        <div class="sales-stats-label">{{ item.label }}</div>
        <div class="sales-stats-value">{{ item.value }}</div>
        <div class="sales-stats-trend">
          <span :class="item.up ? 'text-up' : 'text-down'">
            {{ item.up ? '↑' : '↓' }} {{ item.trend }}
          </span>
          <span class="sales-stats-unit">本月</span>
        </div>
      </template>
    </card>
  </div>
</template>

<script setup>
/**
 * 销售看板核心指标卡片
 */
const stats = [
  { label: '总营收', value: '¥46,658', trend: '0.45%', up: true },
  { label: '退款申请', value: '4,654', trend: '4.43%', up: false },
  { label: '订单总数', value: '25,853', trend: '1.25%', up: true },
  { label: '总访客数', value: '63,744', trend: '2.97%', up: true }
]
</script>

<style lang="scss" scoped>
.sales-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  &-label {
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &-value {
    margin-bottom: 8px;
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &-trend {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  &-unit {
    color: var(--color-text-muted);
  }
}

@media (width <= 1100px) {
  .sales-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 640px) {
  .sales-stats {
    grid-template-columns: 1fr;
  }
}
</style>
