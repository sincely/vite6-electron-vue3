<template>
  <card class="key-customers">
    <template #header>
      <div class="dash-header">
        <h4>重点客户</h4>
      </div>
      <el-link class="key-customers-more" type="primary" underline="never">
        查看全部 →
      </el-link>
    </template>
    <template #content>
      <el-scrollbar height="320px">
        <div
          v-for="item in customers"
          :key="item.name"
          class="key-customers-item"
        >
          <span
            class="key-customers-avatar"
            :style="{
              color: item.color,
              background: `color-mix(in srgb, ${item.color}, transparent 88%)`
            }"
          >
            {{ item.initials }}
          </span>
          <div class="key-customers-main">
            <div class="key-customers-name">{{ item.name }}</div>
            <div class="key-customers-email">{{ item.email }}</div>
          </div>
          <div class="key-customers-spend">
            <div class="key-customers-spend-value">{{ item.spend }}</div>
            <div class="key-customers-spend-label">累计消费</div>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
/**
 * 重点客户列表
 */
const customers = [
  {
    initials: 'JS',
    name: '简·书曼',
    email: 'jian.shuman@company.com',
    spend: '¥23,880',
    color: '#6366f1'
  },
  {
    initials: 'JD',
    name: '杜文',
    email: 'duwen@company.com',
    spend: '¥14,760',
    color: '#10b981'
  },
  {
    initials: 'AK',
    name: '凯瑟琳',
    email: 'katherine@company.com',
    spend: '¥12,240',
    color: '#f59e0b'
  },
  {
    initials: 'LP',
    name: '李昂',
    email: 'liang@company.com',
    spend: '¥10,680',
    color: '#0ea5e9'
  },
  {
    initials: 'BS',
    name: '辛悦',
    email: 'xinyue@company.com',
    spend: '¥8,760',
    color: '#f43f5e'
  }
]
</script>

<style lang="scss" scoped>
.key-customers {
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

  &-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 50%;
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

  &-email {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-spend {
    text-align: right;

    &-value {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    &-label {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}
</style>
