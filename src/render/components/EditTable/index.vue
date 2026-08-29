<template>
  <div class="edit-table" :class="{ 'is-drag-sort': mergedConfig.dragSort }">
    <!-- 表格工具栏：列设置 / 样式设置 -->
    <div v-if="mergedConfig.showToolbar" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <TableRefresh :loading="loading" @refresh="refresh" />
        <!-- 设置表格大小（点击箭头下拉） -->
        <TableSize v-model="tableSize" />
        <!-- 全屏切换 -->
        <TableFullscreen />
        <ColumnSetting v-model:columns="localColumns" />
        <StyleSetting
          v-model:stripe="tableStyle.stripe"
          v-model:border="tableStyle.border"
          v-model:header-bg="tableStyle.headerBg"
        />
      </div>
    </div>

    <el-table
      ref="tableRef"
      :data="tableData"
      v-bind="mergedConfig.table"
      :stripe="tableStyle.stripe"
      :border="tableStyle.border"
      :style="headerBgCssVar"
      :size="tableSize"
      :row-key="mergedConfig.rowKey"
      :max-height="tableHeight"
      :show-summary="mergedConfig.showSummary"
      :summary-method="mergedConfig.summaryMethod || handleSummary"
      @selection-change="handleSelectionChange"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
    >
      <!-- 行多选列（依赖 rowKey，配合 reserve-selection 在数据刷新后保持勾选），始终第一列 -->
      <el-table-column
        v-if="mergedConfig.selection"
        type="selection"
        width="50"
        align="center"
        :reserve-selection="true"
        fixed="left"
      />

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
          :column-key="column.prop"
          :filters="column.filters"
          :filter-method="column.filterMethod"
          :filter-multiple="column.filterMultiple ?? true"
          show-overflow-tooltip
        >
          <!-- 筛选图标 -->
          <template #filter-icon>
            <Icon icon="ri:filter-line" />
          </template>
          <!-- 自定义表头（headerSlot 在列配置上，el-table 内部 column 对象不携带该字段） -->
          <template #header="scope">
            <template v-if="getColConfig(scope.column)?.headerSlot">
              <slot
                :name="getColConfig(scope.column).headerSlot"
                :column="getColConfig(scope.column)"
                :index="scope.$index"
              />
            </template>
            <span v-else>{{ scope.column.label }}</span>
          </template>

          <template #default="{ row, $index }">
            <!-- 处于编辑状态且列可编辑 -->
            <div
              v-if="isEditing(row) && column.editable !== false"
              :class="[
                isRequired(column.prop) ? 'required' : '',
                cellErrorOf(row, $index, column.prop) ? 'is-error' : '',
                'edit-cell'
              ]"
            >
              <div class="edit-control">
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
                  size="small"
                  :placeholder="getPlaceholder(column, row)"
                  :style="{ width: '100%' }"
                  v-bind="getEditProps(column, row)"
                  clearable
                  @change="(val) => handleCellChange(column, row, $index, val)"
                />

                <el-input
                  v-else-if="column.type === 'textarea'"
                  v-model="row[column.prop]"
                  type="textarea"
                  size="small"
                  :placeholder="getPlaceholder(column, row)"
                  :style="{ width: '100%' }"
                  v-bind="getEditProps(column, row)"
                  @change="(val) => handleCellChange(column, row, $index, val)"
                />

                <!-- 数字输入框 -->
                <el-input-number
                  v-else-if="column.type === 'number'"
                  v-model.number="row[column.prop]"
                  size="small"
                  :placeholder="getPlaceholder(column, row)"
                  :style="{ width: '100%' }"
                  v-bind="getEditProps(column, row)"
                  @change="(val) => handleCellChange(column, row, $index, val)"
                />

                <!-- 金额输入框：两位小数、隐藏步进按钮，具体展示由 summary/格式化接管 -->
                <el-input-number
                  v-else-if="column.type === 'money'"
                  v-model.number="row[column.prop]"
                  size="small"
                  :placeholder="getPlaceholder(column, row)"
                  :precision="2"
                  :controls="false"
                  :style="{ width: '100%' }"
                  v-bind="getEditProps(column, row)"
                  @change="(val) => handleCellChange(column, row, $index, val)"
                />

                <!-- 选择框 -->
                <el-select
                  v-else-if="column.type === 'select'"
                  v-model="row[column.prop]"
                  size="small"
                  :placeholder="getPlaceholder(column, row, '选择')"
                  :style="{ width: '100%' }"
                  v-bind="getEditProps(column, row)"
                  @change="(val) => handleCellChange(column, row, $index, val)"
                >
                  <el-option
                    v-for="opt in getColumnOptions(column, row)"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>

                <el-switch
                  v-else-if="column.type === 'switch'"
                  v-model="row[column.prop]"
                  size="small"
                  class="center-control"
                  v-bind="getEditProps(column, row)"
                  @change="(val) => handleCellChange(column, row, $index, val)"
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
                  size="small"
                  class="center-control"
                  v-bind="getEditProps(column, row)"
                  @change="(val) => handleCellChange(column, row, $index, val)"
                >
                  <el-checkbox
                    v-for="opt in getColumnOptions(column, row)"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                  />
                </el-checkbox-group>

                <el-radio-group
                  v-else-if="['radio-group', 'radio'].includes(column.type)"
                  v-model="row[column.prop]"
                  size="small"
                  class="center-control"
                  v-bind="getEditProps(column, row)"
                  @change="(val) => handleCellChange(column, row, $index, val)"
                >
                  <el-radio
                    v-for="opt in getColumnOptions(column, row)"
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
                  size="small"
                  :placeholder="getPlaceholder(column, row, '选择')"
                  clearable
                  :style="{ width: '100%' }"
                  :show-week-number="column.prop.type === 'week'"
                  v-bind="getEditProps(column, row)"
                  @change="(val) => handleCellChange(column, row, $index, val)"
                />
              </div>
              <!-- 校验错误提示：绝对定位悬浮于单元格下方，不改变行高 -->
              <span
                v-if="cellErrorOf(row, $index, column.prop)"
                class="cell-error"
              >
                {{ cellErrorOf(row, $index, column.prop) }}
              </span>
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
      <el-table-column
        v-if="showActionColumn"
        label="操作"
        width="90"
        align="center"
        fixed="right"
      >
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
  </div>
