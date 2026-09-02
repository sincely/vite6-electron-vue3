<template>
  <card class="crypto-activities">
    <template #header>
      <div class="dash-header">
        <h4>最近动态</h4>
      </div>
      <el-link class="crypto-activities-more" type="primary" underline="never">
        查看全部
      </el-link>
    </template>
    <template #content>
      <el-scrollbar height="420px">
        <div
          v-for="(item, index) in activities"
          :key="index"
          class="crypto-activities-item"
        >
          <el-avatar :src="item.avatar" :size="38" />
          <div class="crypto-activities-main">
            <div class="crypto-activities-name">{{ item.name }}</div>
            <div class="crypto-activities-coin">{{ item.coin }}</div>
          </div>
          <div class="crypto-activities-tail">
            <div class="crypto-activities-date">{{ item.date }}</div>
            <div class="crypto-activities-time">{{ item.time }}</div>
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
import avatar4 from '@/assets/images/avatar/avatar4.webp'
import avatar5 from '@/assets/images/avatar/avatar5.webp'
import avatar6 from '@/assets/images/avatar/avatar6.webp'

/**
 * 加密货币最近动态
 */
const activities = [
  {
    name: '林雨',
    coin: '比特币 - (0.12)',
    date: '2025-02-10',
    time: '转出 - 04:24PM',
    avatar: avatar1
  },
  {
    name: '李娜',
    coin: '以太坊 - (9.20)',
    date: '2025-02-11',
    time: '转入 - 11:57PM',
    avatar: avatar2
  },
  {
    name: '王凯',
    coin: '达世币 - (830.9)',
    date: '2025-02-12',
    time: '转入 - 02:28AM',
    avatar: avatar3
  },
  {
    name: '陈晨',
    coin: '欧元 - (11.23)',
    date: '2025-02-13',
    time: '处理中 - 10:08AM',
    avatar: avatar4
  },
  {
    name: '周洋',
    coin: '比特币 - (0.56)',
    date: '2025-02-12',
    time: '转出 - 02:34PM',
    avatar: avatar5
  },
  {
    name: '刘森',
    coin: '莱特币 - (125.65)',
    date: '2025-02-14',
    time: '转入 - 06:05PM',
    avatar: avatar6
  },
  {
    name: '许诺',
    coin: '索拉纳 - (42.80)',
    date: '2025-02-15',
    time: '转入 - 09:16AM',
    avatar: avatar1
  },
  {
    name: '何宇',
    coin: '瑞波币 - (530.00)',
    date: '2025-02-15',
    time: '处理中 - 01:42PM',
    avatar: avatar2
  },
  {
    name: '唐雅',
    coin: '比特币 - (1.08)',
    date: '2025-02-16',
    time: '转出 - 08:30PM',
    avatar: avatar3
  }
]
</script>

<style lang="scss" scoped>
.crypto-activities {
  &-more {
    margin-left: auto;
    font-size: 13px;
  }

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

  &-main {
    flex: 1;
  }

  &-name {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-coin {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-tail {
    text-align: right;
  }

  &-date {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &-time {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}
</style>
