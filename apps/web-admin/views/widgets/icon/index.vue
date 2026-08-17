<!-- 组件中心 - 图标 -->
<template>
  <div class="icon-page">
    <PageHeader
      title="图标"
      subtitle="基于 Iconify 的离线图标方案，支持多图标库"
      icon="image"
    />

    <div class="page-desc">
      项目采用 Iconify + 离线图标集合方案，图标数据由
      <code>scripts/gen-iconify-data.js</code>
      从 @iconify/json 提取， 通过
      <code>addCollection</code>
      本地注册，无需网络请求，可在
      <a href="https://icones.js.org/" target="_blank">Icones</a>
      中查找图标名后使用，支持 Remix Icon、Lucide、Material Line Icons
      等多个图标库。
    </div>

    <!-- Iconify 图标 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">Remix Icon</span>
      </template>
      <div class="icon-row">
        <Icon icon="ri:github-fill" class="icon-demo" />
        <Icon icon="ri:copilot-line" class="icon-demo icon-demo--primary" />
        <Icon icon="ri:edge-line" class="icon-demo icon-demo--secondary" />
        <Icon icon="ri:planet-line" class="icon-demo icon-demo--warning" />
        <Icon icon="ri:windows-line" class="icon-demo icon-demo--info" />
        <Icon icon="ri:thumb-up-line" class="icon-demo icon-demo--danger" />
        <Icon icon="ri:gift-2-line" class="icon-demo icon-demo--success" />
        <Icon icon="ri:apple-line" class="icon-demo icon-demo--secondary" />
      </div>
    </ElCard>

    <!-- 动效图标 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">Svg Spinners（加载动效）</span>
      </template>
      <div class="icon-row">
        <Icon
          icon="svg-spinners:3-dots-fade"
          class="icon-demo"
          style="color: #f87171"
        />
        <Icon
          icon="svg-spinners:3-dots-bounce"
          class="icon-demo"
          style="color: #60a5fa"
        />
        <Icon
          icon="svg-spinners:3-dots-move"
          class="icon-demo"
          style="color: #fb923c"
        />
        <Icon
          icon="svg-spinners:3-dots-rotate"
          class="icon-demo"
          style="color: #c084fc"
        />
        <Icon
          icon="svg-spinners:blocks-shuffle-2"
          class="icon-demo"
          style="color: #f9a8d4"
        />
        <Icon
          icon="svg-spinners:clock"
          class="icon-demo"
          style="color: #eab308"
        />
        <Icon
          icon="svg-spinners:tadpole"
          class="icon-demo"
          style="color: #f97316"
        />
        <Icon
          icon="svg-spinners:blocks-wave"
          class="icon-demo"
          style="color: #3b82f6"
        />
      </div>
    </ElCard>

    <!-- Material Line Icons -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">Material Line Icons</span>
      </template>
      <div class="icon-row">
        <Icon
          icon="line-md:phone-call-twotone-loop"
          class="icon-demo"
          style="color: #3b82f6"
        />
        <Icon
          icon="line-md:switch-off"
          class="icon-demo"
          style="color: #22c55e"
        />
        <Icon
          icon="line-md:sun-rising-filled-loop"
          class="icon-demo"
          style="color: #facc15"
        />
        <Icon
          icon="line-md:volume-high-filled"
          class="icon-demo"
          style="color: #a855f7"
        />
        <Icon
          icon="line-md:github-twotone"
          class="icon-demo"
          style="color: #374151"
        />
        <Icon
          icon="line-md:telegram"
          class="icon-demo"
          style="color: #0ea5e9"
        />
        <Icon
          icon="line-md:reddit-loop"
          class="icon-demo"
          style="color: #fb923c"
        />
        <Icon
          icon="line-md:coffee-half-empty-filled-loop"
          class="icon-demo"
          style="color: #10b981"
        />
      </div>
    </ElCard>

    <!-- 使用示例 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">使用示例</span>
      </template>
      <div class="usage-list">
        <div v-for="usage in usageList" :key="usage.label" class="usage-item">
          <div class="usage-label">{{ usage.label }}</div>
          <div class="usage-code">{{ usage.code }}</div>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineOptions({ name: 'WidgetsIcon' })

/**
 * 使用示例配置
 */
const usageList = [
  {
    label: '基础使用',
    code: '<Icon icon="ri:home-line" />'
  },
  {
    label: '自定义大小',
    code: '<Icon icon="ri:user-line" width="24" height="24" />'
  },
  {
    label: '自定义颜色',
    code: '<Icon icon="ri:heart-fill" style="color: #ef4444" />'
  },
  {
    label: '组合使用',
    code: '<Icon icon="ri:star-fill" width="36" height="36" style="color: #f59e0b" />'
  }
]
</script>

<style lang="scss" scoped>
.icon-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.page-desc {
  padding: 0 4px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-text-secondary);

  code {
    padding: 2px 6px;
    font-size: 13px;
    background-color: var(--color-bg-input);
    border-radius: 4px;
  }

  a {
    color: var(--color-primary);

    &:hover {
      text-decoration: underline;
    }
  }
}

.page-card {
  :deep(.el-card__header) {
    padding: 14px 20px;
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.icon-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

.icon-demo {
  width: 24px;
  height: 24px;
  color: var(--color-text-primary);

  &--primary {
    color: var(--color-primary);
  }

  &--secondary {
    color: var(--color-violet);
  }

  &--warning {
    color: var(--color-warning);
  }

  &--info {
    color: var(--color-info);
  }

  &--danger {
    color: var(--color-danger);
  }

  &--success {
    color: var(--color-success);
  }
}

.usage-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.usage-item {
  .usage-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .usage-code {
    padding: 16px;
    font-family: Consolas, Monaco, 'Courier New', monospace;
    font-size: 13px;
    color: var(--color-text-primary);
    background-color: var(--color-bg-input);
    border-radius: var(--radius-sm);
  }
}
</style>
