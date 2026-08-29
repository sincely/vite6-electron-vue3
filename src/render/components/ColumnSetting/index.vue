<template>
  <el-popover
    placement="bottom-end"
    trigger="click"
    width="300"
    popper-class="column-setting-popover"
  >
    <template #reference>
      <span class="column-setting-trigger" title="列设置">
        <Icon icon="ri:align-right" width="18" height="18" />
      </span>
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
        <div class="header-actions">
          <span class="action-item" title="恢复默认列设置" @click="reset">
            <Icon icon="ri:reset-right-line" width="14" height="14" />
            <span>重置</span>
          </span>
          <span class="action-item" title="保存当前列设置" @click="save">
            <Icon icon="ri:save-line" width="14" height="14" />
            <span>保存</span>
          </span>
        </div>
      </div>
      <el-divider style="margin: 12px 0" />
      <div class="setting-body">
        <div
          v-for="(element, index) in list"
          :key="element.prop || element.label"
          class="column-item"
          :draggable="!isDragDisabled(element)"
          @dragstart="dragStart($event, index)"
          @dragover="dragOver($event, index)"
          @dragend="dragEnd"
          @drop="drop($event, index)"
        >
          <div
            class="drag-icon"
            :title="isDragDisabled(element) ? '固定列，不可拖拽' : ''"
          >
            <Icon
              v-if="!isDragDisabled(element)"
              icon="ri:drag-move-2-fill"
              class="drag-rank-icon"
              width="14"
              height="14"
            />
            <Icon
              v-else
              icon="ri:unpin-line"
              class="pin-icon"
              width="14"
              height="14"
            />
          </div>
          <el-checkbox v-model="element.show" @change="handleCheckChange">
            {{ element.label }}
          </el-checkbox>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ElMessage } from 'element-plus'
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

// 列设置持久化：以“列集合签名”为存储键（排序无关，调整顺序不会改变键）
const STORAGE_PREFIX = 'column-setting:'
const colKey = (col) => col.prop || col.label
const signatureOf = (cols) => [...cols].map(colKey).sort().join('|')

// 读取已保存的列设置（显隐 + 排序）
const readSaved = (key) => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    const saved = raw ? JSON.parse(raw) : null
    return Array.isArray(saved) ? saved : null
  } catch {
    return null
  }
}

// 应用已保存设置：命中的列恢复 show，并按保存顺序排序；
// 新增（未保存过）的列保持原相对顺序、排在最后
const applySaved = (cols, key) => {
  const saved = readSaved(key)
  if (!saved) return cols
  const order = saved.map((s) => s.key)
  const result = cols.map((c) => {
    const hit = saved.find((s) => s.key === colKey(c))
    return hit ? { ...c, show: hit.show !== false } : c
  })
  result.sort((a, b) => {
    const ia = order.indexOf(colKey(a))
    const ib = order.indexOf(colKey(b))
    return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib)
  })
  return result
}

// “操作”列为特殊列：允许拖拽（其位置由列设置排序决定）
const isActionColumn = (col) => col.label === '操作'

// 是否禁用拖拽（固定列不可拖拽；“操作”列允许拖拽；显式 draggable: false 的内置列除外）
const isDragDisabled = (col) => {
  if (col.draggable === false) return true
  return !!col.fixed && !isActionColumn(col)
}

const updateCheckState = () => {
  const checkedCount = list.value.filter((item) => item.show).length
  checkAll.value = checkedCount === list.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < list.value.length

  // 触发更新
  emitColumns()
}

// 初始化（含恢复已保存的列设置：显隐 + 排序）
let appliedSignature = null
watch(
  () => props.columns,
  (newVal) => {
    if (!newVal || !newVal.length) return
    // 以列集合签名为准（与顺序无关），emit 回流时签名不变、不会误重置
    const signature = signatureOf(newVal)
    if (signature === appliedSignature) return
    appliedSignature = signature

    initialColumns = cloneDeep(newVal).map((col) => ({
      ...col,
      show: !(col.show === false || col.hide || col.hidden)
    }))
    const base = cloneDeep(initialColumns)
    list.value = applySaved(base, signature)

    if (list.value !== base) {
      // 存在已保存的设置：初始化后回写一次，让表格立即呈现恢复的显隐/顺序
      updateCheckState()
    } else {
      // 计算全选状态但不触发 emit，防止循环
      const checkedCount = list.value.filter((item) => item.show).length
      checkAll.value = checkedCount === list.value.length
      isIndeterminate.value =
        checkedCount > 0 && checkedCount < list.value.length
    }
  },
  { immediate: true, deep: true }
)

const handleCheckAllChange = (val) => {
  list.value.forEach((item) => {
    item.show = val
  })
  isIndeterminate.value = false
  emitColumns()
}

const handleCheckChange = () => {
  updateCheckState()
}

const reset = () => {
  // 重置同时清除已保存的列设置，恢复默认后下次进入不再恢复
  try {
    localStorage.removeItem(STORAGE_PREFIX + appliedSignature)
  } catch {
    /* localStorage 不可用时忽略 */
  }
  list.value = cloneDeep(initialColumns)
  updateCheckState()
}

// 保存：将当前显隐 + 排序持久化到 localStorage，下次进入自动恢复
const save = () => {
  try {
    localStorage.setItem(
      STORAGE_PREFIX + appliedSignature,
      JSON.stringify(
        list.value.map((item) => ({
          key: colKey(item),
          show: item.show !== false
        }))
      )
    )
    ElMessage.success('列设置已保存')
  } catch {
    ElMessage.error('列设置保存失败')
  }
}

// 函数声明（而非箭头函数）：hoisting 保证初始化 watch 中可安全调用
function emitColumns() {
  // 过滤出显示的列，并保持排序
  // 这里我们需要传递完整的列配置回去，但带有 show 属性，或者由父组件根据 show 过滤
  // 为了简单，我们传递完整的 list，父组件负责根据 show 属性过滤显示
  emit(
    'update:columns',
    list.value.map((item) => ({
      ...item,
      hide: item.show === false,
      hidden: item.show === false
    }))
  )
}

// 拖拽逻辑
let dragIndex = null

const dragStart = (e, index) => {
  if (isDragDisabled(list.value[index])) {
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
    if (isDragDisabled(list.value[index])) return

    const item = list.value[dragIndex]
    list.value.splice(dragIndex, 1)
    list.value.splice(index, 0, item)
    emitColumns()
  }
}
</script>

<style scoped lang="scss">
.column-setting-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--el-text-color-regular);
  cursor: pointer;
}

.setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;

    .action-item {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      font-size: 12px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
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

  // background-color: var(--color-bg-card);
  border-radius: 4px;

  &:hover {
    background-color: var(--color-bg-hover);
  }

  .drag-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    margin-right: 4px;
    color: var(--color-text-secondary);

    .drag-rank-icon {
      cursor: move;
    }
  }
}
</style>
