<template>
  <div class="smart-table">
    <!-- 表格工具栏 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <slot name="toolbar" />
        <RefreshRight
          class="toolbar-icon"
          :class="{ 'is-spinning': loading }"
          @click="refresh"
        />
        <ColumnSetting v-model:columns="localColumns" />
      </div>
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      v-bind="mergedConfig.table"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <!-- 多选列 (根据 config.selection 开启) -->
      <el-table-column
        v-if="mergedConfig.selection"
        type="selection"
        width="55"
        :reserve-selection="true"
      />

      <template
        v-for="column in visibleColumns"
        :key="column.prop || column.label"
      >
        <!-- selection / index 列 -->
        <el-table-column
          v-if="column.type === 'selection'"
          type="selection"
          fixed
          :width="column.width || 55"
        />
        <el-table-column
          v-else-if="column.type === 'index'"
          type="index"
          :align="column.align || 'left'"
          :label="column.label"
          :width="column.width || 60"
        />

        <!-- 普通列 -->
        <el-table-column
          v-else
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth || 100"
          :align="column.align || 'left'"
          :fixed="column.fixed"
          :sortable="column.sortable || false"
          :formatter="column.formatter"
          :show-overflow-tooltip="column.showOverflowTooltip || false"
          :filters="column.filters"
          :filter-method="column.filterMethod"
          :tooltip-formatter="column.tooltipFormatter"
        >
          <template #default="{ row, column: col, $index }">
            <!-- 插槽优先 -->
            <slot
              v-if="column.slot && $slots[column.slot]"
              :name="column.slot"
              :row="row"
              :column="column"
              :index="$index"
            />
            <!-- 字典标签 -->
            <DictTag
              v-else-if="column.dict"
              :value="getSafeValue(row, column.prop)"
              :options="column.dict"
            />
            <!-- 时间格式化 -->
            <span v-else-if="column.date">
              {{ formatDate(row[column.prop], column.dateFormat) }}
            </span>
            <!-- 链接 -->
            <el-link
              v-else-if="column.link"
              type="primary"
              @click="handleLinkClick(column, row)"
            >
              {{ row[column.prop] }}
            </el-link>
            <!-- formatter 格式化 -->
            <span v-else-if="column.formatter">
              {{ formatCellValue(column, row, col, $index) }}
            </span>
            <!-- 默认文本 -->
            <span v-else>{{ row[column.prop] }}</span>
          </template>

          <!-- 表头提示 -->
          <template #header>
            <slot
              v-if="column.headerSlot"
              :name="column.headerSlot"
              :column="column"
            />
            <span v-else>{{ column.label }}</span>
            <el-tooltip
              v-if="column.tip"
              :content="column.tip.content"
              placement="top"
            >
              <i
                class="el-icon-question"
                style="margin-left: 4px; color: #999"
              ></i>
            </el-tooltip>
          </template>
        </el-table-column>
      </template>

      <!-- 操作列 -->
      <el-table-column
        v-if="mergedConfig.useAction"
        label="操作"
        width="200"
        align="center"
        fixed="right"
      >
        <template #default="{ row, $index }">
          <slot
            v-if="$slots['action']"
            name="action"
            :row="row"
            :index="$index"
          />
          <div v-else class="action-group">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(row, $index)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="success"
              size="small"
              @click="handleAdd(row, $index)"
            >
              新增
            </el-button>
            <el-popconfirm
              title="确认删除？"
              confirm-button-text="确认"
              cancel-button-text="取消"
              @confirm="handleDelete(row, $index)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template v-if="tableData.length === 0" #empty>
        <div class="no-data">
          <img src="@/assets/images/empty.png" alt="无数据" />
          <p>暂无数据</p>
        </div>
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-if="!mergedConfig.notPagination && total > 0"
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        v-bind="mergedConfig.pagination"
        @size-change="handleSizeChange"
        @current-change="getList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { parseTime } from '@/utils/time'
import ColumnSetting from '@/components/AdvanceTable/components/ColumnSetting.vue'
import DictTag from './DictTag.vue'
import { useTableHeight } from '@/hooks/useTableHeight'
import { RefreshRight } from '@element-plus/icons-vue'

const router = useRouter()

// Props
const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  func: {
    type: Function,
    required: true
  },
  params: {
    type: Object,
    default: () => ({})
  },
  config: {
    type: Object,
    default: () => ({})
  },
  events: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'selection-change',
  'row-click',
  'edit',
  'delete',
  'add'
])

// Expose
const { tableHeight, tableRef, calcHeight } = useTableHeight() // 动态计算表格高度，底部留白 80px

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ...props.params
})
const localColumns = ref([])

// 初始化列配置
watch(
  () => props.columns,
  (newVal) => {
    if (newVal) {
      localColumns.value = [...newVal]
    }
  },
  { immediate: true, deep: true }
)

