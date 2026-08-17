<template>
  <card class="transaction-history">
    <template #header>
      <div class="dash-header">
        <h4>交易历史</h4>
      </div>
    </template>
    <template #content>
      <el-scrollbar height="420px">
        <div
          v-for="(item, index) in transactions"
          :key="index"
          class="transaction-history-item"
        >
          <span
            class="transaction-history-icon"
            :style="{
              color: item.color,
              background: `color-mix(in srgb, ${item.color}, transparent 88%)`
            }"
          >
            {{ item.icon }}
          </span>
          <div class="transaction-history-main">
            <div class="transaction-history-type">{{ item.type }}</div>
            <div class="transaction-history-time">{{ item.time }}</div>
          </div>
          <div class="transaction-history-tail">
            <div class="transaction-history-amount">{{ item.amount }}</div>
            <span
              class="transaction-history-status"
              :class="`is-${item.statusType}`"
            >
              {{ item.status }}
            </span>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
/**
 * 加密货币交易历史
 */
const transactions = [
  {
    icon: '₿',
    type: '充值',
    time: '2025-02-10 14:30',
    amount: '0.25 BTC',
    status: '已完成',
    statusType: 'success',
    color: '#f7931a'
  },
  {
    icon: 'Ξ',
    type: '提现',
    time: '2025-02-11 10:00',
    amount: '500 ETH',
    status: '处理中',
    statusType: 'warning',
    color: '#627eea'
  },
  {
    icon: '✕',
    type: '转账',
    time: '2025-02-12 16:45',
    amount: '2,000 XRP',
    status: '已完成',
    statusType: 'success',
    color: '#0ea5e9'
  },
  {
    icon: '₿',
    type: '充值',
    time: '2025-02-13 09:30',
    amount: '1.5 BTC',
    status: '失败',
    statusType: 'danger',
    color: '#f7931a'
  },
  {
    icon: '₮',
    type: '提现',
    time: '2025-02-14 13:20',
    amount: '1500 USDT',
    status: '已完成',
    statusType: 'success',
    color: '#26a17b'
  },
  {
    icon: '₿',
    type: '充值',
    time: '2025-02-14 17:05',
    amount: '5.0 BTC',
    status: '处理中',
    statusType: 'warning',
    color: '#f7931a'
  },
  {
    icon: '◎',
    type: '转账',
    time: '2025-02-15 08:40',
    amount: '780 SOL',
    status: '已完成',
    statusType: 'success',
    color: '#7c3aed'
  },
  {
    icon: 'A',
    type: '提现',
    time: '2025-02-15 12:18',
    amount: '320 ADA',
    status: '处理中',
    statusType: 'warning',
    color: '#0ea5e9'
  },
  {
    icon: 'Ξ',
    type: '充值',
    time: '2025-02-16 09:56',
    amount: '12.8 ETH',
    status: '已完成',
    statusType: 'success',
    color: '#627eea'
  }
]
</script>

<style lang="scss" scoped>
.transaction-history {
  &-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    font-size: 16px;
    font-weight: 700;
    border-radius: 10px;
  }

  &-main {
    flex: 1;
  }

  &-type {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-time {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-tail {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
  }

  &-amount {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-status {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;

    &.is-success {
      color: var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 88%);
    }

    &.is-warning {
      color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning), transparent 88%);
    }

    &.is-danger {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 88%);
    }
  }
}
</style>
