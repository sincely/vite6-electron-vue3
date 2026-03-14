<template>
  <div class="edit-table">
    <el-form ref="formRef" :model="formData" :rules="rules" size="small">
      <el-table
        ref="tableRef"
        :data="formData.list"
        v-bind="mergedConfig.table"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />

        <template v-for="column in visibleColumns" :key="column.prop">
          <!-- selection / index 列 -->
          <el-table-column
            v-if="column.type === 'selection'"
            type="selection"
            :width="column.width || 55"
          />
          <el-table-column
            v-else-if="column.type === 'index'"
            type="index"
            :label="column.label"
            :width="column.width || 60"
          />

          <!-- 普通列 / 编辑列 -->
          <el-table-column
            v-else
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :sortable="column.sortable"
            :show-overflow-tooltip="true"
          >
            <!-- 自定义表头 -->
            <template #header="{ column, $index }">
              <slot
                v-if="column.headerSlot"
                :name="column.headerSlot"
                :column="column"
                :index="$index"
              />
              <span v-else>{{ column.label }}</span>
            </template>

            <template #default="{ row, $index }">
              <!-- 处于编辑状态且列可编辑 -->
              <div
                v-if="isEditing(row) && column.editable !== false"
                class="edit-cell"
                :class="{ required: isRequired(column.prop) }"
              >
                <el-form-item
                  :prop="`list.${$index}.${column.prop}`"
                  :rules="getRules(column.prop)"
                  class="edit-form-item"
                >
                  <!-- 插槽优先 -->
                  <slot
                    v-if="column.editSlot"
                    :name="column.editSlot"
                    :row="row"
                    :index="$index"
                    :column="column"
                  />

                  <!-- 输入框 -->
                  <el-input
                    v-else-if="column.editType === 'input' || !column.editType"
                    v-model="row[column.prop]"
                    :placeholder="
                      column.editProps?.placeholder || `请输入${column.label}`
                    "
                    :style="{ width: column.editWidth || '100%' }"
                    v-bind="column.editProps"
                  />

                  <!-- 数字输入框 -->
                  <el-input-number
                    v-else-if="column.editType === 'number'"
                    v-model.number="row[column.prop]"
                    :placeholder="
                      column.editProps?.placeholder || `请输入${column.label}`
                    "
                    :style="{ width: column.editWidth || '100%' }"
                    v-bind="column.editProps"
                  />

                  <!-- 选择框 -->
                  <el-select
                    v-else-if="column.editType === 'select'"
                    v-model="row[column.prop]"
                    :placeholder="
                      column.editProps?.placeholder || `请选择${column.label}`
                    "
                    :style="{ width: column.editWidth || '100%' }"
                    v-bind="column.editProps"
                  >
                    <el-option
                      v-for="opt in column.options"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>

                  <!-- 多选框 -->
                  <el-checkbox-group
                    v-else-if="column.editType === 'check-box-group'"
                    v-model="row[column.prop]"
                    v-bind="column.editProps"
                  >
                    <el-checkbox
                      v-for="opt in column.editProps?.options"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </el-checkbox>
                  </el-checkbox-group>

                  <!-- 单选框 -->
                  <el-radio-group
                    v-else-if="column.editType === 'radio-group'"
                    v-model="row[column.prop]"
                    v-bind="column.editProps"
                  >
                    <el-radio
                      v-for="opt in column.editProps?.options"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </el-radio>
                  </el-radio-group>

                  <!-- 日期选择 -->
                  <el-date-picker
                    v-else-if="
                      [
                        'date',
                        'datetime',
                        'daterange',
                        'datetimerange',
                        'month',
                        'year',
                        'week'
                      ].includes(column.editType)
                    "
                    v-model="row[column.prop]"
                    :type="column.editType"
                    :placeholder="
                      column.editProps?.placeholder || `请选择${column.label}`
                    "
                    :style="{ width: column.editWidth || '100%' }"
                    v-bind="column.editProps"
                  />
                </el-form-item>
              </div>

              <!-- 非编辑状态 -->
              <div v-else class="view-cell">
                <slot
                  v-if="column.slot"
                  :name="column.slot"
                  :row="row"
                  :index="$index"
                  :column="column"
                />
                <span v-else>{{ formatDisplayValue(row, column) }}</span>
              </div>
            </template>
          </el-table-column>
        </template>

        <!-- 操作列 -->
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row, $index }">
            <div v-if="isEditing(row)" class="action-cell">
              <el-button type="success" link @click="handleSave(row, $index)">
                保存
              </el-button>
              <el-button type="warning" link @click="handleCancel(row, $index)">
                取消
              </el-button>
            </div>
            <div v-else class="action-cell">
              <el-button type="primary" link @click="handleEdit(row, $index)">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row, $index)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>

        <!-- 空状态 -->
        <template #empty>
          <div class="no-data">
            <img src="@/assets/images/empty.png" alt="无数据" />
            <p>暂无数据</p>
          </div>
        </template>
      </el-table>
    </el-form>

    <!-- 底部添加按钮 -->
    <div v-if="mergedConfig.showAdd" class="table-footer">
      <el-button type="primary" plain class="add-btn" @click="handleAdd">
        + 添加一行
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  // 列配置
  columns: {
    type: Array,
    required: true
  },
  // 配置项
  config: {
    type: Object,
    default: () => ({})
  },
  // 校验规则
  rules: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'update:data',
  'save',
  'delete',
  'add',
  'sort-change'
])

