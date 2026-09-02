<template>
  <el-dropdown trigger="click" placement="bottom-end" @command="handleCommand">
    <span class="toolbar-icon table-size-trigger" title="表格大小">
      <Icon icon="ri:arrow-up-down-fill" width="18" height="18" />
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="small">紧凑</el-dropdown-item>
        <el-dropdown-item command="default">默认</el-dropdown-item>
        <el-dropdown-item command="large">宽松</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  // 表格尺寸：small / default / large（v-model）
  modelValue: {
    type: String,
    default: 'small'
  }
})

const emit = defineEmits(['update:modelValue'])

const handleCommand = (val) => {
  if (val === props.modelValue) return
  emit('update:modelValue', val)
}
</script>

<style scoped lang="scss">
.table-size-trigger {
  display: inline-flex;
  align-items: center;
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
