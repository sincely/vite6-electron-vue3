<template>
  <card class="recent-transactions">
    <template #header>
      <div class="dash-header">
        <h4>最近交易</h4>
      </div>
    </template>
    <template #content>
      <el-scrollbar height="360px">
        <div
          v-for="item in transactions"
          :key="item.code"
          class="recent-transactions-item"
        >
          <div class="recent-transactions-main">
            <div class="recent-transactions-code">订单号 - {{ item.code }}</div>
            <div class="recent-transactions-meta">
              {{ item.count }} 件商品 · {{ item.amount }} · {{ item.date }}
            </div>
          </div>
          <div class="recent-transactions-tail">
            <span class="recent-transactions-status" :class="`is-${item.type}`">
              {{ item.status }}
            </span>
            <div class="recent-transactions-avatars">
              <el-avatar
                v-for="(avatar, i) in item.avatars"
                :key="i"
                :src="avatar"
                :size="26"
                class="recent-transactions-avatar"
              />
              <span v-if="item.extra" class="recent-transactions-extra">
                +{{ item.extra }}
              </span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
import avatar1 from '@/assets/images/avatar/avatar1.webp'
import avatar2 from '@/assets/images/avatar/avatar2.webp'
import avatar3 from '@/assets/images/avatar/avatar3.webp'

/**
 * 最近交易订单列表
 */
const transactions = [
  {
    code: '#SPK1234',
    count: 4,
    amount: '¥150.00',
    date: '2024-08-27',
    status: '已支付',
    type: 'success',
    avatars: [avatar1, avatar2],
    extra: 2
  },
  {
    code: '#SPK7432',
    count: 3,
    amount: '¥75.00',
    date: '2024-08-26',
    status: '待处理',
    type: 'warning',
    avatars: [avatar2, avatar3],
    extra: 0
  },
  {
    code: '#SPK3422',
    count: 2,
    amount: '¥200.00',
    date: '2024-08-25',
    status: '已支付',
    type: 'success',
    avatars: [avatar1],
    extra: 0
  },
  {
    code: '#SPK1578',
    count: 1,
    amount: '¥120.00',
    date: '2024-08-24',
    status: '已支付',
    type: 'success',
    avatars: [avatar3],
    extra: 0
  },
  {
    code: '#SPK2355',
    count: 5,
    amount: '¥90.00',
    date: '2024-08-23',
    status: '失败',
    type: 'danger',
    avatars: [avatar1, avatar2],
    extra: 3
  },
  {
    code: '#SPK1643',
    count: 1,
    amount: '¥249.00',
    date: '2024-08-16',
    status: '已支付',
    type: 'success',
    avatars: [avatar2],
    extra: 0
  }
]
</script>

<style lang="scss" scoped>
.recent-transactions {
  &-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &-main {
    flex: 1;
  }

  &-code {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-meta {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-tail {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }

  &-status {
    padding: 4px 8px;
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

  &-avatars {
    display: flex;
    align-items: center;
  }

  &-avatar {
    margin-left: -8px;
    border: 2px solid var(--color-bg-card);

    &:first-child {
      margin-left: 0;
    }
  }

  &-extra {
    margin-left: 6px;
    font-size: 12px;
    color: var(--color-text-muted);
  }
}
</style>