// 表单引用
const formRef = ref(null)
// 表格引用
const tableRef = ref(null)

// 内部数据（用于处理编辑状态）
const tableData = ref([])
// 正在编辑的行 ID 列表
const editingIds = ref([])
// 原始数据备份（用于取消编辑时恢复）
const originalDataMap = new Map()

// 将 tableData 包装为 el-form 接受的 model 对象
const formData = computed(() => ({
  list: tableData.value
}))

// 合并配置
const mergedConfig = computed(() => {
  return {
    table: {
      border: true,
      stripe: true,
      ...props.config.table
    },
    rowKey: props.config.rowKey || 'id', // 唯一键字段名
    showAdd: props.config.showAdd ?? true // 是否显示添加按钮
  }
})

// 可见列
const visibleColumns = computed(() => {
  return props.columns.filter((col) => !col.hide)
})

// 监听外部数据变化
watch(
  () => props.data,
  (newVal) => {
    // 只有当内部数据与外部不一致时才更新，避免编辑时冲突
    // 这里简单全量更新，实际场景可能需要 diff
    if (newVal) {
      tableData.value = cloneDeep(newVal)
    }
  },
  { immediate: true, deep: true }
)

// 判断行是否处于编辑状态
const isEditing = (row) => {
  const key = row[mergedConfig.value.rowKey]
  // 如果是新添加的行（可能没有 ID），检查是否有 _isNew 标记
  if (row._isNew) return true
  return editingIds.value.includes(key)
}

// 开始编辑
const handleEdit = (row) => {
  const key = row[mergedConfig.value.rowKey]
  if (!key && key !== 0) {
    console.warn('EditTable: rowKey not found in row data')
    return
  }

  // 备份原始数据
  originalDataMap.set(key, cloneDeep(row))
  editingIds.value.push(key)
}

// 取消编辑
const handleCancel = (row, index) => {
  if (row._isNew) {
    // 如果是新行，直接删除（新添加的行，取消时应该移除）
    tableData.value.splice(index, 1)
  } else {
    const key = row[mergedConfig.value.rowKey]
    // 恢复原始数据
    const original = originalDataMap.get(key)
    if (original) {
      Object.assign(row, original)
      originalDataMap.delete(key)
    }
    // 移除编辑状态
    const idx = editingIds.value.indexOf(key)
    if (idx > -1) editingIds.value.splice(idx, 1)
  }
}

// 获取行校验规则
// 获取行校验规则
const getRules = (prop) => {
  // 优先使用外部传入的 rules
  if (props.rules && props.rules[prop]) {
    return props.rules[prop]
  }

  // 检查列配置中的 rules
  const column = props.columns.find((col) => col.prop === prop)
  if (column?.rules) {
    return column.rules
  }

  return []
}
// 判断字段是否必填，用于展示必填红星/红三角
const isRequired = (prop) => {
  // 1. 从 getRules 动态获取合并后的规则
  const rules = getRules(prop)
  if (Array.isArray(rules)) {
    return rules.some((r) => r.required)
  }
  return rules?.required || false
}

