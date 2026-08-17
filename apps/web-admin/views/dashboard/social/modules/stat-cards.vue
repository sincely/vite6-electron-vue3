<template>
  <div class="social-stats">
    <card v-for="item in stats" :key="item.label" class="social-stats-card">
      <template #content>
        <div class="social-stats-top">
          <div class="social-stats-icon" :style="{ color: item.color }">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </div>
          <span :class="item.up ? 'text-up' : 'text-down'">
            {{ item.up ? '↑' : '↓' }} {{ item.trend }}
          </span>
        </div>
        <div class="social-stats-value">{{ item.value }}</div>
        <div class="social-stats-label">{{ item.label }}</div>
      </template>
    </card>
  </div>
</template>

<script setup>
/**
 * 社交媒体核心指标卡片
 */
const stats = [
  {
    label: '总访客',
    value: '128,560',
    trend: '2.74%',
    up: true,
    icon: 'View',
    color: 'var(--color-primary)'
  },
  {
    label: '互动量',
    value: '31,028',
    trend: '1.46%',
    up: true,
    icon: 'ChatDotRound',
    color: 'var(--color-info)'
  },
  {
    label: '点赞数',
    value: '36,102',
    trend: '1.08%',
    up: true,
    icon: 'Star',
    color: 'var(--color-warning)'
  },
  {
    label: '跳出率',
    value: '14.8%',
    trend: '5.12%',
    up: false,
    icon: 'DataLine',
    color: 'var(--color-danger)'
  }
]
</script>

<style lang="scss" scoped>
.social-stats {
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
  .social-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 640px) {
  .social-stats {
    grid-template-columns: 1fr;
  }
}
</style>
