<template>
  <div class="search-form-page">
    <PageHeader
      title="搜索表单"
      subtitle="DynamicSearchBar 配置式搜索栏：查询/重置联动表格，超过 3 项自动折叠"
      icon="search"
    />

    <!-- 示例一：基础用法（≤3 项全部展示） -->
    <div class="section-title">基础示例（3 个搜索项）</div>
    <DynamicSearchBar
      :items="basicItems"
      :params="basicParams"
      :table-ref="basicTableRef"
    />
    <AdvanceTable
      ref="basicTableRef"
      :columns="basicColumns"
      :func="getTableList"
      :params="basicParams"
      :config="tableConfig"
    />

    <!-- 示例二：完整用法（>3 项自动折叠，展开/收起切换） -->
    <div class="section-title">
      完整示例（6 个搜索项，点击「展开」查看全部）
    </div>
    <DynamicSearchBar
      :items="fullItems"
      :params="fullParams"
      :table-ref="fullTableRef"
    />
    <AdvanceTable
      ref="fullTableRef"
      :columns="basicColumns"
      :func="getTableList"
      :params="fullParams"
      :config="tableConfig"
    />
  </div>
</template>

<script setup>
defineOptions({ name: 'example-search-form' })
import { getTableList } from '@/api/table'

const basicTableRef = ref(null)
const fullTableRef = ref(null)

// 部门/状态选项
const deptOptions = [
  { label: '技术部', value: '技术部' },
  { label: '产品部', value: '产品部' },
  { label: '设计部', value: '设计部' },
  { label: '市场部', value: '市场部' },
  { label: '运营部', value: '运营部' },
  { label: '财务部', value: '财务部' },
  { label: '人事部', value: '人事部' }
]
const statusOptions = [
  { label: '在职', value: 'active' },
  { label: '休假中', value: 'inactive' },
  { label: '已离职', value: 'disabled' }
]

// ─── 示例一：基础搜索项 ─────────────────────────────────────
const basicItems = [
  { prop: 'name', label: '姓名', type: 'input' },
  {
    prop: 'department',
    label: '部门',
    type: 'select',
    component: { options: deptOptions }
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    component: { options: statusOptions }
  }
]
const basicParams = reactive({ name: '', department: '', status: '' })

// ─── 示例二：完整搜索项（超过 3 项自动折叠） ─────────────────
const fullItems = [
  { prop: 'name', label: '姓名', type: 'input' },
  {
    prop: 'department',
    label: '部门',
    type: 'select',
    component: { options: deptOptions }
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    component: { options: statusOptions }
  },
  {
    prop: 'joinStartDate',
    label: '入职时间',
    type: 'date',
    component: { valueFormat: 'YYYY-MM-DD' }
  },
  {
    prop: 'level',
    label: '职级',
    type: 'select',
    component: {
      options: [
        { label: 'P1-P3 初级', value: 'junior' },
        { label: 'P4-P6 中级', value: 'middle' },
        { label: 'P7+ 高级', value: 'senior' }
      ]
    }
  },
  { prop: 'email', label: '邮箱', type: 'input' }
]
const fullParams = reactive({
  name: '',
  department: '',
  status: '',
  joinStartDate: '',
  level: '',
  email: ''
})

// ─── 表格（两个示例共用列配置） ─────────────────────────────
const basicColumns = [
  { type: 'index', label: '序号', width: 70, align: 'center' },
  { prop: 'name', label: '姓名', minWidth: 140 },
  { prop: 'department', label: '部门', width: 120 },
  { prop: 'role', label: '角色', width: 140 },
  { prop: 'statusLabel', label: '状态', width: 100, align: 'center' },
  { prop: 'joinDate', label: '入职日期', width: 170 },
  { prop: 'email', label: '邮箱', minWidth: 200, showOverflowTooltip: true }
]

const tableConfig = {
  table: { rowKey: 'id' },
  pagination: { pageSize: 10 }
}
</script>

<style lang="scss" scoped>
.search-form-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.section-title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);

  &::before {
    display: inline-block;
    width: 3px;
    height: 14px;
    margin-right: 8px;
    vertical-align: -2px;
    content: '';
    background: var(--color-primary);
    border-radius: 2px;
  }
}
</style>
