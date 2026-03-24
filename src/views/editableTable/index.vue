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
    type: 'index',
    prop: 'index',
    label: '序号',
    fixed: 'left',
    align: 'center'
  },
  {
    prop: 'name',
    label: '姓名',
    editType: 'input',
    required: true,
    sortable: true,
    align: 'center',
    fixed: 'left',
    headerSlot: 'nameHeader'
  },
  {
    prop: 'bio',
    label: '简介',
    editType: 'textarea',
    required: true,
    editProps: {
      rows: 1,
      maxlength: 120,
      'show-word-limit': true
    }
  },
  {
    prop: 'role',
    label: '角色',
    editType: 'select',
    required: true,
    options: [
      { label: '管理员', value: 'admin' },
      { label: '用户', value: 'user' }
    ]
  },
  {
    prop: 'enabled',
    label: '启用',
    editType: 'switch',
    required: false,
    editProps: {
      'active-text': '开',
      'inactive-text': '关'
    }
  },
  {
    prop: 'tags',
    label: '标签',
    editType: 'check-bo-groub',
    width: 300,
    required: true,
    options: [
      { label: '高优先级', value: 'high' },
      { label: '自动化', value: 'auto' },
      { label: '已归档', value: 'archived' }
    ]
  },
  {
    prop: 'gender',
    label: '性别',
    editType: 'radio-group',
    required: true,
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
      { label: '保密', value: 'secret' }
    ]
  },
  {
    prop: 'age',
    label: '年龄',
    editType: 'number',
    sortable: 'custom',
    rules: [
      { required: true, message: '请输入年龄', trigger: 'blur' },
      { type: 'number', min: 18, message: '年龄必须大于18岁', trigger: 'blur' }
    ]
  },
  {
    prop: 'date',
    label: '日期',
    editType: 'date',
    required: true,
    editProps: {
      'value-format': 'YYYY-MM-DD'
    }
  },
  {
    prop: 'datetime',
    label: '日期时间',
    editType: 'datetime',
    required: true,
    editProps: {
      'value-format': 'YYYY-MM-DD HH:mm:ss'
    }
  },
  {
    prop: 'dateRange',
    label: '日期范围',
    editType: 'daterange',
    required: true,
    editProps: {
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format': 'YYYY-MM-DD'
    }
  },
  {
    prop: 'datetimeRange',
    label: '日期时间范围',
    editType: 'datetimerange',
    required: true,
    editProps: {
      'start-placeholder': '开始日期时间',
      'end-placeholder': '结束日期时间',
      'value-format': 'YYYY-MM-DD HH:mm:ss'
    }
  },
  {
    prop: 'month',
    label: '月份',
    editType: 'month',
    required: true,
    editProps: {
      'value-format': 'YYYY-MM'
    }
  },
  {
    prop: 'year',
    label: '年份',
    editType: 'year',
    required: true,
    editProps: {
      'value-format': 'YYYY'
    }
  },
  {
    prop: 'week',
    label: '周',
    editType: 'week',
    required: true,
    editProps: {
      'value-format': 'YYYY-[W]WW'
    }
  }
]
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  bio: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  enabled: [{ required: true, message: '请选择启用状态', trigger: 'change' }],
  tags: [
    { required: true, message: '请选择标签', trigger: 'change', type: 'array' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  datetime: [{ required: true, message: '请选择日期时间', trigger: 'change' }],
  dateRange: [
    {
      required: true,
      message: '请选择日期范围',
      trigger: 'change',
      type: 'array'
    }
  ],
  datetimeRange: [
    {
      required: true,
      message: '请选择日期时间范围',
      trigger: 'change',
      type: 'array'
    }
  ],
  month: [{ required: true, message: '请选择月份', trigger: 'change' }],
  year: [{ required: true, message: '请选择年份', trigger: 'change' }],
  week: [{ required: true, message: '请选择周', trigger: 'change' }]
}

const tableData = ref([
  {
    id: 1,
    name: '张三',
    bio: '负责权限管理与审计',
    role: 'admin',
    enabled: true,
    tags: ['high', 'auto'],
    gender: 'male',
    age: 28,
    date: '2026-03-10',
    datetime: '2026-03-10 09:30:00',
    dateRange: ['2026-03-01', '2026-03-31'],
    datetimeRange: ['2026-03-10 09:30:00', '2026-03-10 18:30:00'],
    month: '2026-03',
    year: '2026',
    week: '2026-W11'
  },
  {
    id: 2,
    name: '李四',
    bio: '负责日常工单处理',
    role: 'user',
    enabled: false,
    tags: ['archived'],
    gender: 'female',
    age: 32,
    date: '2026-03-12',
    datetime: '2026-03-12 14:20:00',
    dateRange: ['2026-03-05', '2026-03-20'],
    datetimeRange: ['2026-03-12 14:20:00', '2026-03-12 19:00:00'],
    month: '2026-03',
    year: '2026',
    week: '2026-W11'
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
