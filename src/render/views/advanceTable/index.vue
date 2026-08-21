<template>
  <div class="table-demo">
    <!-- 页面头部 -->
    <PageHeader
      title="用户管理"
      subtitle="管理系统用户账户、角色和权限分配"
      icon="user"
    >
      <template #actions>
        <el-button type="primary" class="action-btn" @click="handleCreate">
          <SvgIcon icon-class="plus" width="16px" height="16px" />
          <span>新增用户</span>
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card" @click="filterByStatus('')">
        <div class="stat-icon stat-icon--total">
          <SvgIcon icon-class="user" width="20px" height="20px" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalUsers }}</span>
          <span class="stat-label">全部用户</span>
        </div>
      </div>
      <div class="stat-card" @click="filterByStatus('active')">
        <div class="stat-icon stat-icon--active">
          <SvgIcon icon-class="check-success" width="20px" height="20px" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.activeUsers }}</span>
          <span class="stat-label">在职员工</span>
        </div>
      </div>
      <div class="stat-card" @click="filterByStatus('inactive')">
        <div class="stat-icon stat-icon--inactive">
          <SvgIcon icon-class="minus" width="20px" height="20px" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.inactiveUsers }}</span>
          <span class="stat-label">休假中</span>
        </div>
      </div>
      <div class="stat-card" @click="filterByStatus('disabled')">
        <div class="stat-icon stat-icon--disabled">
          <SvgIcon icon-class="close" width="20px" height="20px" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.disabledUsers }}</span>
          <span class="stat-label">已离职</span>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <DynamicSearchBar
      :items="searchItems"
      :params="searchParams"
      @query="handleQuery"
      @reset="handleReset"
    />

    <!-- 表格 -->
    <AdvanceTable
      ref="tableRef"
      :columns="columns"
      :func="getTableList"
      :config="config"
      :params="searchParams"
      :events="tableEvents"
      @selection-change="handleSelectionChange"
    >
      <!-- 操作人列：头像 + 姓名 + 邮箱 -->
      <template #userCell="{ row }">
        <div class="user-cell">
          <div class="user-avatar" :style="{ background: row.avatar }">
            {{ row.initial }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ row.name }}</span>
            <span class="user-email">{{ row.email }}</span>
          </div>
        </div>
      </template>

      <!-- 部门列：标签样式 -->
      <template #deptCell="{ row }">
        <span class="dept-tag" :class="`dept-${getDeptClass(row.department)}`">
          {{ row.department }}
        </span>
      </template>

      <!-- 角色列 -->
      <template #roleCell="{ row }">
        <span class="role-badge">{{ row.role }}</span>
      </template>

      <!-- 状态列：圆点 + 文本 -->
      <template #statusCell="{ row }">
        <div class="status-cell">
          <span class="status-dot" :class="`status-${row.status}`"></span>
          <span class="status-text" :class="`status-text-${row.status}`">
            {{ row.statusLabel }}
          </span>
        </div>
      </template>

      <!-- 绩效列：进度条 -->
      <template #perfCell="{ row }">
        <div class="perf-cell">
          <div class="perf-track">
            <div
              class="perf-fill"
              :class="getPerfClass(row.performance)"
              :style="{ width: row.performance + '%' }"
            ></div>
          </div>
          <span class="perf-num">{{ row.performance }}%</span>
        </div>
      </template>

      <!-- 日期列 -->
      <template #dateCell="{ row }">
        <span class="date-cell">{{ row.joinDate }}</span>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <div class="table-action">
          <el-button
            link
            type="info"
            size="small"
            :icon="View"
            title="查看"
            @click="handleDetail(row)"
          />
          <el-button
            link
            type="primary"
            size="small"
            :icon="Edit"
            title="编辑"
            @click="handleEdit(row)"
          />
          <el-button
            link
            type="danger"
            size="small"
            :icon="Delete"
            title="删除"
            @click="handleDelete(row)"
          />
        </div>
      </template>

      <!-- 批量操作 -->
      <template #toolbar-left>
        <el-button
          v-if="selectedRows.length > 0"
          type="danger"
          size="small"
          plain
        >
          批量删除 ({{ selectedRows.length }})
        </el-button>
      </template>
    </AdvanceTable>
  </div>
