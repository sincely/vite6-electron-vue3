<template>
  <div class="detail-content">
    <div class="detail-item">
      <span class="label">操作时间</span>
      <span class="value">{{ row.date }}</span>
    </div>
    <div class="detail-item">
      <span class="label">操作人员</span>
      <div class="user-value">
        <div class="user-avatar-sm">{{ row.name.charAt(0) }}</div>
        <span>{{ row.name }}</span>
      </div>
    </div>
    <div class="detail-item">
      <span class="label">日志类型</span>
      <span class="type-pill">系统操作</span>
    </div>
    <div class="detail-item">
      <span class="label">操作内容</span>
      <span class="value">{{ row.address }}</span>
    </div>
    <div class="detail-item full">
      <span class="label">原始数据</span>
      <pre class="code-block">{{ JSON.stringify(row, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
// https://blog.tianyichuxin.com/2025/03/55027.html

defineProps({
  row: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const onOk = () => {
  console.log('我是子组件的ok事件')
}
const onCancel = () => {
  console.log('我是子组件的cancel事件')
}
defineExpose({ onOk, onCancel })
</script>

<style lang="scss" scoped>
.detail-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full {
    grid-column: span 2;
  }

  .label {
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  .value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }
}

.user-value {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-avatar-sm {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--brand-accent)
  );
  border-radius: 50%;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  font-size: 11px;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary), transparent 90%);
  border-radius: 6px;
}

.code-block {
  padding: 12px;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-primary);
  word-break: break-all;
  white-space: pre-wrap;
  background: color-mix(in srgb, var(--color-bg-card), transparent 50%);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
}
</style>
