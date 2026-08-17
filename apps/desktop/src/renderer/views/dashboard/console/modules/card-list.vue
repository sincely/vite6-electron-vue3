<template>
  <el-row :gutter="20">
    <el-col v-for="item in dataList" :key="item.des" :sm="12" :md="6" :lg="6">
      <div class="stat-card">
        <span class="stat-card-label">{{ item.des }}</span>
        <count-to
          class="stat-card-value"
          :target="item.num"
          :duration="1300"
          separator=","
        />
        <div class="stat-card-change">
          <span class="stat-card-change-label">较上周</span>
          <span
            class="stat-card-change-value"
            :class="item.change.startsWith('+') ? 'is-up' : 'is-down'"
          >
            {{ item.change }}
          </span>
        </div>
        <div class="stat-card-icon-bg">
          <el-icon class="stat-card-icon">
            <component :is="item.icon" />
          </el-icon>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
/**
 * 卡片统计数据列表
 * 展示总访问次数、在线访客数、点击量和新用户等核心数据指标
 */
const dataList = [
  {
    des: '总访问次数',
    icon: 'PieChart',
    num: 9120,
    change: '+20%'
  },
  {
    des: '在线访客数',
    icon: 'User',
    num: 182,
    change: '+10%'
  },
  {
    des: '点击量',
    icon: 'Pointer',
    num: 9520,
    change: '-12%'
  },
  {
    des: '新用户',
    icon: 'TrendCharts',
    num: 156,
    change: '+30%'
  }
]
</script>

<style lang="scss" scoped>
.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 140px;
  padding: 0 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    box-shadow: var(--glass-shadow-hover);
    transform: translate3d(0, -2px, 0);
  }

  &-label {
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &-value {
    margin-top: 8px;
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-change {
    display: flex;
    align-items: center;
    margin-top: 4px;

    &-label {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    &-value {
      margin-left: 4px;
      font-size: 12px;
      font-weight: 600;

      &.is-up {
        color: var(--color-success);
      }

      &.is-down {
        color: var(--color-danger);
      }
    }
  }

  &-icon-bg {
    position: absolute;
    top: 0;
    right: 20px;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    margin: auto 0;
    background: color-mix(in srgb, var(--color-primary), transparent 88%);
    border-radius: 12px;
  }

  &-icon {
    font-size: 20px;
    color: var(--color-primary);
  }
}
</style>