// 合并配置
const mergedConfig = computed(() => {
  return {
    // 表格配置
    table: {
      border: true,
      stripe: false, // 树形表格默认不使用斑马纹，因为层级关系会受影响
      rowKey: 'id', // 树形表格必须指定 rowKey
      defaultExpandAll: false, // 是否默认展开所有行
      treeProps: { children: 'children', hasChildren: 'hasChildren' }, // 树形结构配置
      highlightCurrentRow: false,
      ...props.config.table
    },
    // 分页配置
    pagination: {
      background: true,
      pageSizes: [10, 20, 50, 100],
      ...props.config.pagination
    },
    sort: props.config.sort ?? false, // 是否启用排序
    selection: props.config.selection ?? false, // 是否启用多选
    notPagination: props.config.notPagination ?? false, // 是否禁用分页
    autoPagination: props.config.autoPagination ?? false, // 是否自动分页
    initResquest: props.config.initResquest ?? true, // 是否初始化请求
    useAction: props.config.useAction ?? false // 是否显示操作列
  }
})

// 可见列（支持 show/hide/hidden，同时避免重复渲染 selection 列）
const visibleColumns = computed(() => {
  return localColumns.value.filter((col) => {
    if (mergedConfig.value.selection && col.type === 'selection') {
      return false
    }
    // ColumnSetting 输出 show=false；同时兼容历史 hide/hidden 字段
    if (col.show === false) return false
    if (col.hide === true) return false
    if (col.hidden === true) return false
    return true
  })
})

function formatCellValue(column, row, col, index) {
  if (typeof column.formatter !== 'function') return row[column.prop]
  try {
    return column.formatter(row, col, row[column.prop], index)
  } catch (error) {
    console.error('Formatter error:', error)
    return row[column.prop]
  }
}

function getSafeValue(row, prop) {
  return row?.[prop] ?? ''
}

// 格式化时间
function formatDate(value, format = '{y}-{m}-{d}') {
  if (!value) return ''
  return parseTime(value, format)
}

// 获取数据
async function getList() {
  try {
    loading.value = true

    // 触发 formatParams 事件
    let finalParams = { ...queryParams }
    if (props.events?.formatParams) {
      finalParams = props.events.formatParams(finalParams) || finalParams
    }

    const res = await props.func(finalParams)

    // 触发 formatData 事件
    let finalData = res
    if (props.events?.formatData) {
      finalData = props.events.formatData(res) || res
    }

    // 处理分页数据
    if (mergedConfig.value.autoPagination) {
      // 前端分页
      tableData.value = finalData.rows || []
      total.value = tableData.value.length
    } else {
      // 后端分页
      tableData.value = finalData.rows || []
      total.value = finalData.total || 0
    }
  } catch (error) {
    console.error('表格请求失败:', error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  getList()
}

// 重置查询
function resetQuery() {
  queryParams.pageNum = 1
  getList()
}

// 强制重绘
function reload() {
  tableRef.value?.doLayout()
}

// 排序变更
function handleSortChange({ prop, order }) {
  if (mergedConfig.value.sort) {
    const sort = order
      ? { prop, order: order === 'ascending' ? 'asc' : 'desc' }
      : null
    if (props.events?.onSortChange) {
      props.events.onSortChange(queryParams, sort)
    }
    getList()
  }
}

// 多选变更
function handleSelectionChange(selection) {
  emit('selection-change', selection)
}

// 分页大小变更
function handleSizeChange(val) {
  queryParams.pageSize = val
  getList()
}

// 链接点击
function handleLinkClick(column, row) {
  if (props.events?.onLinkClick) {
    props.events.onLinkClick(column, row)
  } else if (column.link?.name) {
    // 路由跳转
    router.push({
      name: column.link.name,
      params:
        typeof column.link.params === 'function'
          ? column.link.params(row)
          : column.link.params
    })
  }
}

// 行编辑
function handleEdit(row, index) {
  emit('edit', row, index)
}

// 删除行
function handleDelete(row, index) {
  emit('delete', row, index)
}

// 新增子节点
function handleAdd(row, index) {
  emit('add', row, index)
}

// 初始化
onMounted(() => {
  if (mergedConfig.value.initResquest) {
    getList()
  }
})

// 监听外部 params 变更
watch(
  () => props.params,
  (newVal) => {
    Object.assign(queryParams, newVal)
  },
  { deep: true }
)

defineExpose({
  getList,
  resetQuery,
  reload,
  calcHeight,
  tableData,
  tableRef
})
</script>

<style scoped lang="scss">
.smart-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 12px;
  overflow-y: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-surface-border);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .toolbar-left {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .toolbar-right {
    display: flex;
    gap: 12px;
    align-items: center;

    .toolbar-icon {
      display: inline-block;
      width: 18px;
      height: 18px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transform-origin: center;
      transform-box: fill-box;

      &.is-spinning {
        pointer-events: none;
        animation: rotate 0.8s linear infinite;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.no-data {
  padding: 40px 0;
  text-align: center;
}

.no-data img {
  width: 120px;
  opacity: 0.6;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
  margin-top: auto;
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;

  :deep(.el-button) {
    margin: 0;
  }
}
</style>
