<template>
  <div class="tree-table-page">
    <PageHeader
      title="左树右表"
      subtitle="左侧组织架构树筛选，右侧搜索栏 + 表格联动，经典左右布局"
      icon="panel-left-open"
    />

    <div class="layout-body">
      <!-- 左侧：部门树 -->
      <div class="tree-panel glass-card">
        <div class="tree-panel-header">
          <span class="tree-title">组织架构</span>
        </div>
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="{ label: 'label', children: 'children' }"
          node-key="id"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <span class="tree-node">
              <span>{{ data.label }}</span>
              <span v-if="data.count != null" class="tree-node-count">
                {{ data.count }}
              </span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧：搜索 + 表格 -->
      <div class="table-panel">
        <DynamicSearchBar
          :items="searchItems"
          :params="searchParams"
          :table-ref="tableRef"
        />
        <AdvanceTable
          ref="tableRef"
          :columns="columns"
          :func="getTableList"
          :params="searchParams"
          :config="tableConfig"
        >
          <template #deptCell="{ row }">
            <el-tag size="small" effect="plain">{{ row.department }}</el-tag>
          </template>
        </AdvanceTable>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'example-tree-table' })
import { getTableList } from '@/api/table'

const treeRef = ref(null)
const tableRef = ref(null)

// 部门树（department 字段为接口筛选值，空字符串表示全部）
const treeData = [
  { id: 'all', label: '全部部门', department: '' },
  {
    id: 'tech',
    label: '技术中心',
    children: [{ id: 'tech-dept', label: '技术部', department: '技术部' }]
  },
  {
    id: 'product',
    label: '产品中心',
    children: [
      { id: 'product-dept', label: '产品部', department: '产品部' },
      { id: 'design-dept', label: '设计部', department: '设计部' }
    ]
  },
  {
    id: 'ops',
    label: '运营中心',
    children: [
      { id: 'market-dept', label: '市场部', department: '市场部' },
      { id: 'ops-dept', label: '运营部', department: '运营部' }
    ]
  },
  {
    id: 'support',
    label: '职能中心',
    children: [
      { id: 'finance-dept', label: '财务部', department: '财务部' },
      { id: 'hr-dept', label: '人事部', department: '人事部' }
    ]
  }
]

// 点击树节点：分组节点视为全部，叶子节点按部门过滤
const handleNodeClick = (data) => {
  searchParams.department = data.department || ''
  tableRef.value?.getList()
}

const searchItems = [
  { prop: 'name', label: '姓名', type: 'input' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    component: {
      options: [
        { label: '在职', value: 'active' },
        { label: '休假中', value: 'inactive' },
        { label: '已离职', value: 'disabled' }
      ]
    }
  }
]

const searchParams = reactive({ name: '', department: '', status: '' })

const columns = [
  { type: 'index', label: '序号', width: 70, align: 'center' },
  { prop: 'name', label: '姓名', minWidth: 140 },
  { prop: 'department', label: '部门', width: 120, slot: 'deptCell' },
  { prop: 'role', label: '角色', width: 140 },
  { prop: 'statusLabel', label: '状态', width: 100, align: 'center' },
  { prop: 'phone', label: '手机号', width: 140 },
  { prop: 'joinDate', label: '入职日期', width: 170 }
]

const tableConfig = {
  table: { rowKey: 'id' },
  pagination: { pageSize: 10 }
}
</script>

<style lang="scss" scoped>
.tree-table-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.layout-body {
  display: flex;
  flex: 1;
  gap: 16px;
  min-height: 0;
}

.tree-panel {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 220px;
  overflow: auto;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.tree-panel-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.tree-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tree-panel :deep(.el-tree) {
  padding: 8px;
  background: transparent;
}

.tree-node {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.tree-node-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

.table-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
</style>
