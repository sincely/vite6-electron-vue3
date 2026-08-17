<template>
  <card class="channel-performance">
    <template #header>
      <div class="dash-header">
        <h4>渠道表现</h4>
      </div>
    </template>
    <template #content>
      <el-scrollbar height="360px">
        <div
          v-for="item in channels"
          :key="item.name"
          class="channel-performance-item"
        >
          <div class="channel-performance-main">
            <div class="channel-performance-name">{{ item.name }}</div>
            <div class="channel-performance-type">{{ item.type }}</div>
          </div>
          <div class="channel-performance-tail">
            <span :class="item.up ? 'text-up' : 'text-down'">
              {{ item.up ? '↑' : '↓' }} {{ item.trend }}
            </span>
            <span class="channel-performance-value">{{ item.value }}</span>
          </div>
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
/**
 * 渠道表现列表
 */
const channels = [
  {
    name: '云端通联',
    type: '数字沟通',
    trend: '3.08%',
    up: true,
    value: '3,860'
  },
  {
    name: '脉冲传媒',
    type: '社交媒体',
    trend: '4.92%',
    up: false,
    value: '2,940'
  },
  {
    name: '星云网络',
    type: '网络合作',
    trend: '2.14%',
    up: true,
    value: '2,468'
  },
  {
    name: '闪联触达',
    type: '直效营销',
    trend: '4.33%',
    up: false,
    value: '1,812'
  },
  {
    name: '回声互联',
    type: '问卷反馈',
    trend: '3.96%',
    up: true,
    value: '1,588'
  },
  {
    name: '视界分发',
    type: '内容分发',
    trend: '1.08%',
    up: true,
    value: '1,402'
  }
]
</script>

<style lang="scss" scoped>
.channel-performance {
  &-item {
    display: flex;
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

  &-name {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-type {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-tail {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
    font-size: 12px;
  }

  &-value {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-primary);
  }
}
</style>
