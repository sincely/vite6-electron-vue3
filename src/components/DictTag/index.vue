<template>
  <el-tag
    v-if="currentDict"
    :type="currentDict.tagType || 'info'"
    :effect="currentDict.effect || 'light'"
    class="dict-tag"
  >
    {{ currentDict.label }}
  </el-tag>
  <span v-else>{{ value }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 字典值
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  // 字典配置列表
  // 格式: [{ label: '启用', value: 1, tagType: 'success' }, ...]
  options: {
    type: Array,
    default: () => []
  },
  // 字典值的键名，默认为 value
  valueKey: {
    type: String,
    default: 'value'
  }
})

// 查找匹配的字典项
const currentDict = computed(() => {
  return props.options.find(
    (item) => String(item[props.valueKey]) === String(props.value)
  )
})
</script>

<style scoped>
.dict-tag {
  display: inline-block;
  white-space: nowrap;
}
</style>
