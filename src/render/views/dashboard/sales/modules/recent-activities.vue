<template>
  <card class="recent-activities">
    <template #header>
      <div class="dash-header">
        <h4>最近动态</h4>
      </div>
      <el-link class="recent-activities-more" type="primary" underline="never">
        查看全部 →
      </el-link>
    </template>
    <template #content>
      <el-scrollbar height="320px">
        <div
          v-for="(item, index) in activities"
          :key="index"
          class="recent-activities-item"
        >
          <div class="recent-activities-time">
            <span class="recent-activities-day">{{ item.day }}</span>
            <span class="recent-activities-clock">{{ item.clock }}</span>
          </div>
          <div class="recent-activities-line">
            <span class="recent-activities-dot"></span>
          </div>
          <p class="recent-activities-desc">{{ item.desc }}</p>
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
/**
 * 销售最近动态时间线
 */
const activities = [
  { day: '24日', clock: '08:45', desc: '周子航下单了 5 台 iPhone 14' },
  { day: '24日', clock: '09:15', desc: '收到来自林雨的回款 ¥1,250.00' },
  { day: '24日', clock: '10:00', desc: '陈浩提交了 Galaxy S22 退款申请' },
  { day: '24日', clock: '10:45', desc: '商品 ID:5409 库存已低于阈值' },
  { day: '24日', clock: '11:30', desc: '王悦提交了商品 ID:7312 的五星评价' }
]
</script>

<style lang="scss" scoped>
.recent-activities {
  &-more {
    margin-left: auto;
    font-size: 13px;
  }

  &-item {
    display: flex;
    gap: 12px;
    padding: 10px 0;
  }

  &-time {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 44px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-line {
    position: relative;
    width: 12px;

    &::before {
      position: absolute;
      top: 4px;
      bottom: -14px;
      left: 5px;
      width: 1px;
      content: '';
      background: var(--color-border);
    }
  }

  &-dot {
    position: absolute;
    top: 4px;
    left: 2px;
    width: 8px;
    height: 8px;
    background: var(--color-primary);
    border-radius: 50%;
  }

  &-item:last-child &-line::before {
    display: none;
  }

  &-desc {
    flex: 1;
    padding-top: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-secondary);
  }
}
</style>
