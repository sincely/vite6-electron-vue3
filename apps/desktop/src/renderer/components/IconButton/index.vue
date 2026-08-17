<!-- 图标按钮组件 -->
<template>
  <div
    class="icon-button"
    :class="{ 'is-circle': circle }"
    :style="{ width: size, height: size }"
  >
    <Icon v-if="icon" :icon="icon" :width="iconSize" :height="iconSize" />
    <slot></slot>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineOptions({ name: 'IconButton' })

defineProps({
  // Iconify 图标名称
  icon: {
    type: String,
    required: true
  },
  // 按钮尺寸（CSS 长度）
  size: {
    type: String,
    default: '34px'
  },
  // 图标大小（像素）
  iconSize: {
    type: [String, Number],
    default: 20
  },
  // 是否为圆形按钮
  circle: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  user-select: none;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-hover);
  }

  &:active {
    background-color: var(--color-bg-active);
    transform: scale(0.94);
  }

  &.is-circle {
    border-radius: 50%;
  }
}
</style>
