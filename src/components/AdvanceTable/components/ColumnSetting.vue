<template>
  <el-popover
    placement="bottom-end"
    trigger="click"
    width="300"
    popper-class="column-setting-popover"
  >
    <template #reference>
      <el-button circle icon="setting" />
    </template>

    <div class="column-setting">
      <div class="setting-header">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          列展示/排序
        </el-checkbox>
        <el-button type="primary" link @click="reset">重置</el-button>
      </div>
      <el-divider style="margin: 12px 0" />
      <div class="setting-body">
        <div
          v-for="(element, index) in list"
          :key="element.prop || element.label"
          class="column-item"
          :class="{ 'is-fixed': isFixed(element) }"
          draggable="true"
          @dragstart="dragStart($event, index)"
          @dragover="dragOver($event, index)"
          @dragend="dragEnd"
          @drop="drop($event, index)"
        >
          <div class="drag-icon">
            <el-icon v-if="!isFixed(element)" style="cursor: move">
              <Rank />
            </el-icon>
          </div>
          <el-checkbox
            v-model="element.show"
            :disabled="isFixed(element)"
            @change="handleCheckChange"
          >
            {{ element.label }}
          </el-checkbox>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Operation, Rank } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash-es'

const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:columns'])

const list = ref([])
const checkAll = ref(true)
const isIndeterminate = ref(false)

// 初始列状态备份，用于重置
let initialColumns = []

// 判断是否是固定列（Action列或其他固定列）
// 这里假设 label 为 '操作' 或者 fixed 属性存在的列为固定列
const isFixed = (col) => {
  return col.label === '操作' || !!col.fixed
}

// 初始化
watch(
  () => props.columns,
  (newVal) => {
    if (newVal) {
      // 简单比对 prop 列表，如果不同则重新初始化
      const currentProps = list.value.map((c) => c.prop).join(',')
      const newProps = newVal.map((c) => c.prop).join(',')

      if (currentProps !== newProps) {
        initialColumns = cloneDeep(newVal).map((col) => ({
          ...col,
          show: !(col.show === false || col.hide)
        }))
        list.value = cloneDeep(initialColumns)

        // 计算全选状态但不触发 emit，防止循环
        const checkedCount = list.value.filter((item) => item.show).length
        checkAll.value = checkedCount === list.value.length
        isIndeterminate.value =
          checkedCount > 0 && checkedCount < list.value.length
      }
    }
  },
  { immediate: true, deep: true }
)

const updateCheckState = () => {
  const checkedCount = list.value.filter((item) => item.show).length
  checkAll.value = checkedCount === list.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < list.value.length

  // 触发更新
  emitColumns()
}

const handleCheckAllChange = (val) => {
  list.value.forEach((item) => {
    if (!isFixed(item)) {
      item.show = val
    }
  })
  isIndeterminate.value = false
  emitColumns()
}

const handleCheckChange = () => {
  updateCheckState()
}

const reset = () => {
  list.value = cloneDeep(initialColumns)
  updateCheckState()
}

const emitColumns = () => {
  // 过滤出显示的列，并保持排序
  // 这里我们需要传递完整的列配置回去，但带有 show 属性，或者由父组件根据 show 过滤
  // 为了简单，我们传递完整的 list，父组件负责根据 show 属性过滤显示
  emit('update:columns', list.value)
}

// 拖拽逻辑
let dragIndex = null

const dragStart = (e, index) => {
  if (isFixed(list.value[index])) {
    e.preventDefault()
    return
  }
  dragIndex = index
  e.dataTransfer.effectAllowed = 'move'
}

const dragOver = (e, index) => {
  e.preventDefault()
}

const dragEnd = () => {
  dragIndex = null
}

const drop = (e, index) => {
  e.preventDefault()
  if (dragIndex !== null && dragIndex !== index) {
    // 如果目标位置是固定列，不允许放置
    if (isFixed(list.value[index])) return

    const item = list.value[dragIndex]
    list.value.splice(dragIndex, 1)
    list.value.splice(index, 0, item)
    emitColumns()
  }
}
</script>

<style scoped lang="scss">
.setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.setting-body {
  max-height: 300px;
  overflow-y: auto;
}

.column-item {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  margin-bottom: 2px;
  background-color: var(--color-bg-card);
  border-radius: 4px;

  &:hover {
    background-color: var(--color-bg-hover);
  }

  &.is-fixed {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .drag-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    margin-right: 4px;
    color: var(--color-text-secondary);
  }
}
</style>
