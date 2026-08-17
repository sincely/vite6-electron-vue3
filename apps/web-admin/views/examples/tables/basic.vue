<template>
  <div class="basic-table-page">
    <PageHeader
      title="基础表格"
      subtitle="AdvanceTable 最小配置：列定义、数据接口与分页，开箱即用"
      icon="template"
    />

    <AdvanceTable :columns="columns" :func="getTableList" :config="config">
      <template #statusCell="{ row }">
        <el-tag :type="statusTagType(row.status)" size="small" effect="light">
          {{ row.statusLabel }}
        </el-tag>
      </template>
    </AdvanceTable>
  </div>
</template>

<script setup>
defineOptions({ name: 'example-table-basic' })
import { getTableList } from '@/api/table'

// 列配置：prop 对应接口字段，slot 可自定义单元格渲染
const columns = [
  { type: 'index', label: '序号', width: 70, align: 'center' },
  { prop: 'name', label: '姓名', minWidth: 140, sortable: true },
  { prop: 'department', label: '部门', width: 120 },
  { prop: 'role', label: '角色', width: 140 },
  { prop: 'email', label: '邮箱', minWidth: 200, showOverflowTooltip: true },
  { prop: 'phone', label: '手机号', width: 140 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    align: 'center',
    slot: 'statusCell'
  },
  { prop: 'joinDate', label: '入职日期', width: 170, sortable: true }
]

// 表格配置：rowKey 必传，其余保持默认（斑马纹、边框、分页）
const config = {
  table: { rowKey: 'id' },
  pagination: { pageSize: 10 }
}

const statusTagType = (status) => {
  const map = { active: 'success', inactive: 'warning', disabled: 'info' }
  return map[status] || 'info'
}
</script>

<style lang="scss" scoped>
.basic-table-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}
</style>