</template>

<script setup>
import { cloneDeep } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import { Edit, Delete, Check, Close } from '@element-plus/icons-vue'
import { useTableHeight } from '@/hooks/useTableHeight'
import { useDraggable } from 'vue-draggable-plus'
import {
  resolveComponentProps,
  getEditProps,
  getColumnOptions,
  getPlaceholder,
  formatMoney,
  formatDisplayValue
} from './utils/format'
import { resolveRules, runRule } from './utils/validate'

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
  'change',
  'selection-change',
  'filter-change',
  'row-drag',
  'sort-change'
])

// 表格高度动态计算：撑满剩余视口、表体内部滚动，新增行过多时不会被容器裁掉
// bottomOffset 预留表格下方的“添加一行”按钮区与容器内边距
const { tableHeight, tableRef, calcHeight } = useTableHeight(
  (props.config.showAdd ?? true) ? 64 : 20
)

// 内部数据（用于处理编辑状态）
const tableData = ref([])
// 正在编辑的行 ID 列表
const editingIds = ref([])
// 原始数据备份（用于取消编辑时恢复）
const originalDataMap = new Map()

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
    showToolbar: props.config.showToolbar ?? true, // 是否显示列/样式设置工具栏
    selection: props.config.selection ?? false, // 是否开启行多选列
    dragSort: props.config.dragSort ?? false, // 是否开启行拖拽排序
    showSummary: props.config.showSummary ?? false, // 是否显示汇总行
    sumText: props.config.sumText || '合计', // 汇总行标签
    summaryMethod: props.config.summaryMethod, // 自定义汇总方法（覆盖内置按列求和）
    columnMinWidth: props.config.columnMinWidth || 160
  }
})

// 本地列状态（ColumnSetting 拖拽排序 / 显隐在其上修改后写回）
const localColumns = ref([])

// 操作列为模板内置列，不在宿主 columns 配置中；
// 注入到设置列表以支持显示/隐藏切换（draggable: false —— 渲染位置固定在最右侧，不参与排序）
const ACTION_COLUMN = {
  prop: '__action__',
  label: '操作',
  fixed: 'right',
  draggable: false
}

watch(
  () => props.columns,
  (newVal) => {
    if (!newVal) return
    const cols = [...newVal]
    if (!cols.some((c) => c.label === '操作')) {
      cols.push({ ...ACTION_COLUMN })
    }
    localColumns.value = cols
  },
  { immediate: true }
)

