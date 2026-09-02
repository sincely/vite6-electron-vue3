<template>
  <TreeTable
    ref="treeTableRef"
    :columns="columns"
    :func="getTreeList"
    :config="{
      table: {
        rowKey: 'id',
        defaultExpandAll: true
      },
      notPagination: false,
      useAction: true
    }"
    @edit="handleEdit"
    @add="handleAdd"
    @delete="handleDelete"
  />
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'

const treeTableRef = ref()

// 状态字典
const statusOptions = [
  { label: '正常', value: '0', color: 'success' },
  { label: '禁用', value: '1', color: 'danger' }
]

// 表格列配置
const columns = [
  { prop: 'id', label: 'ID', width: 80, align: 'center' },
  { prop: 'name', label: '部门/人员', align: 'left', minWidth: 150 },
  { prop: 'leader', label: '负责人', width: 120 },
  { prop: 'email', label: '邮箱', minWidth: 180, showOverflowTooltip: true },
  { prop: 'phone', label: '电话', width: 130 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    align: 'center',
    dict: statusOptions
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 170,
    date: true,
    dateFormat: '{y}-{m}-{d} {h}:{i}'
  }
]

// 模拟获取树形数据
const getTreeList = async () => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    rows: [
      {
        id: 1,
        name: '集团总部',
        leader: '张三',
        email: 'zhangsan@company.com',
        phone: '010-12345678',
        status: '0',
        createTime: '2023-01-15 09:30:00',
        children: [
          {
            id: 11,
            name: '研发部',
            leader: '李四',
            email: 'lisi@company.com',
            phone: '010-87654321',
            status: '0',
            createTime: '2023-02-20 10:15:00'
          },
          {
            id: 12,
            name: '市场部',
            leader: '周八',
            email: 'zhouBA@company.com',
            phone: '010-99999999',
            status: '0',
            createTime: '2023-02-25 11:00:00'
          },
          {
            id: 13,
            name: '财务部',
            leader: '何十一',
            email: 'heshiyi@company.com',
            phone: '010-66666666',
            status: '0',
            createTime: '2023-03-01 08:30:00'
          },
          {
            id: 14,
            name: '人力资源部',
            leader: '何十四',
            email: 'heshisi@company.com',
            phone: '010-13141516',
            status: '0',
            createTime: '2023-03-05 09:00:00'
          }
        ]
      },
      {
        id: 2,
        name: '分公司A',
        leader: '陈十八',
        email: 'chenshiba@company.com',
        phone: '020-12345678',
        status: '0',
        createTime: '2023-04-01 08:00:00',
        children: [
          {
            id: 21,
            name: '分公司A - 销售部',
            leader: '许十九',
            email: 'xushijiu@company.com',
            phone: '020-87654321',
            status: '0',
            createTime: '2023-04-10 09:15:00'
          },
          {
            id: 22,
            name: '分公司A - 服务部',
            leader: '唐二十二',
            email: 'tangershier@company.com',
            phone: '020-99887766',
            status: '0',
            createTime: '2023-04-10 10:00:00'
          }
        ]
      },
      {
        id: 3,
        name: '分公司B',
        leader: '韦二十三',
        email: 'weishisan@company.com',
        phone: '021-12345678',
        status: '0',
        createTime: '2023-04-05 08:30:00',
        children: [
          {
            id: 31,
            name: '分公司B - 运营部',
            leader: '卫二十四',
            email: 'weishisi@company.com',
            phone: '021-11223344',
            status: '0',
            createTime: '2023-04-12 09:00:00'
          }
        ]
      }
    ]
  }
}

// 编辑行
const handleEdit = (row, index) => {
  ElMessage.info(`编辑: ${row.name} (ID: ${row.id})`)
  console.log('编辑行:', row, index)
}

// 新增子节点
const handleAdd = (row, index) => {
  ElMessageBox.prompt(`在 "${row.name}" 下新增子节点`, '新增部门/人员', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /.{1,}/,
    inputErrorMessage: '部门/人员名称不能为空'
  })
    .then(({ value }) => {
      const newId =
        Math.max(
          ...flattenTree(treeTableRef.value.tableData).map((item) => item.id),
          0
        ) + 1
      if (!row.children) {
        row.children = []
      }
      row.children.push({
        id: newId,
        name: value,
        leader: '',
        email: '',
        phone: '',
        status: '0',
        createTime: new Date().toLocaleString()
      })
      ElMessage.success(`成功添加 "${value}"`)
      treeTableRef.value.reload()
    })
    .catch(() => {
      ElMessage.info('已取消添加')
    })
}

// 删除行
const handleDelete = (row, index) => {
  const tableData = treeTableRef.value.tableData

  // 删除当前行
  const deleteItem = (items, id) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        items.splice(i, 1)
        return true
      }
      if (items[i].children && deleteItem(items[i].children, id)) {
        return true
      }
    }
    return false
  }

  if (deleteItem(tableData, row.id)) {
    ElMessage.success(`成功删除 "${row.name}"`)
    treeTableRef.value.reload()
  }
}

// 扁平化树形数据 (用于获取最大ID)
const flattenTree = (items) => {
  let result = []
  items.forEach((item) => {
    result.push(item)
    if (item.children && item.children.length) {
      result = result.concat(flattenTree(item.children))
    }
  })
  return result
}
</script>
