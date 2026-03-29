<template>
  <el-tag v-if="dictItem" :type="dictItem.color || 'info'" :size="size">
    {{ dictItem.label }}
  </el-tag>
  <span v-else class="dict-default">{{ formattedValue }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { ElTag } from 'element-plus'

const props = defineProps({
  value: {
    type: [String, Number, Boolean],
    default: null
  },
  options: {
    type: Array,
    default: () => []
  },
  size: {
    type: String,
    default: 'default'
  }
})

const dictItem = computed(() => {
  if (props.value === undefined || props.value === null) {
    return null
  }
  return props.options.find(
    (item) => String(item.value) === String(props.value)
  )
})

const formattedValue = computed(() => {
  if (props.value === undefined || props.value === null) {
    return '-'
  }
  return props.value
})
</script>

<style scoped>
.dict-default {
  color: var(--el-text-color-regular);
}
</style>
