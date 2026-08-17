<template>
  <card class="hrm-stats">
    <template #content>
      <div class="hrm-stats-grid">
        <div v-for="item in stats" :key="item.label" class="hrm-stats-cell">
          <div class="hrm-stats-icon" :style="{ color: item.color }">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="hrm-stats-label">{{ item.label }}</div>
          <div class="hrm-stats-row">
            <span class="hrm-stats-value">{{ item.value }}</span>
            <span
              class="hrm-stats-pill"
              :style="{
                color: item.trendColor,
                background: `color-mix(in srgb, ${item.trendColor}, transparent 88%)`
              }"
            >
              {{ item.trend }}
            </span>
            <span class="hrm-stats-unit">本年</span>
          </div>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
/**
 * 人力资源核心指标 2x2 统计卡
 */
const stats = [
  {
    label: '员工总数',
    value: '12,860',
    trend: '2.84%',
    icon: 'Briefcase',
    color: 'var(--color-primary)',
    trendColor: 'var(--color-success)'
  },
  {
    label: '新增员工',
    value: '1,126',
    trend: '4.13%',
    icon: 'User',
    color: 'var(--color-info)',
    trendColor: 'var(--color-danger)'
  },
  {
    label: '求职申请数',
    value: '2,418',
    trend: '3.56%',
    icon: 'Tickets',
    color: 'var(--color-success)',
    trendColor: 'var(--color-success)'
  },
  {
    label: '离职员工',
    value: '206',
    trend: '1.05%',
    icon: 'UserFilled',
    color: 'var(--color-warning)',
    trendColor: 'var(--color-warning)'
  }
]
</script>

<style lang="scss" scoped>
.hrm-stats {
  &-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  &-cell {
    padding: 24px;
    border-right: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);

    &:nth-child(2n) {
      border-right: none;
    }

    &:nth-child(n + 3) {
      border-bottom: none;
    }
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-bottom: 40px;
    background: color-mix(in srgb, currentcolor, transparent 88%);
    border-radius: 10px;

    :deep(.el-icon) {
      font-size: 22px;
    }
  }

  &-label {
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &-pill {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
  }

  &-unit {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

@media (width <= 768px) {
  .hrm-stats-grid {
    grid-template-columns: 1fr;
  }

  .hrm-stats-cell {
    border-right: none !important;
    border-bottom: 1px solid var(--color-border) !important;

    &:last-child {
      border-bottom: none !important;
    }
  }
}
</style>
