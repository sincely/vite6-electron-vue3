<template>
  <TreeTable
    :columns="columns"
    :func="getTreeList"
    :config="{
      table: {
        rowKey: 'id', // 唯一键
        defaultExpandAll: true // 默认展开所有
      },
      notPagination: true // 树形数据通常不需要分页
    }"
  />
</template>

<script setup>
import TreeTable from '@/components/TreeTable/index.vue'

const columns = [
  { prop: 'name', label: '部门名称', align: 'left' }, // 树形列建议左对齐
  { prop: 'leader', label: '负责人' }
]

const getTreeList = async () => {
  // 返回带 children 的树形结构
  return {
    rows: [
      {
        id: 1,
        name: '总部',
        children: [
          { id: 11, name: '研发部' },
          { id: 12, name: '市场部' }
        ]
      }
    ]
  }
}
</script>