</template>

<script setup>
defineOptions({ name: 'advance-table-demo' })
import { View, Edit, Delete } from '@element-plus/icons-vue'
import UserDetail from './components/UserDetail.vue'
import { useDialog } from '@/hooks/useDialog'
import { getTableList } from '@/api/table'

const { open } = useDialog()
const tableRef = ref(null)
const selectedRows = ref([])

// 统计数据
const stats = reactive({
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  disabledUsers: 0
})

// 表格事件：格式化响应数据（提取统计）
const tableEvents = {
  formatData(res) {
    if (res.stats) {
      Object.assign(stats, res.stats)
    }
    return res
  }
}

// 列配置
const columns = [
  {
    prop: 'name',
    label: '用户',
    minWidth: 220,
    slot: 'userCell',
    sortable: true,
    fixed: 'left'
  },
  {
    prop: 'department',
    label: '部门',
    width: 120,
    slot: 'deptCell',
    filters: [
      { text: '技术部', value: '技术部' },
      { text: '产品部', value: '产品部' },
      { text: '设计部', value: '设计部' },
      { text: '市场部', value: '市场部' },
      { text: '运营部', value: '运营部' },
      { text: '财务部', value: '财务部' },
      { text: '人事部', value: '人事部' }
    ],
    filterMethod: (value, row) => row.department === value
  },
  {
    prop: 'role',
    label: '角色',
    width: 130,
    slot: 'roleCell'
  },
  {
    prop: 'status',
    label: '状态',
    width: 110,
    slot: 'statusCell',
    filters: [
      { text: '在职', value: 'active' },
      { text: '休假中', value: 'inactive' },
      { text: '已离职', value: 'disabled' }
    ],
    filterMethod: (value, row) => row.status === value
  },
  {
    prop: 'performance',
    label: '绩效',
    width: 150,
    slot: 'perfCell',
    sortable: true
  },
  {
    prop: 'projects',
    label: '项目数',
    width: 90,
    align: 'center',
    sortable: true
  },
  {
    prop: 'joinDate',
    label: '入职日期',
    width: 170,
    slot: 'dateCell',
    sortable: true
  },
  {
    prop: 'phone',
    label: '手机号码',
    width: 140,
    showOverflowTooltip: true
  },
  {
    label: '操作',
    width: 120,
    slot: 'action',
    align: 'center',
    fixed: 'right'
  }
]

// 表格配置
const config = {
  table: {
    highlightCurrentRow: true,
    reserveSelection: true,
    rowKey: 'id',
    tableLayout: 'fixed'
  },
  pagination: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100]
  },
  selection: true,
  sort: true
}

// 搜索项
const searchItems = [
  { prop: 'name', label: '用户名', type: 'input' },
  {
    prop: 'department',
    label: '部门',
    type: 'select',
    component: {
      placeholder: '选择部门',
      options: [
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '设计部', value: '设计部' },
        { label: '市场部', value: '市场部' },
        { label: '运营部', value: '运营部' },
        { label: '财务部', value: '财务部' },
        { label: '人事部', value: '人事部' }
      ]
    }
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    component: {
      placeholder: '选择状态',
      options: [
        { label: '在职', value: 'active' },
        { label: '休假中', value: 'inactive' },
        { label: '已离职', value: 'disabled' }
      ]
    }
  }
]

const searchParams = reactive({
  name: '',
  department: '',
  status: ''
})

// 工具函数
function getDeptClass(dept) {
  const map = {
    技术部: 'tech',
    产品部: 'product',
    设计部: 'design',
    市场部: 'market',
    运营部: 'ops',
    财务部: 'finance',
    人事部: 'hr'
  }
  return map[dept] || 'default'
}

function getPerfClass(v) {
  if (v >= 90) return 'perf-excellent'
  if (v >= 75) return 'perf-good'
  return 'perf-average'
}

// 事件处理
function handleQuery() {
  tableRef.value?.getList()
}

function handleReset() {
  searchParams.status = ''
  tableRef.value?.resetQuery()
}

function handleSelectionChange(selection) {
  selectedRows.value = selection
}

