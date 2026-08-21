<template>
  <card class="today-sales">
    <template #header>
      <div class="today-sales-header">
        <div class="dash-header">
          <h4>今日销售</h4>
          <p>销售总结</p>
        </div>
        <div class="today-sales-export">
          <el-icon><ArrowUp /></el-icon>
          <span>导出</span>
        </div>
      </div>
    </template>
    <template #content>
      <el-row :gutter="20">
        <el-col v-for="item in salesData" :key="item.label" :span="6" :xs="24">
          <div class="today-sales-item" :style="{ color: item.color }">
            <div class="today-sales-item-icon">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="today-sales-item-info">
              <count-to
                class="today-sales-item-value"
                :target="item.value"
                :duration="1500"
              />
              <p class="today-sales-item-label">{{ item.label }}</p>
              <small class="today-sales-item-change">
                较昨天
                <span
                  :class="item.change.startsWith('+') ? 'text-up' : 'text-down'"
                >
                  {{ item.change }}
                </span>
              </small>
            </div>
          </div>
        </el-col>
      </el-row>
    </template>
  </card>
</template>

<script setup>
import { ArrowUp } from '@element-plus/icons-vue'

/**
 * 今日销售数据统计
 * 包含销售额、订单量、产品销量和新客户数等关键指标
 */
const salesData = ref([
  {
    label: '总销售额',
    value: 999,
    change: '+10%',
    icon: 'DataBoard',
    color: 'var(--color-primary)'
  },
  {
    label: '总订单量',
    value: 300,
    change: '+15%',
    icon: 'Tickets',
    color: 'var(--color-warning)'
  },
  {
    label: '产品销售量',
    value: 56,
    change: '-5%',
    icon: 'Histogram',
    color: 'var(--color-danger)'
  },
  {
    label: '新客户数',
    value: 68,
    change: '+8%',
    icon: 'Avatar',
    color: 'var(--color-success)'
  }
])
</script>

<style lang="scss" scoped>
.today-sales {
  height: 328px;
  overflow: hidden;

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &-export {
    display: flex;
    gap: 6px;
    align-items: center;
    height: 30px;
    padding: 0 12px;
    font-size: 12px;
    color: var(--color-text-muted);
    cursor: pointer;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    transition: all 0.25s ease;

    &:hover {
      color: var(--color-primary);
      border-color: color-mix(in srgb, var(--color-primary), transparent 50%);
    }
  }

  &-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 220px;
    padding: 0 20px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: color-mix(in srgb, currentcolor, transparent 88%);
      border-radius: 10px;

      :deep(.el-icon) {
        font-size: 20px;
      }
    }

    &-info {
      margin-top: 14px;
      color: var(--color-text-primary);
    }

    &-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-label {
      margin-top: 6px;
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    &-change {
      margin-top: 4px;
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}

@media (width <= 1280px) {
  .today-sales {
    height: auto;

    &-item {
      margin-bottom: 20px;
    }
  }
}

@media (width <= 640px) {
  .today-sales-item {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 160px;

    &-info {
      margin-top: 0;
      text-align: right;
    }
  }
}
</style>
