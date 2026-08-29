<template>
  <Icon
    icon="ri:refresh-line"
    class="toolbar-icon"
    :class="{ 'is-spinning': loading }"
    width="18"
    height="18"
    title="刷新"
    @click="emit('refresh')"
  />
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  // 加载中：图标持续旋转并屏蔽点击
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])
</script>

<style scoped lang="scss">
.toolbar-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.is-spinning {
    pointer-events: none;
    animation: table-refresh-rotate 0.8s linear infinite;
  }
}

@keyframes table-refresh-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
