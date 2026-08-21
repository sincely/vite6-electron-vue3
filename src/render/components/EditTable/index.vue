<template>
  <div class="edit-table">
    <el-form ref="formRef" :model="formData" :rules="rules">
      <el-table
        ref="tableRef"
        :data="formData.list"
        v-bind="mergedConfig.table"
        size="small"
        @sort-change="handleSortChange"
      >
        <template v-for="column in visibleColumns" :key="column.prop">
          <el-table-column
            v-if="column.type === 'index'"
            type="index"
            :label="column.label || '序号'"
            :width="column.width || 60"
            :align="column.align || 'center'"
            :fixed="column.fixed"
          />

          <!-- 普通列/编辑列 -->
          <el-table-column
            v-else
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth || mergedConfig.columnMinWidth"
            :align="column.align || 'center'"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :show-overflow-tooltip="!hasEditingRow"
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
                :class="[
                  isRequired(column.prop) ? 'required' : '',
                  'edit-cell'
                ]"
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
                    v-else-if="column.type === 'input' || !column.type"
                    v-model="row[column.prop]"
                    :placeholder="
                      column.componentProps?.placeholder ||
                      `请输入${column.label}`
                    "
                    :style="{ width: '100%' }"
                    v-bind="getEditProps(column)"
                    clearable
                  />

                  <el-input
                    v-else-if="column.type === 'textarea'"
                    v-model="row[column.prop]"
                    type="textarea"
                    :placeholder="
                      column.componentProps?.placeholder ||
                      `请输入${column.label}`
                    "
                    :style="{ width: '100%' }"
                    v-bind="getEditProps(column)"
                  />

                  <!-- 数字输入框 -->
                  <el-input-number
                    v-else-if="column.type === 'number'"
                    v-model.number="row[column.prop]"
                    :placeholder="
                      column.componentProps?.placeholder ||
                      `请输入${column.label}`
                    "
                    :style="{ width: '100%' }"
                    v-bind="getEditProps(column)"
                  />

                  <!-- 选择框 -->
                  <el-select
                    v-else-if="column.type === 'select'"
                    v-model="row[column.prop]"
                    :placeholder="
                      column.componentProps?.placeholder ||
                      `请选择${column.label}`
                    "
                    :style="{ width: '100%' }"
                    v-bind="getEditProps(column)"
                  >
                    <el-option
                      v-for="opt in getColumnOptions(column)"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>

                  <el-switch
                    v-else-if="column.type === 'switch'"
                    v-model="row[column.prop]"
                    class="center-control"
                    v-bind="getEditProps(column)"
                  />

                  <el-checkbox-group
                    v-else-if="
                      [
                        'checkbox-group',
                        'check-box-group',
                        'check-bo-groub'
                      ].includes(column.type)
                    "
                    v-model="row[column.prop]"
                    class="center-control"
                    v-bind="getEditProps(column)"
                  >
                    <el-checkbox
                      v-for="opt in getColumnOptions(column)"
                      :key="opt.value"
                      :value="opt.value"
                      :label="opt.label"
                    />
                  </el-checkbox-group>

                  <el-radio-group
                    v-else-if="['radio-group', 'radio'].includes(column.type)"
                    v-model="row[column.prop]"
                    class="center-control"
                    v-bind="getEditProps(column)"
                  >
                    <el-radio
                      v-for="opt in getColumnOptions(column)"
                      :key="opt.value"
                      :value="opt.value"
                      :label="opt.label"
                    />
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
                        'year'
                      ].includes(column.type)
                    "
                    v-model="row[column.prop]"
                    :type="column.type"
                    :placeholder="
                      column.componentProps?.placeholder ||
                      `请选择${column.label}`
                    "
                    clearable
                    :style="{ width: '100%' }"
                    :show-week-number="column.prop.type === 'week'"
                    v-bind="getEditProps(column)"
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
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template #default="{ row, $index }">
            <div v-if="isEditing(row)" class="table-action">
              <el-button
                link
                type="success"
                size="small"
                :icon="Check"
                title="保存"
                @click="handleSave(row, $index)"
              />
              <el-button
                link
                type="warning"
                size="small"
                :icon="Close"
                title="取消"
                @click="handleCancel(row, $index)"
              />
            </div>
            <div v-else class="table-action">
              <el-button
                link
                type="primary"
                size="small"
                :icon="Edit"
                title="编辑"
                @click="handleEdit(row, $index)"
              />
              <el-button
                link
                type="danger"
                size="small"
                :icon="Delete"
                title="删除"
                @click="handleDelete(row, $index)"
              />
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
import { cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Edit, Delete, Check, Close } from '@element-plus/icons-vue'

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
    showAdd: props.config.showAdd ?? true, // 是否显示添加按钮
    columnMinWidth: props.config.columnMinWidth || 160
  }
})

