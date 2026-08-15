<template>
  <div class="jobs-stats">
    <card v-for="item in stats" :key="item.label" class="jobs-stats-card">
      <template #content>
        <div class="jobs-stats-top">
          <div>
            <div class="jobs-stats-label">{{ item.label }}</div>
            <div class="jobs-stats-value">{{ item.value }}</div>
          </div>
          <div class="jobs-stats-icon" :style="{ color: item.color }">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </div>
        </div>
        <div class="jobs-stats-trend">
          <span :class="item.up ? 'text-up' : 'text-down'">
            {{ item.up ? '↑' : '↓' }} {{ item.trend }}
          </span>
          <span class="jobs-stats-unit">较上月</span>
        </div>
      </template>
    </card>
  </div>
</template>

<script setup>
/**
 * 职位仪表盘核心指标卡片
 */
const stats = [
  {
    label: '招聘企业数',
    value: '1,384',
    trend: '2.14%',
    up: true,
    icon: 'OfficeBuilding',
    color: 'var(--color-primary)'
  },
  {
    label: '候选人数',
    value: '4,218',
    trend: '0.76%',
    up: true,
    icon: 'User',
    color: 'var(--color-info)'
  },
  {
    label: '覆盖城市',
    value: '24',
    trend: '1.20%',
    up: false,
    icon: 'Location',
    color: 'var(--color-warning)'
  },
  {
    label: '收到简历',
    value: '14,064',
    trend: '9.32%',
    up: true,
    icon: 'Document',
    color: 'var(--color-text-muted)'
  },
  {
    label: '活跃职位',
    value: '15,248',
    trend: '3.18%',
    up: true,
    icon: 'Bell',
    color: 'var(--color-success)'
  }
]
</script>

<style lang="scss" scoped>
.jobs-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;

  &-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &-label {
    margin-bottom: 8px;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &-value {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text-primary);
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

@media (width <= 1400px) {
  .jobs-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (width <= 768px) {
  .jobs-stats {
    grid-template-columns: 1fr;
  }
}
</style>
