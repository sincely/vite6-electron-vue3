<template>
  <!-- Chrome 标签背景几何图形：左右两半对称拼接，形成圆角顶 + 底部凹槽的经典 Chrome 标签形状 -->
  <svg class="chrome-tab-bg" aria-hidden="true">
    <svg width="51%" height="100%">
      <path
        d="M17 0h197v36H0v-2c4.5 0 9-3.5 9-8V8c0-4.5 3.5-8 8-8z"
        fill="currentColor"
      />
    </svg>
    <g transform="scale(-1, 1)">
      <svg width="51%" height="100%" x="-100%" y="0">
        <path
          d="M17 0h197v36H0v-2c4.5 0 9-3.5 9-8V8c0-4.5 3.5-8 8-8z"
          fill="currentColor"
        />
      </svg>
    </g>
  </svg>
</template>

<script setup>
defineOptions({
  name: 'ChromeTabBg'
})
</script>

<style lang="scss" scoped>
// 默认透明，由父组件根据 hover / active 状态切换 currentColor
.chrome-tab-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  color: transparent;
  transition: color 0.2s ease;
}
</style>
