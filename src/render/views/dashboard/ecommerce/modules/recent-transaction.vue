<template>
  <card class="recent-transaction">
    <template #header>
      <div class="dash-header">
        <h4>最近交易</h4>
        <p>今日订单动态</p>
      </div>
    </template>
    <template #content>
      <el-scrollbar height="340px">
        <el-timeline>
          <el-timeline-item
            v-for="item in timelineData"
            :key="item.time"
            :timestamp="item.time"
            placement="top"
            :color="item.status"
          >
            <div class="recent-transaction-content">
              <span class="recent-transaction-text">{{ item.content }}</span>
              <span v-if="item.code" class="recent-transaction-code">
                #{{ item.code }}
              </span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
/**
 * 最近交易时间线数据
 * 记录今日订单处理、商品上架、支付等关键活动
 */
const timelineData = [
  {
    time: '上午 09:30',
    status: 'rgb(73, 190, 255)',
    content: '收到订单 #38291 支付 ¥385.90'
  },
  {
    time: '上午 10:00',
    status: 'rgb(54, 158, 255)',
    content: '新商品上架',
    code: 'SKU-3467'
  },
  {
    time: '上午 12:00',
    status: 'rgb(103, 232, 207)',
    content: '向供应商支付了 ¥6495.00'
  },
  {
    time: '下午 14:30',
    status: 'rgb(255, 193, 7)',
    content: '促销活动开始',
    code: 'PROMO-2023'
  },
  {
    time: '下午 15:45',
    status: 'rgb(255, 105, 105)',
    content: '订单取消提醒',
    code: 'ORD-9876'
  },
  {
    time: '下午 17:00',
    status: 'rgb(103, 232, 207)',
    content: '完成日销售报表'
  }
]
</script>

<style lang="scss" scoped>
.recent-transaction {
  height: 445px;
  overflow: hidden;

  &-content {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &-text {
    font-size: 13px;
    color: var(--color-text-primary);
  }

  &-code {
    font-size: 13px;
    color: var(--color-primary);
  }
}
</style>