function filterByStatus(status) {
  searchParams.status = status
  tableRef.value?.getList()
}

function handleCreate() {
  ElMessage.info('新增用户功能待实现')
}

function handleEdit(row) {
  ElMessage.info(`编辑用户: ${row.name}`)
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定要删除用户 "${row.name}" 吗？`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage.success(`已删除用户: ${row.name}`)
    })
    .catch(() => {})
}

function handleDetail(row) {
  open({
    title: '用户详情',
    subtitle: `${row.name} 的详细信息`,
    icon: 'user',
    component: UserDetail,
    componentProps: { row },
    dialogProps: { width: '640px' },
    footer: [
      {
        label: '关闭',
        onClick: ({ close, exposed }) => {
          exposed.onCancel()
          close()
        }
      },
      {
        label: '编辑用户',
        type: 'primary',
        onClick: ({ close, exposed }) => {
          exposed.onOk()
          close()
          handleEdit(row)
        }
      }
    ]
  })
}
</script>

<style lang="scss" scoped>
.table-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

// Stats row
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: var(--glass-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 14px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    border-color: color-mix(in srgb, var(--color-primary), transparent 60%);
    box-shadow: var(--shadow-glow-primary);
    transform: translateY(-3px);
  }
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  .stat-card:hover & {
    transform: scale(1.1) rotate(-5deg);
  }

  &--total {
    color: var(--color-indigo);
    background: color-mix(in srgb, var(--color-indigo), transparent 88%);
  }

  &--active {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success), transparent 88%);
  }

  &--inactive {
    color: var(--color-amber);
    background: color-mix(in srgb, var(--color-amber), transparent 88%);
  }

  &--disabled {
    color: var(--color-rose);
    background: color-mix(in srgb, var(--color-rose), transparent 88%);
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

// Action button
.action-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

// User cell
.user-cell {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-avatar {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 34px;
  height: 34px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-email {
  overflow: hidden;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--color-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Department tag
.dept-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &.dept-tech {
    color: var(--color-indigo);
    background: color-mix(in srgb, var(--color-indigo), transparent 90%);
  }

  &.dept-product {
    color: var(--color-violet);
    background: color-mix(in srgb, var(--color-violet), transparent 90%);
  }

  &.dept-design {
    color: var(--color-pink);
    background: color-mix(in srgb, var(--color-pink), transparent 90%);
  }

  &.dept-market {
    color: var(--color-amber);
    background: color-mix(in srgb, var(--color-amber), transparent 90%);
  }

  &.dept-ops {
    color: var(--color-cyan);
    background: color-mix(in srgb, var(--color-cyan), transparent 90%);
  }

  &.dept-finance {
    color: var(--color-success);
    background: color-mix(in srgb, var(--color-success), transparent 90%);
  }

  &.dept-hr {
    color: var(--color-rose);
    background: color-mix(in srgb, var(--color-rose), transparent 90%);
  }
}

// Role badge
.role-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  border-radius: 6px;
}

// Status cell
.status-cell {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.status-active {
    background: var(--color-success);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-success), transparent 80%);
    animation: pulse-ring 2.5s ease-in-out infinite;
  }

  &.status-inactive {
    background: var(--color-amber);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-amber), transparent 80%);
  }

  &.status-disabled {
    background: var(--color-rose);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-rose), transparent 85%);
  }
}

.status-text {
  font-size: 13px;
  font-weight: 500;

  &-active {
    color: var(--color-success);
  }

  &-inactive {
    color: var(--color-amber);
  }

  &-disabled {
    color: var(--color-rose);
  }
}

// Performance cell
.perf-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.perf-track {
  flex: 1;
  height: 6px;
  background: var(--color-bg-input);
  border-radius: 3px;
}

.perf-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;

  &.perf-excellent {
    background: linear-gradient(90deg, var(--color-success), var(--color-teal));
  }

  &.perf-good {
    background: linear-gradient(
      90deg,
      var(--color-primary),
      var(--color-indigo)
    );
  }

  &.perf-average {
    background: linear-gradient(90deg, var(--color-amber), var(--color-rose));
  }
}

.perf-num {
  flex-shrink: 0;
  width: 36px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: right;
}

// Date cell
.date-cell {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