// 操作列显隐：跟随 ColumnSetting 注入项的 show 状态
const showActionColumn = computed(() => {
  const col = localColumns.value.find((c) => c.prop === ACTION_COLUMN.prop)
  return !col || col.show !== false
})

// 表格样式设置（StyleSetting 面板双向绑定），初始值取自 config.table
const tableStyle = reactive({
  stripe: props.config.table?.stripe ?? true,
  border: props.config.table?.border ?? true,
  headerBg: props.config.table?.headerBg ?? true
})

// 表头背景开关 -> CSS 变量（开启用主题浅/深色最佳背景色，关闭则透明）
const headerBgCssVar = computed(() => {
  return {
    '--edit-table-header-bg': tableStyle.headerBg
      ? 'var(--color-bg-input)'
      : 'transparent'
  }
})

// 样式切换会影响列宽计算，重绘一次
watch([() => tableStyle.stripe, () => tableStyle.border], () => {
  nextTick(() => tableRef.value?.doLayout())
})

// 根据 el-table 内部 column 对象回查用户的列配置（取 headerSlot 等自定义字段）
const getColConfig = (tableColumn) => {
  return props.columns.find(
    (col) =>
      (col.prop && col.prop === tableColumn.property) ||
      col.label === tableColumn.label
  )
}
const refresh = () => {}

