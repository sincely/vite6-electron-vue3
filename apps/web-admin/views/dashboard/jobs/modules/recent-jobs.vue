<template>
  <card class="recent-jobs">
    <template #header>
      <div class="dash-header">
        <h4>近期岗位</h4>
      </div>
    </template>
    <template #content>
      <div class="recent-jobs-grid">
        <div v-for="item in jobs" :key="item.title" class="recent-jobs-item">
          <span
            class="recent-jobs-logo"
            :style="{
              color: item.color,
              background: `color-mix(in srgb, ${item.color}, transparent 88%)`
            }"
          >
            {{ item.logo }}
          </span>
          <div class="recent-jobs-main">
            <div class="recent-jobs-title">{{ item.title }}</div>
            <div class="recent-jobs-company">{{ item.company }}</div>
          </div>
          <div class="recent-jobs-tags">
            <span class="recent-jobs-type">{{ item.type }}</span>
            <span class="recent-jobs-exp">{{ item.exp }}</span>
          </div>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
/**
 * 近期岗位卡片列表
 */
const jobs = [
  {
    logo: 'AC',
    title: 'UI 开发工程师',
    company: '智创科技 · 12 小时前',
    type: '全职',
    exp: '应届优先',
    color: '#6366f1'
  },
  {
    logo: 'SI',
    title: 'AWS 工程师',
    company: '云程科技 · 2 小时前',
    type: '兼职',
    exp: '+1 年经验',
    color: '#10b981'
  },
  {
    logo: 'LS',
    title: 'React 开发工程师',
    company: '星途互联 · 6 小时前',
    type: '自由职业',
    exp: '应届优先',
    color: '#f59e0b'
  },
  {
    logo: 'MS',
    title: 'Angular 开发工程师',
    company: '智云软件 · 14 小时前',
    type: '全职',
    exp: '+2 年经验',
    color: '#0ea5e9'
  },
  {
    logo: 'J',
    title: 'UI 测试工程师',
    company: '跃动科技 · 2 天前',
    type: '全职',
    exp: '+3 年经验',
    color: '#ef4444'
  },
  {
    logo: 'AT',
    title: '数据产品经理',
    company: '启航科技 · 3 天前',
    type: '全职',
    exp: '+5 年经验',
    color: '#7c3aed'
  },
  {
    logo: 'BW',
    title: '测试开发工程师',
    company: '字节工坊 · 4 天前',
    type: '兼职',
    exp: '应届优先',
    color: '#14b8a6'
  },
  {
    logo: 'NL',
    title: '前端架构师',
    company: '新极实验室 · 5 天前',
    type: '全职',
    exp: '+8 年经验',
    color: '#f43f5e'
  }
]
</script>

<style lang="scss" scoped>
.recent-jobs {
  &-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  &-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: color-mix(in srgb, var(--color-text-primary), transparent 96%);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  &-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 10px;
  }

  &-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-company {
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-tags {
    display: flex;
    gap: 8px;
  }

  &-type,
  &-exp {
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 6px;
  }

  &-type {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 88%);
  }

  &-exp {
    color: var(--color-text-secondary);
    background: color-mix(
      in srgb,
      var(--color-text-secondary),
      transparent 88%
    );
  }
}

@media (width <= 1400px) {
  .recent-jobs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 768px) {
  .recent-jobs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
