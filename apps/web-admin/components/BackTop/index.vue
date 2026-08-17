<template>
  <el-backtop
    :right="right"
    :bottom="bottom"
    :visibility-height="visibilityHeight"
    :target="target"
  >
    <div class="back-top-btn">
      <SvgIcon icon-class="backTop" width="16px" height="16px" />
    </div>
  </el-backtop>
</template>

<script setup>
defineProps({
  target: {
    type: String,
    default: '.global-content'
  },
  visibilityHeight: {
    type: Number,
    default: 180
  },
  right: {
    type: Number,
    default: 30
  },
  bottom: {
    type: Number,
    default: 50
  }
})
</script>

<style lang="scss" scoped>
.back-top-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  // padding: 4px;
  line-height: 40px;
  color: var(--el-color-primary);
  text-align: center;
  background-color: var(--el-bg-color-overlay);
  border-radius: 50%;
  box-shadow: var(--el-box-shadow-lighter);
  transition: all 0.3s;

  &:hover {
    background-color: var(--el-color-primary-light-9);
  }
}
</style>
