<template>
  <card class="transaction-list">
    <template #header>
      <div class="dash-header">
        <h4>最近活动</h4>
        <p>订单处理状态</p>
      </div>
    </template>
    <template #content>
      <el-scrollbar height="264px">
        <div
          v-for="(item, index) in dataList.slice(0, maxCount)"
          :key="index"
          class="transaction-list-item"
        >
          <div
            class="transaction-list-item-icon"
            :style="{ color: item.color }"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="transaction-list-item-main">
            <div class="transaction-list-item-title">{{ item.title }}</div>
            <div class="transaction-list-item-status">{{ item.status }}</div>
          </div>
          <div class="transaction-list-item-time">{{ item.time }}</div>
        </div>
      </el-scrollbar>
      <el-button class="transaction-list-more" @click="handleMore">
        查看更多
      </el-button>
    </template>
  </card>
</template>

<script setup>
/**
 * 最近活动数据列表
 * 展示订单处理、退款申请、投诉处理等业务活动状态
 */
const maxCount = 4

const dataList = [
  {
    title: '新订单 #38291',
    status: '待处理',
    time: '5分钟',
    color: 'var(--color-primary)',
    icon: 'ShoppingBag'
  },
  {
    title: '退款申请 #12845',
    status: '处理中',
    time: '10分钟',
    color: 'var(--color-info)',
    icon: 'Document'
  },
  {
    title: '客户投诉处理',
    status: '待处理',
    time: '15分钟',
    color: 'var(--color-warning)',
    icon: 'Service'
  },
  {
    title: '库存不足提醒',
    status: '紧急',
    time: '20分钟',
    color: 'var(--color-danger)',
    icon: 'Box'
  },
  {
    title: '订单 #29384 已发货',
    status: '已完成',
    time: '20分钟',
    color: 'var(--color-success)',
    icon: 'ShoppingCartFull'
  }
]

/**
 * 处理查看更多按钮点击事件
 */
const handleMore = () => {
  // TODO: 添加查看更多逻辑
}
</script>

<style lang="scss" scoped>
.transaction-list {
  height: 451px;
  overflow: hidden;

  &-item {
    display: flex;
    align-items: center;
    padding: 12px 0;

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      margin-right: 12px;
      background: color-mix(in srgb, currentcolor, transparent 88%);
      border-radius: 10px;

      :deep(.el-icon) {
        font-size: 20px;
      }
    }

    &-main {
      flex: 1;
    }

    &-title {
      margin-bottom: 4px;
      font-size: 13px;
      color: var(--color-text-primary);
    }

    &-status {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    &-time {
      margin-left: 12px;
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }

  &-more {
    width: 100%;
    margin-top: 24px;
  }
}
</style>
