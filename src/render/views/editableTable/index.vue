0.
<template>
  <div class="log-container">
    <PageHeader
      title="系统日志"
      subtitle="查看系统操作记录和运行状态"
      icon="cpu"
    >
      <template #actions>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索日志..."
          class="search-input"
          :prefix-icon="Search"
          clearable
        />
        <el-button type="primary">
          <SvgIcon icon-class="download" width="16px" height="16px" />
          <span>导出日志</span>
        </el-button>
      </template>
    </PageHeader>

    <EditTable
      v-model:data="tableData"
      :columns="columns"
      @save="handleSave"
      @delete="handleDelete"
      @add="handleAdd"
      @sort-change="handleSortChange"
    >
      <template #nameHeader="{ column }">
        <span style="color: red">*</span>
        {{ column.label }} (自定义)
      </template>
    </EditTable>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ElButton } from 'element-plus'

const searchKeyword = ref('')
const columns = [
  {
    type: 'index',
    prop: 'index',
    label: '序号',
    fixed: 'left',
    align: 'center'
  },
  {
    prop: 'name',
    label: '姓名',
    type: 'input',
    required: true,
    sortable: true,

    fixed: 'left',
    headerSlot: 'nameHeader',
    rules: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ]
  },
  {
    prop: 'bio',
    label: '简介',
    type: 'textarea',
    required: true,
    componentProps: {
      rows: 1,
      maxlength: 120
      // 'show-word-limit': true
    },
    rules: [{ required: true, message: '请输入简介', trigger: 'blur' }]
  },
  {
    prop: 'role',
    label: '角色',
    type: 'select',
    required: true,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '用户', value: 'user' }
    ],
    rules: [{ required: true, message: '请选择角色', trigger: 'change' }]
  },
  {
    prop: 'enabled',
    label: '启用',
    type: 'switch',
    required: false,

    componentProps: {
      'active-text': '开',
      'inactive-text': '关'
    },
    rules: [{ required: true, message: '请选择启用状态', trigger: 'change' }]
  },
  {
    prop: 'tags',
    label: '标签',
    type: 'checkbox-group',
    width: 300,
    required: false,
    options: [
      { label: '高优先级', value: 'high' },
      { label: '自动化', value: 'auto' },
      { label: '已归档', value: 'archived' }
    ],
    rules: [
      {
        required: true,
        message: '请选择标签',
        trigger: 'change',
        type: 'array'
      }
    ]
  },
  {
    prop: 'gender',
    label: '性别',
    type: 'radio-group',
    required: false,
    width: 280,

    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
      { label: '保密', value: 'secret' }
    ],
    rules: [{ required: true, message: '请选择性别', trigger: 'change' }]
  },
  {
    prop: 'age',
    label: '年龄',
    width: 200,
    type: 'number',
    required: false,
    sortable: 'custom',
    rules: [
      { required: true, message: '请输入年龄', trigger: 'blur' },
      { type: 'number', min: 18, message: '年龄必须大于18岁', trigger: 'blur' }
    ]
  },
  {
    prop: 'date',
    label: '日期',
    type: 'date',

    required: false,
    componentProps: {
      'value-format': 'YYYY-MM-DD'
    },
    rules: [{ required: true, message: '请选择日期', trigger: 'change' }]
  },
  {
    prop: 'datetime',
    label: '日期时间',
    type: 'datetime',
    required: true,
    componentProps: {
      'value-format': 'YYYY-MM-DD HH:mm:ss'
    },
    rules: [{ required: true, message: '请选择日期时间', trigger: 'change' }]
  },
  {
    prop: 'dateRange',
    label: '日期范围',
    type: 'daterange',
    required: true,
    width: 300,
    componentProps: {
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format': 'YYYY-MM-DD'
    },
    rules: [
      {
        required: true,
        message: '请选择日期范围',
        trigger: 'change',
        type: 'array'
      }
    ]
  },
  {
    prop: 'datetimeRange',
    label: '日期时间范围',
    width: 300,
    type: 'datetimerange',
    required: true,
    componentProps: {
      'start-placeholder': '开始日期时间',
      'end-placeholder': '结束日期时间',
      'value-format': 'YYYY-MM-DD HH:mm:ss'
    },
    rules: [
      {
        required: true,
        message: '请选择日期时间范围',
        trigger: 'change',
        type: 'array'
      }
    ]
  },
  {
    prop: 'month',
    label: '月份',
    type: 'month',
    required: true,
    componentProps: {
      'value-format': 'YYYY-MM'
    },
    rules: [{ required: true, message: '请选择月份', trigger: 'change' }]
  },
  {
    prop: 'year',
    label: '年份',
    type: 'year',
    required: true,
    componentProps: {
      'value-format': 'YYYY'
    },
    rules: [{ required: true, message: '请选择年份', trigger: 'change' }]
  }
]

const tableData = ref([])

const handleSave = (row, index) => {
  console.log('保存', row, index)
  // 模拟保存后更新数据
  // tableData.value[index] = { ...row }
}
const handleDelete = (row, index) => {
  console.log('删除', row, index)
  // EditTable 内部已经处理了 splice，这里只需要处理后端请求
}
const handleAdd = (row) => {
  console.log('添加', row)
  // EditTable 内部已经处理了 push，这里只需要处理后端请求
}

const handleSortChange = ({ prop, order }) => {
  console.log('排序', prop, order)
  if (prop === 'age' && order) {
    // 模拟后端排序
    tableData.value.sort((a, b) => {
      if (order === 'ascending') {
        return a.age - b.age
      } else {
        return b.age - a.age
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.log-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.search-input {
  width: 240px;
}
</style>
