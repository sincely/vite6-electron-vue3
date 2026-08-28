<template>
  <Icon
    :icon="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'"
    class="toolbar-icon"
    width="18"
    height="18"
    :title="isFullscreen ? '退出全屏' : '全屏'"
    @click="toggleFullscreen"
  />
</template>

<script setup>
import { Icon } from '@iconify/vue'

// 内容全屏由布局层统一管理（隐藏侧边栏/头部/标签栏，ESC 退出也在布局层处理），此处仅注入使用
const toggleFullscreen = inject('toggleFullscreen', () => {})
const isFullscreen = inject('isFullscreen', ref(false))
</script>

<style scoped lang="scss">
.toolbar-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    color: var(--color-primary);
    transform: scale(1.15);
  }
}
</style>
