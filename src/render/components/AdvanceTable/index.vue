<template>
  <div class="smart-table">
    <!-- 表格工具栏 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <Icon
          icon="ri:refresh-line"
          class="toolbar-icon"
          :class="{ 'is-spinning': loading }"
          width="18"
          height="18"
          @click="refresh"
        />
        <!-- 设置表格大小（点击箭头下拉） -->
        <el-dropdown
          trigger="click"
          placement="bottom-end"
          @command="handleTableSizeCommand"
        >
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

        <!-- 全屏切换 -->
        <Icon
          :icon="
            isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'
          "
          class="toolbar-icon"
          width="18"
          height="18"
          :title="isFullscreen ? '退出全屏' : '全屏'"
          @click="toggleFullscreen"
        />

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
      v-loading="loading"
      :data="tableData"
      v-bind="mergedConfig.table"
      :stripe="tableStyle.stripe"
      :border="tableStyle.border"
      :size="tableSize"
      :style="headerBgCssVar"
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
            <!-- 插槽优先（仅在父组件真实提供该插槽时渲染） -->
            <slot
              v-if="column.slot && $slots[column.slot]"
              :name="column.slot"
              :row="row"
              :column="column"
              :index="$index"
            />
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
import ColumnSetting from './components/ColumnSetting.vue'
import StyleSetting from './components/StyleSetting.vue'
import { useTableHeight } from '@/hooks/useTableHeight'
import { promiseTimeout } from '@vueuse/core'
import { Icon } from '@iconify/vue'
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
const emit = defineEmits(['selection-change'])

// Expose
const { tableHeight, tableRef, calcHeight } = useTableHeight() // 动态计算表格高度，底部留白 80px
const router = useRouter()

defineExpose({
  getList,
  resetQuery,
  reload,
  calcHeight
})

// 响应式数据
const loading = ref(false)
const tableSize = ref(props.config?.table?.size || 'small')
// 表格样式设置（在列设置面板中调整）
const tableStyle = reactive({
  stripe: props.config?.table?.stripe ?? true,
  border: props.config?.table?.border ?? true,
  headerBg: props.config?.table?.headerBg ?? ''
})
// 自定义表头背景 -> CSS 变量（为空时使用主题默认背景）
const headerBgCssVar = computed(() => {
  return tableStyle.headerBg
    ? { '--smart-table-header-bg': tableStyle.headerBg }
    : {}
})
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

watch(
  [tableSize, () => tableStyle.stripe, () => tableStyle.border],
  () => {
    nextTick(() => {
      tableRef.value?.doLayout()
    })
  },
  { immediate: true }
)

function handleTableSizeCommand(val) {
  tableSize.value = val
}

// 内容全屏由布局层统一管理（隐藏侧边栏/头部/标签栏，ESC 退出也在布局层处理），此处直接注入使用
const toggleFullscreen = inject('toggleFullscreen', () => {})
const isFullscreen = inject('isFullscreen', ref(false))

// 合并配置
const mergedConfig = computed(() => {
  return {
    // 表格配置
    table: {
      border: true,
      stripe: true,
      rowKey: 'id', // 默认 rowKey，支持跨页勾选
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
    initResquest: props.config.initResquest ?? true // 是否初始化请求
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
  return column.formatter(row, col, row[column.prop], index)
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
    const requestDelay = Math.max(
      Number(props.config?.requestDelay ?? 1000) || 0,
      0
    )
    const [res] = await Promise.all([
      props.func(finalParams),
      promiseTimeout(requestDelay)
    ])

    console.log('表格数据', res)

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
</script>

<style scoped lang="scss">
.smart-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px 20px;
  overflow-y: hidden;
  background: var(--glass-surface);
  border: 1px solid var(--glass-surface-border);
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  animation: fade-up 0.4s cubic-bezier(0.2, 0.75, 0.2, 1) both;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 16px;
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

    .table-size-trigger {
      display: inline-flex;
      align-items: center;
    }

    .toolbar-icon {
      width: 18px;
      height: 18px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover {
        color: var(--color-primary);
        transform: scale(1.15);
      }

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
  padding: 48px 0;
  text-align: center;
}

.no-data img {
  width: 120px;
  opacity: 0.6;
  animation: float-bounce 3s ease-in-out infinite;
}

.no-data p {
  margin-top: 12px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0 4px;
  margin-top: auto;
}

// ---------- Element Plus 表格深度美化 ----------
:deep(.el-table) {
  --el-table-border-color: var(--color-border-light);
  --el-table-header-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: var(--color-bg-hover);
  --el-table-current-row-bg-color: var(--color-bg-active);
  --el-table-header-text-color: var(--color-text-secondary);
  --el-table-text-color: var(--color-text-primary);
  --el-fill-color-lighter: var(--color-bg-hover);

  overflow: hidden;
  border-radius: 10px;

  // 表头：微弱底色 + 更重字重，营造层次（可通过列设置自定义背景色）
  .el-table__header-wrapper {
    .el-table__cell {
      padding: 10px 0;
      font-size: 13px;
      font-weight: 600;
      background: var(--smart-table-header-bg, var(--color-bg-content));
    }

    th.el-table__cell {
      border-bottom: 1px solid var(--color-border);
    }
  }

  // 斑马纹行使用极浅底色
  .el-table__body tr.el-table__row--striped td.el-table__cell {
    background: var(--color-bg-content);
  }

  // 行 hover 柔和过渡
  .el-table__body tr {
    transition: background-color 0.2s ease;

    &:hover > td.el-table__cell {
      background: var(--color-bg-hover) !important;
    }
  }

  // 单元格统一内边距与字号
  .el-table__cell {
    padding: 10px 0;
    font-size: 13px;
  }

  // 底部边框收敛
  .el-table__inner-wrapper::before,
  .el-table__border-left-patch {
    background-color: var(--color-border-light);
  }

  // 固定列阴影更柔和
  .el-table-fixed-column--right::after,
  .el-table-fixed-column--left::after {
    box-shadow: -4px 0 8px -4px rgb(0 0 0 / 8%);
  }
}

// 工具栏按钮统一美化
:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
}
</style>
