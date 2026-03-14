<template>
  <div class="log-container page-enter">
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
      :rules="rules"
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
import PageHeader from '@/components/PageHeader/index.vue'
import { ElButton } from 'element-plus'
import EditTable from '@/components/EditTable/index.vue'
import { ref } from 'vue'

const searchKeyword = ref('')
const columns = [
  {
    prop: 'name',
    label: '姓名',
    editType: 'input',
    required: true,
    sortable: true,
    headerSlot: 'nameHeader'
  },
  {
    prop: 'role',
    label: '角色',
    editType: 'select',
    required: true,
    // sortable: true,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '用户', value: 'user' }
    ]
  },
  {
    prop: 'age',
    label: '年龄',
    editType: 'number',
    // sortable: 'custom',
    rules: [
      { required: true, message: '请输入年龄', trigger: 'blur' },
      { type: 'number', min: 18, message: '年龄必须大于18岁', trigger: 'blur' }
    ]
  },
  // 日期选择
  {
    prop: 'date',
    label: '时间',
    editType: 'datetime',
    // editWidth: '200px',
    required: true
  },
  // 日期范围
  {
    prop: 'range',
    label: '时间范围',
    editType: 'daterange',
    // editWidth: '240px',
    editProps: {
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format': 'YYYY-MM-DD'
    },
    required: true
  },
  // 多选框
  {
    prop: 'hobbies',
    label: '爱好',
    editType: 'check-box-group',
    editProps: {
      options: [
        { label: '篮球', value: 'basketball' },
        { label: '足球', value: 'football' },
        { label: '跑步', value: 'running' }
      ]
    },
    required: true
  },
  // 单选框
  {
    prop: 'gender',
    label: '性别',
    editType: 'radio-group',
    editProps: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' }
      ]
    },
    required: false
  }
]
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  date: [{ required: true, message: '请选择操作时间', trigger: 'change' }],
  range: [
    {
      required: true,
      message: '请选择时间范围',
      trigger: 'change',
      type: 'array'
    }
  ],
  hobbies: [
    {
      required: true,
      message: '请至少选择一个爱好',
      trigger: 'change',
      type: 'array'
    }
  ],
  gender: [
    {
      required: true,
      message: '请选择性别',
      trigger: 'change'
    }
  ]
}

const tableData = ref([
  {
    id: 1,
    date: '2024-03-15 14:23:45',
    name: 'Admin',
    role: 'admin',
    age: 30,
    address: '登录系统成功 (IP: 192.168.1.10)',
    hobbies: ['basketball', 'football'],
    gender: 'male',
    range: ['2024-03-15', '2024-03-20']
  },
  {
    id: 2,
    date: '2024-03-15 13:12:33',
    name: 'User',
    role: 'user',
    age: 25,
    address: '修改了个人配置文件',
    hobbies: ['running'],
    gender: 'female',
    range: ['2024-03-15', '2024-03-20']
  }
])

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
