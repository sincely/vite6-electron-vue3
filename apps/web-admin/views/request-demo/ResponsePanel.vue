<template>
  <div
    v-if="response"
    class="response-panel"
    :class="{ 'is-error': !response.ok }"
  >
    <div class="response-header">
      <el-tag :type="response.ok ? 'success' : 'danger'" size="small">
        {{ response.ok ? '✓ 成功' : '✗ 失败' }}
      </el-tag>
      <span class="time">{{ response.timestamp }}</span>
    </div>
    <pre class="response-body">{{
      JSON.stringify(
        response.ok ? response.payload : { error: response.error },
        null,
        2
      )
    }}</pre>
  </div>
</template>

<script setup>
defineOptions({ name: 'ResponsePanel' })
defineProps({
  response: {
    type: Object,
    default: null
  }
})
</script>

<style lang="scss" scoped>
.response-panel {
  padding: 10px 12px;
  margin-top: 12px;
  background: var(--color-fill-secondary);
  border-radius: 6px;

  &.is-error {
    background: var(--el-color-danger-light-9);
  }
}

.response-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.time {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.response-body {
  max-height: 240px;
  margin: 0;
  overflow-y: auto;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-primary);
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