// 格式化非编辑状态下的显示值
const formatDisplayValue = (row, column) => {
  const value = row[column.prop]
  if (value === null || value === undefined || value === '') return '-'

  // 处理 Select / Radio (从 options 中找 label)
  if (
    column.editType === 'select' ||
    column.editType === 'radio' ||
    column.editType === 'radio-group'
  ) {
    const options = column.options || column.editProps?.options || []
    const option = options.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  // 处理 Checkbox / CheckboxGroup (数组转 label 拼接)
  if (column.editType === 'checkbox' || column.editType === 'check-box-group') {
    if (Array.isArray(value)) {
      const options = column.options || column.editProps?.options || []
      const labels = value.map((val) => {
        const option = options.find((opt) => opt.value === val)
        return option ? option.label : val
      })
      return labels.join(', ')
    }
    // 单个 checkbox (布尔值)
    return value ? '是' : '否'
  }

  // 处理日期范围 (数组转字符串拼接)
  if (
    column.editType === 'daterange' ||
    column.editType === 'datetimerange' ||
    column.editType === 'monthrange'
  ) {
    if (Array.isArray(value) && value.length === 2) {
      const separator = column.editProps?.rangeSeparator || ' 至 '
      return `${value[0]}${separator}${value[1]}`
    }
  }

  return value
}

// 保存
const handleSave = async (row, index) => {
  // 触发表单校验
  try {
    // 这里需要精细化校验当前行的字段，而不是所有字段
    // 简单起见，我们遍历所有正在编辑的列进行校验
    const validateFields = props.columns
      .filter((col) => !col.hide && col.prop)
      .map((col) => `list.${index}.${col.prop}`)

    await formRef.value.validateField(validateFields)
  } catch (error) {
    ElMessage.warning('请检查输入项')
    return
  }

  const key = row[mergedConfig.value.rowKey]

  // 移除 _isNew 标记
  if (row._isNew) delete row._isNew

  // 移除编辑状态
  if (key) {
    const idx = editingIds.value.indexOf(key)
    if (idx > -1) editingIds.value.splice(idx, 1)
    originalDataMap.delete(key)
  }

  // 触发保存事件，将当前行数据传出
  emit('save', row, index)
  // 同步更新外部数据
  emit('update:data', tableData.value)
}

// 删除
const handleDelete = (row, index) => {
  tableData.value.splice(index, 1)
  emit('delete', row, index)
  emit('update:data', tableData.value)
}

// 添加行
const handleAdd = () => {
  const newRow = { _isNew: true }
  // 初始化列数据
  props.columns.forEach((col) => {
    if (col.prop) {
      // 根据 editType 设置默认值
      if (col.editType === 'number') {
        newRow[col.prop] = undefined // 数字类型初始化为 undefined
      } else if (
        col.editType === 'check-box-group' ||
        col.editType === 'radio-group'
      ) {
        newRow[col.prop] = [] // checkbox group 初始化为数组
      } else {
        newRow[col.prop] = ''
      }
    }
  })

  tableData.value.push(newRow)
  emit('add', newRow)
}

// 排序变化
const handleSortChange = (data) => {
  emit('sort-change', data)
}

defineExpose({
  tableRef
})
</script>

<style scoped lang="scss">
.edit-table {
  width: 100%;
}

.table-footer {
  margin-top: 12px;
  text-align: center;

  .add-btn {
    width: 100%;
    border-style: dashed;
  }
}

.no-data {
  padding: 40px 0;
  text-align: center;

  img {
    width: 120px;
    opacity: 0.6;
  }
}

.edit-cell {
  position: relative;
  width: 100%;

  &.required::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    content: '';
    border-top: 6px solid var(--color-danger);
    border-right: 6px solid transparent;
  }
}

.edit-form-item {
  margin-bottom: 0;

  // :deep(.el-form-item__content) {
  //   line-height: inherit;
  // }

  // :deep(.el-form-item__error) {
  //   top: 100%;
  //   z-index: 1;
  //   padding-top: 2px;
  // }
}
</style>