// 可见列
const visibleColumns = computed(() => {
  return props.columns.filter((col) => !col.hide)
})

// 是否有正在编辑的行（用于禁用 show-overflow-tooltip，避免 tooltip 包裹破坏 form 上下文）
const hasEditingRow = computed(() => {
  return (
    editingIds.value.length > 0 || tableData.value.some((row) => row._isNew)
  )
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
const getRules = (prop) => {
  // 检查列配置中的 rules
  const target = props.columns.find((col) => col.prop === prop)
  console.log('target', target)
  if (target.required) {
    return target.rules
  }

  return []
}

// 获取编辑组件的 props（排除 options，避免与手动渲染的选项冲突）
const getEditProps = (column) => {
  if (!column.componentProps) return {}
  const { options, ...rest } = column.componentProps
  return rest
}

const getColumnOptions = (column) => {
  return column.options || column.componentProps?.options || []
}

// 判断字段是否必填，用于展示必填红星/红三角
const isRequired = (prop) => {
  // 检查列配置中的 required 字段
  const column = props.columns.find((col) => col.prop === prop)
  if (column?.required) {
    return true
  }

  return false
}

// 格式化非编辑状态下的显示值
const formatDisplayValue = (row, column) => {
  const value = row[column.prop]
  if (value === null || value === undefined || value === '') return '-'

  // 处理 Select / Radio (从 options 中找 label)
  if (
    column.type === 'select' ||
    column.type === 'radio' ||
    column.type === 'radio-group'
  ) {
    const options = getColumnOptions(column)
    const option = options.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  // 处理 Checkbox / CheckboxGroup (数组转 label 拼接)
  if (
    column.type === 'checkbox' ||
    ['checkbox-group', 'check-box-group', 'check-bo-groub'].includes(
      column.type
    )
  ) {
    if (Array.isArray(value)) {
      const options = getColumnOptions(column)
      const labels = value.map((val) => {
        const option = options.find((opt) => opt.value === val)
        return option ? option.label : val
      })
      return labels.join(', ')
    }
    return value ? '是' : '否'
  }

  if (column.type === 'switch') {
    return value ? '是' : '否'
  }

  // 处理日期范围 (数组转字符串拼接)
  if (
    column.type === 'daterange' ||
    column.type === 'datetimerange' ||
    column.type === 'monthrange'
  ) {
    if (Array.isArray(value) && value.length === 2) {
      const separator = column.componentProps?.rangeSeparator || ' 至 '
      return `${value[0]}${separator}${value[1]}`
    }
  }

  return value
}

// 保存
const handleSave = async (row, index) => {
  // 触发表单校验
  try {
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
      // 根据 type 设置默认值
      if (col.type === 'number') {
        newRow[col.prop] = undefined // 数字类型初始化为 undefined
      } else if (
        ['checkbox-group', 'check-box-group', 'check-bo-groub'].includes(
          col.type
        )
      ) {
        newRow[col.prop] = [] // checkbox group 初始化为空数组
      } else if (col.type === 'switch') {
        newRow[col.prop] = false
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

const rules = computed(() => {
  const result = {}
  props.columns.forEach((col) => {
    if (col.prop && col.rules) {
      result[col.prop] = col.rules
    }
  })
  return result
})

defineExpose({
  tableRef
})
</script>

<style scoped lang="scss">
.edit-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 12px;
  overflow-y: hidden;
  background: var(--glass-surface);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
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
  // position: relative;
  width: 100%;

  &.required::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    content: '';
    border-top: 8px solid var(--color-danger);
    border-right: 8px solid transparent;
  }
}

.edit-form-item {
  width: 100%;
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    justify-content: center;
  }

  :deep(.center-control) {
    justify-content: center;
  }
}
</style>
