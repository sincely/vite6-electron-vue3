<template>
  <div class="smart-table">
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      v-bind="mergedConfig.table"
      @sort-change="handleSortChange"
    >
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

        <!-- 普通列 -->
        <el-table-column
          v-else
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :sortable="column.sortable || false"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <!-- 插槽优先 -->
            <slot
              v-if="column.slot"
              :name="column.slot"
              :row="row"
              :column="column"
            />
            <!-- 字典标签 -->
            <DictTag
              v-else-if="column.dict"
              :value="row[column.prop]"
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
      <template #empty>
        <div class="no-data">
          <img src="@/assets/images/empty.png" alt="无数据" />
          <p>暂无数据</p>
        </div>
      </template>
    </el-table>

    <!-- 分页 -->
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
</template>

<script setup>
import { parseTime } from '@/utils/time'

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

// Expose
const tableRef = ref(null)
defineExpose({
  getList,
  resetQuery,
  reload
})

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  ...props.params
})

// 合并配置
const mergedConfig = computed(() => {
  return {
    // 表格配置
    table: {
      border: true,
      stripe: true,
      ...props.config.table
    },
    // 分页配置
    pagination: {
      background: true,
      pageSizes: [10, 20, 50, 100],
      ...props.config.pagination
    },
    sort: props.config.sort ?? false, // 是否启用排序
    notPagination: props.config.notPagination ?? false, // 是否禁用分页
    autoPagination: props.config.autoPagination ?? false, // 是否自动分页
    initResquest: props.config.initResquest ?? true // 是否初始化请求
  }
})

// 可见列（过滤 hide = true 的列）
const visibleColumns = computed(() => {
  return props.columns.filter((col) => !col.hide)
})

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

<style scoped>
.smart-table {
  width: 100%;
}

.no-data {
  padding: 40px 0;
  text-align: center;
}

.no-data img {
  width: 120px;
  opacity: 0.6;
}
</style>
