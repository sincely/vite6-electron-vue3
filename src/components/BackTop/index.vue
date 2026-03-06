<template>
  <el-backtop :right="40" :bottom="40" :visibility-height="20">
    <div class="back-top-btn">
      <el-icon><CaretTop /></el-icon>
    </div>
  </el-backtop>
</template>

<script setup>
import { CaretTop } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.back-top-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
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