// 可见列（兼容 ColumnSetting 输出的 show 与历史 hide/hidden 字段）
const visibleColumns = computed(() => {
  return localColumns.value.filter((col) => {
    // 内置操作列在模板中单独渲染，不走列循环
    if (col.prop === ACTION_COLUMN.prop) return false
    if (col.show === false) return false
    if (col.hide === true) return false
    if (col.hidden === true) return false
    return true
  })
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
  if (!key && key !== 0) return

  // 备份原始数据
  originalDataMap.set(key, cloneDeep(row))
  editingIds.value.push(key)
}

// 取消编辑
const handleCancel = (row, fallbackIndex) => {
  // 以真实数组下标为准（filter/sort 下插槽 $index 可能不等于数据下标）
  const index = tableData.value.indexOf(row)
  const safeIndex = index >= 0 ? index : fallbackIndex
  // 取消/回退时丢弃该行的校验错误
  clearRowErrors(row, safeIndex)
  if (row._isNew) {
    // 如果是新行，直接删除（新添加的行，取消时应该移除）
    if (index >= 0) tableData.value.splice(index, 1)
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

// ================= 自实现校验引擎（不依赖 el-form / el-form-item）=================
// 错误映射：key = `${行标识}::${prop}` -> 错误文案
const cellErrors = reactive({})

// 单元格唯一键（新行无 id 时用数组下标兜底）
const cellKey = (row, index, prop) => `${rowIdOf(row, index)}::${prop}`

// 行标识：优先主键；无主键的新行按真实数组下标兜底。
// 注意：filter/sort 场景下插槽传入的 $index 是"可见序号"，可能与 tableData 下标不一致，
// 因此这里用 indexOf 反查真实位置，避免校验键错位。
const rowIdOf = (row, index) => {
  const key = row[mergedConfig.value.rowKey]
  if (key !== undefined && key !== null && key !== '') return String(key)
  const realIndex = tableData.value.indexOf(row)
  return `__idx${realIndex >= 0 ? realIndex : index}`
}

// 校验单个单元格，命中错误则记录并返回是否通过
const validateCell = (row, index, column) => {
  const key = cellKey(row, index, column.prop)
  const rules = resolveRules(column)
  for (const rule of rules) {
    const msg = runRule(rule, row[column.prop])
    if (msg) {
      cellErrors[key] = msg
      return false
    }
  }
  delete cellErrors[key]
  return true
}

// 校验整行（仅可见且可编辑的非 index 列），返回是否全部通过
const validateRow = (row, index) => {
  let ok = true
  visibleColumns.value.forEach((col) => {
    if (!col.prop || col.editable === false || col.type === 'index') return
    if (!validateCell(row, index, col)) ok = false
  })
  return ok
}

// 清除某一行的全部错误
const clearRowErrors = (row, index) => {
  const prefix = `${rowIdOf(row, index)}::`
  Object.keys(cellErrors).forEach((k) => {
    if (k.startsWith(prefix)) delete cellErrors[k]
  })
}

// 读取单元格错误文案
const cellErrorOf = (row, index, prop) => {
  return cellErrors[cellKey(row, index, prop)] || ''
}

// 数据变化时仅重校验当前报错的单元格，错误随修改实时消除/更新
watch(
  tableData,
  () => {
    Object.keys(cellErrors).forEach((key) => {
      const sep = key.indexOf('::')
      const rowId = key.slice(0, sep)
      const prop = key.slice(sep + 2)
      const index = tableData.value.findIndex(
        (row, i) => rowIdOf(row, i) === rowId
      )
      if (index === -1) {
        delete cellErrors[key]
        return
      }
      const column = visibleColumns.value.find((c) => c.prop === prop)
      if (column) validateCell(tableData.value[index], index, column)
    })
  },
  { deep: true }
)

// 单元格值变化：先执行列级回调（可做联动清空/赋值），再向宿主抛 change 事件
// 联动链路：上游列 onChange 修改 row → 下游列的 options/componentProps 函数随依赖自动重算
const handleCellChange = (column, row, fallbackIndex, value) => {
  const realIndex = tableData.value.indexOf(row)
  const index = realIndex >= 0 ? realIndex : fallbackIndex
  if (typeof column.onChange === 'function') {
    column.onChange(value, row, index)
  }
  emit('change', { prop: column.prop, value, row, index, column })
}

// 判断字段是否必填，用于展示必填红星/红三角
// 与校验引擎语义保持一致：列级 required 或 rules 中含 required: true 均视为必填
const isRequired = (prop) => {
  const column = props.columns.find((col) => col.prop === prop)
  if (!column) return false
  if (column.required) return true
  return Array.isArray(column.rules) && column.rules.some((r) => r.required)
}

// 保存
const handleSave = async (row, fallbackIndex) => {
  // 以真实数组下标为准（filter/sort 下插槽 $index 可能不等于数据下标）
  const realIndex = tableData.value.indexOf(row)
  const index = realIndex >= 0 ? realIndex : fallbackIndex
  // 自实现校验：仅校验当前可见可编辑列，隐藏列不参与
  if (!validateRow(row, index)) {
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
const handleDelete = (row, fallbackIndex) => {
  const index = tableData.value.indexOf(row)
  if (index < 0) return
  clearRowErrors(row, index)
  tableData.value.splice(index, 1)
  emit('delete', row, index)
  emit('update:data', tableData.value)
  // 删除后剩余行可能仍处于筛选视图，交给宿主数据回流后重算
  nextTick(() => tableRef.value?.doLayout?.())
}

// 添加行
const handleAdd = () => {
  const newRow = { _isNew: true }
  // 初始化列数据
  props.columns.forEach((col) => {
    if (col.prop) {
      // 根据 type 设置默认值
      if (col.type === 'number' || col.type === 'money') {
        newRow[col.prop] = undefined // 数字/金额类型初始化为 undefined
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

// 默认汇总方法：summary: true 的列按数值求和，金额列自动格式化；
// 在 el-table 页脚 render 中被调用，编辑单元格的输入会实时刷新合计值
const handleSummary = ({ columns }) => {
  const sumText = mergedConfig.value.sumText
  const resolveConf = (col) =>
    props.columns.find((c) => c.prop && c.prop === col.property)
  // “合计”标签优先放序号列，否则第一个非汇总数据列
  const labelColumn =
    columns.find((c) => c.type === 'index') ||
    columns.find(
      (c) => c.type !== 'selection' && resolveConf(c)?.summary !== true
    )

  return columns.map((col) => {
    if (col === labelColumn) return sumText
    if (col.type === 'selection' || col.type === 'index') return ''
    const conf = resolveConf(col)
    if (!conf || conf.summary !== true) return ''
    // EP 页脚的 data 为原始数据，此处按当前列筛选复算可见行后再求和
    const active = currentFilters.value[conf.prop]
    let rows = tableData.value
    if (active && active.length) {
      rows = rows.filter((row) =>
        typeof conf.filterMethod === 'function'
          ? active.some((v) => conf.filterMethod(v, row))
          : active.includes(row[conf.prop])
      )
    }
    const total = rows.reduce((sum, row) => {
      const n = Number(row[conf.prop])
      return sum + (Number.isNaN(n) ? 0 : n)
    }, 0)
    return conf.type === 'money'
      ? formatMoney(total, resolveComponentProps(conf))
      : total
  })
}

// 排序变化
const handleSortChange = (data) => {
  emit('sort-change', data)
}

// 当前列筛选状态（column-key -> 选中值数组）：EP 页脚拿到的 data 是未过滤原数据，
// 汇总行需要按此状态自行复算可见行；在 handleSummary 中被读取从而参与页脚 render 的依赖收集
const currentFilters = ref({})

// 列筛选变化：记录筛选态并透传 EP 的 { [column-key]: [选中值...] }（column-key 即列 prop）
const handleFilterChange = (filters) => {
  const next = { ...currentFilters.value }
  Object.entries(filters).forEach(([key, vals]) => {
    if (vals && vals.length) next[key] = vals
    else delete next[key]
  })
  currentFilters.value = next
  emit('filter-change', filters)
}

// ================= 行多选与拖拽排序 =================
const handleSelectionChange = (rows) => {
  emit('selection-change', rows)
}

// 当前选中行（供宿主页面读取）
const getSelectionRows = () => tableRef.value?.getSelectionRows?.() || []

const clearSelection = () => {
  tableRef.value?.clearSelection?.()
}

// 批量删除选中行：清理错误/编辑态并逐行抛 delete 事件，最后同步外部数据
const deleteSelection = () => {
  const selected = getSelectionRows()
  if (!selected.length) return
  const keyField = mergedConfig.value.rowKey
  const keys = new Set(selected.map((r) => r[keyField]))
  for (let i = tableData.value.length - 1; i >= 0; i--) {
    const row = tableData.value[i]
    if (!keys.has(row[keyField])) continue
    tableData.value.splice(i, 1)
    clearRowErrors(row, i)
    const editIdx = editingIds.value.indexOf(row[keyField])
    if (editIdx > -1) editingIds.value.splice(editIdx, 1)
    originalDataMap.delete(row[keyField])
    emit('delete', row, i)
  }
  clearSelection()
  emit('update:data', tableData.value)
}

// ---- 拖拽排序：vue-draggable-plus 绑定 el-table tbody，整行按住即拖 ----
// 输入控件/按钮等交互区域已加入 filter，不参与拖拽起手的判定；
// 库在 onUpdate 时已将 sortable 搬动的 DOM 归位并同步重排绑定的 tableData，
// 行序最终由 Vue 依据数据（row-key）重渲染，onEnd 只需向宿主同步事件。
//
// 说明：el-table 列数多（每列 min-width 160）且存在横向滚动条，<tr> 的实际
// 渲染宽度 = 整张表格的内容总宽（远大于可视区）。默认走原生 HTML5 拖拽时，
// 浏览器会把整个 <tr> 渲染成拖拽位图（无法用 CSS 控制），在固定列/左半部分
// 拖拽时位图看上去“正常”，拖到右半部分时位图会铺满整张表宽 → “巨长”。
// 这里用 setDragImage 把原生位图替换为一个不可见的 1×1 元素，让落点反馈
// 交给 tbody 内的 sortable-ghost 占位行；该占位 <tr> 在横向滚动容器内
// 会被容器 overflow 裁剪到可视区宽度，看起来就是一张普通行。
let dragImageEl = null
const getHiddenDragImage = () => {
  if (dragImageEl && dragImageEl.isConnected) return dragImageEl
  const el = document.createElement('div')
  Object.assign(el.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none'
  })
  document.body.appendChild(el)
  dragImageEl = el
  return el
}

const initRowDrag = () => {
  const tbody = tableRef.value?.$el?.querySelector(
    '.el-table__body-wrapper tbody'
  )
  if (!tbody) return
  // useDraggable 在组件作用域销毁时自动清理，无需手动 destroy
  useDraggable(tbody, tableData, {
    animation: 150,
    // 整行任意位置可按住拖动；输入控件/按钮/勾选等交互区域排除，
    // preventOnFilter: false 保证这些元素自身的点击、聚焦不受影响
    filter:
      'input, textarea, button, .el-button, .el-checkbox, .el-radio, .el-switch, .el-select, .el-date-editor, .el-input-number, .el-input__clear',
    preventOnFilter: false,
    // 覆盖 el-table 横向滚动时整行被拍成“巨长”原生位图：把位图换成一个不可见 1×1 元素，
    // 视觉反馈完全交给 tbody 内被裁剪到可视区宽度的 sortable-ghost 占位行。
    setData: (dataTransfer) => {
      try {
        dataTransfer.setDragImage(getHiddenDragImage(), 0, 0)
      } catch {
        /* 极少数环境下 setDragImage 可能抛错，忽略即可 */
      }
    },
    onEnd: ({ oldIndex, newIndex }) => {
      if (oldIndex === newIndex) return
      emit('row-drag', { from: oldIndex, to: newIndex })
      emit('update:data', tableData.value)
    }
  })
}

onMounted(() => {
  if (mergedConfig.value.dragSort) {
    nextTick(initRowDrag)
  }
})

defineExpose({
  tableRef,
  // 供外部主动触发整行校验 / 读取错误状态
  validateRow,
  cellErrors,
  // 页面布局变化（如搜索栏展开收起）后可主动触发高度重算
  calcHeight,
  // 多选：读取选中 / 清空勾选 / 批量删除选中行
  getSelectionRows,
  clearSelection,
  deleteSelection,
  // 程序化添加一行：与“添加一行”按钮同一逻辑（内部初始化新行并抛 add 事件，数据补全由宿主负责）
  handleAdd
})

// 响应式数据
const loading = ref(false)
const tableSize = ref(props.config?.table?.size || 'small')
</script>

<style scoped lang="scss">
.edit-table {
  display: flex;

  // 在 flex 列布局中填充剩余空间，而非撑满 height:100%（否则会与兄弟节点一起溢出被裁）
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  padding: 12px;
  overflow: hidden;
  background: var(--glass-surface);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--color-border-light);

  .toolbar-left {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .toolbar-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

// 表头背景：支持 StyleSetting 通过 CSS 变量覆盖
:deep(.el-table .el-table__header-wrapper .el-table__cell) {
  background: var(
    --edit-table-header-bg,
    var(--el-table-header-bg-color, var(--color-bg-content))
  );
}

// 筛选图标：覆盖 EP 默认的 --el-color-info 着色
:deep(.el-table__column-filter-trigger i) {
  color: var(--color-text-secondary);
}

// 触发器默认是 inline-block 按钮，基线对齐会让漏斗偏下；
// 改为 inline-flex 内容居中 + vertical-align: middle 与表头文字光学中线对齐
:deep(.el-table__column-filter-trigger) {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  vertical-align: middle;
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

// 编辑态/展示态单元格统一固定高度（与 small 尺寸控件一致 24px），
// 保证保存前后行高一致、不跳变；内容超出一律单行省略
.edit-cell,
.view-cell {
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
}

.view-cell > span {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-cell {
  position: relative;

  // 允许下方悬浮的校验错误文案溢出显示（绝对定位，不改变行高）
  overflow: visible;

  &.required::before {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    content: '';
    border-top: 8px solid var(--color-danger);
    border-right: 8px solid transparent;
  }

  // 校验不通过：输入控件描红
  &.is-error {
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper),
    :deep(.el-textarea__inner) {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }

    :deep(.el-range-editor.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset;
    }
  }
}

// 悬浮错误文案：贴在单元格下沿，覆盖到下一行上方，不影响行高
.cell-error {
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  z-index: 20;
  max-width: 100%;
  padding: 0 2px;
  overflow: hidden;
  font-size: 12px;
  line-height: 16px;
  color: var(--el-color-danger);
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--el-bg-color-overlay, var(--glass-surface));
  border-radius: 3px;
  box-shadow: var(--shadow-sm);
}

.edit-control {
  width: 100%;
  height: 100%;
  overflow: hidden;

  :deep(.center-control) {
    display: flex;
    justify-content: center;
  }

  // 单行 textarea：压到与其他控件同高，避免编辑态行高被撑开
  :deep(.el-textarea__inner) {
    height: 24px;
    min-height: 24px !important;
    padding: 2px 6px;
    line-height: 20px;
    resize: none;
  }
}

// 操作列按钮同样锁定 24px，保证三态（编辑/展示）行高一致
.table-action {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
}

// 拖拽模式下整行 cursor 提示可按住拖动（内部控件保持自身光标语义）
.edit-table.is-drag-sort {
  :deep(.el-table__body tr.el-table__row) {
    cursor: move;
    user-select: none;
  }
}

// 拖拽反馈：被拖行半透明，落点行高亮
:deep(.el-table__row.sortable-ghost) {
  opacity: 0.4;

  td.el-table__cell {
    background: var(--el-color-primary-light-9);
  }
}

:deep(.el-table__row.sortable-chosen) {
  background: var(--color-bg-hover);
}
</style>
