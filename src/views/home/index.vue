<template>
  <div class="dashboard">
    <h2 class="dashboard-title">仪表板</h2>
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-card-header">
          <i :class="['stat-card-icon', stat.icon]" :style="{ color: stat.color }" />
          <span class="stat-card-label">{{ stat.label }}</span>
        </div>
        <div class="stat-card-value" :style="{ color: stat.color }">{{ stat.value }}</div>
        <div class="stat-card-sub">{{ stat.sub }}</div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <i class="i-lucide-link panel-icon" />
        <span>API 端点</span>
      </div>
      <div class="endpoint">
        <code class="endpoint-url">http://127.0.0.1:18317/v1</code>
        <button class="endpoint-copy" title="复制" @click="copyEndpoint">
          <i class="i-lucide-copy" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const stats = [
  { label: '账户', icon: 'i-lucide-users', value: '2', sub: '0 就绪', color: '#4dabf7' },
  { label: '请求', icon: 'i-lucide-arrow-up-down', value: '0', sub: '总计', color: '#69db7c' },
  { label: '令牌', icon: 'i-lucide-coins', value: '0', sub: '已处理', color: '#da77f2' },
  { label: '成功率', icon: 'i-lucide-check-circle', value: '0%', sub: '0 失败', color: '#fd7e14' }
]
const copyEndpoint = async () => {
  await navigator.clipboard.writeText('http://127.0.0.1:18317/v1')
}
</script>

<style lang="scss" scoped>
.dashboard {
  height: 100%;
  overflow-y: auto;

  &-title {
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 16px;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--color-text-muted);
  }

  &-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
  }

  &-icon {
    font-size: 16px;
  }

  &-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &-value {
    margin-bottom: 6px;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }

  &-sub {
    font-size: 11px;
    color: var(--color-text-muted);
  }
}

.panel {
  padding: 16px;
  margin-bottom: 16px;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 10px;

  &-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-icon {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
}

.endpoint {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  background-color: var(--color-bg-input);
  border-radius: 7px;

  &-url {
    flex: 1;
    font-family: monospace;
    font-size: 13px;
    color: var(--color-text-primary);
  }

  &-copy {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition:
      background-color 0.15s,
      color 0.15s;

    &:hover {
      color: var(--color-text-primary);
      background-color: var(--color-bg-hover);
    }
  }
}
</style>
