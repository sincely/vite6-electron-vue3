<template>
  <card class="social-activities">
    <template #header>
      <div class="dash-header">
        <h4>最近动态</h4>
      </div>
    </template>
    <template #content>
      <div
        v-for="item in activities"
        :key="item.time"
        class="social-activities-item"
      >
        <span
          class="social-activities-icon"
          :style="{
            color: item.color,
            background: `color-mix(in srgb, ${item.color}, transparent 88%)`
          }"
        >
          {{ item.initial }}
        </span>
        <div class="social-activities-main">
          <div class="social-activities-platform">{{ item.platform }}</div>
          <div class="social-activities-desc">{{ item.desc }}</div>
        </div>
        <span class="social-activities-time">{{ item.time }}</span>
      </div>
    </template>
  </card>
</template>

<script setup>
/**
 * 社交平台最近动态
 */
const activities = [
  {
    initial: 'f',
    platform: 'Facebook',
    desc: '发布了新的春季促销内容',
    time: '10:15',
    color: '#1877f2'
  },
  {
    initial: 'I',
    platform: 'Instagram',
    desc: '上传了 3 张海边主题照片',
    time: '15:45',
    color: '#f472b6'
  },
  {
    initial: 'L',
    platform: 'LinkedIn',
    desc: '更新了市场岗位招聘动态',
    time: '11:30',
    color: '#6366f1'
  },
  {
    initial: 'T',
    platform: 'Twitter',
    desc: '发送了新品发布预热推文',
    time: '18:00',
    color: '#0ea5e9'
  },
  {
    initial: 'P',
    platform: 'Pinterest',
    desc: '置顶了节日装饰灵感图板',
    time: '11:30',
    color: '#f43f5e'
  }
]
</script>

<style lang="scss" scoped>
.social-activities {
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
    width: 36px;
    height: 36px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 10px;
  }

  &-main {
    flex: 1;
  }

  &-platform {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-desc {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-time {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}
</style>
