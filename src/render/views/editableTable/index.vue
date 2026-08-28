<template>
  <div class="log-container">
    <PageHeader
      title="可编辑表格"
      subtitle="EditTable 组件演示：行内编辑、表单校验、增删改、列筛选、行多选与拖拽排序"
      icon="edit"
    />

    <DynamicSearchBar :items="searchItems" :params="searchParams" />

    <EditTable
      ref="editTableRef"
      :data="filteredData"
      :columns="columns"
      :config="{ selection: true, dragSort: true, showSummary: true }"
      @update:data="handleDataUpdate"
      @save="handleSave"
      @delete="handleDelete"
      @add="handleAdd"
      @change="handleCellChange"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <template #toolbar-left>
        <el-button type="danger" plain size="small" @click="handleBatchDelete">
          批量删除
        </el-button>
      </template>
      <!-- <template #nameHeader="{ column }">
        <span style="color: red">*</span>
        {{ column.label }} (自定义)
      </template> -->
    </EditTable>
  </div>
</template>

<script setup>
// 省市区联动数据源：省 -> 市 -> 区
const REGION_MAP = {
  广东省: {
    广州市: ['天河区', '越秀区', '番禺区'],
    深圳市: ['南山区', '福田区', '宝安区']
  },
  浙江省: {
    杭州市: ['西湖区', '拱墅区', '滨江区'],
    宁波市: ['海曙区', '江北区']
  },
  江苏省: {
    南京市: ['玄武区', '鼓楼区', '江宁区'],
    苏州市: ['姑苏区', '吴中区']
  }
}
const toOptions = (list) => list.map((v) => ({ label: v, value: v }))

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
    // headerSlot: 'nameHeader',
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
    // 列筛选：外部传入 filters + filterMethod 即开启该列的表头筛选
    filters: [
      { text: '管理员', value: 'admin' },
      { text: '用户', value: 'user' }
    ],
    filterMethod: (value, row) => row.role === value,
    rules: [{ required: true, message: '请选择角色', trigger: 'change' }]
  },
  // ---- 省市区三级联动演示 ----
  {
    prop: 'province',
    label: '省份',
    type: 'select',
    options: toOptions(Object.keys(REGION_MAP)),
    // 切换省份时清空已选城市/区县（下游 options 会自动跟随变化）
    onChange: (val, row) => {
      row.city = ''
      row.district = ''
    }
  },
  {
    prop: 'city',
    label: '城市',
    type: 'select',
    // 按行求值：城市选项依赖当前行的省份
    options: (row) => toOptions(Object.keys(REGION_MAP[row.province] || {})),
    // 未选省份时禁用
    componentProps: (row) => ({ disabled: !row.province }),
    onChange: (val, row) => {
      row.district = ''
    }
  },
  {
    prop: 'district',
    label: '区县',
    type: 'select',
    options: (row) => toOptions(REGION_MAP[row.province]?.[row.city] || []),
    componentProps: (row) => ({ disabled: !row.city })
  },
  {
    prop: 'amount',
    label: '金额',
    type: 'money',
    width: 160,
    required: true,
    // 参与底部汇总行求和；展示格式默认 ￥ + 千分位 + 两位小数，
    // 可通过 componentProps: { prefix, decimals, thousand } 调整
    summary: true,
    rules: [
      { required: true, message: '请输入金额', trigger: 'blur' },
      { type: 'number', min: 0, message: '金额不能为负', trigger: 'blur' }
    ]
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
    // 布尔值筛选：勾选“启用”只显示 row.enabled === true 的行
    filters: [
      { text: '启用', value: true },
      { text: '禁用', value: false }
    ],
    filterMultiple: false,
    filterMethod: (value, row) => row.enabled === value
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

// 演示初始数据
const createSeedData = () => [
  {
    id: 1,
    name: '张三',
    bio: '前端开发工程师，负责组件库建设',
    role: 'admin',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    amount: 128600.5,
    enabled: true,
    tags: ['high', 'auto'],
    gender: 'male',
    age: 28,
    date: '2026-01-15',
    datetime: '2026-01-15 09:30:00',
    dateRange: ['2026-01-01', '2026-03-31'],
    datetimeRange: ['2026-01-01 08:00:00', '2026-03-31 18:00:00'],
    month: '2026-01',
    year: '2026'
  },
  {
    id: 2,
    name: '李四',
    bio: '产品经理，主导需求评审',
    role: 'user',
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    amount: 23980.99,
    enabled: false,
    tags: ['archived'],
    gender: 'female',
    age: 32,
    date: '2026-02-20',
    datetime: '2026-02-20 14:00:00',
    dateRange: ['2026-02-01', '2026-04-30'],
    datetimeRange: ['2026-02-01 09:00:00', '2026-04-30 17:30:00'],
    month: '2026-02',
    year: '2026'
  },
  {
    id: 3,
    name: '王五',
    bio: '后端开发工程师，负责接口服务',
    role: 'user',
    province: '江苏省',
    city: '南京市',
    district: '鼓楼区',
    amount: 1500000,
    enabled: true,
    tags: ['auto'],
    gender: 'secret',
    age: 26,
    date: '2026-03-08',
    datetime: '2026-03-08 10:15:00',
    dateRange: ['2026-03-01', '2026-05-31'],
    datetimeRange: ['2026-03-01 08:30:00', '2026-05-31 19:00:00'],
    month: '2026-03',
    year: '2026'
  }
]

// 搜索栏配置（DynamicSearchBar）：姓名/角色/启用状态
const searchItems = [
  { prop: 'name', label: '姓名', type: 'input' },
  {
    prop: 'role',
    label: '角色',
    type: 'select',
    component: {
      options: [
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' }
      ]
    }
  },
  {
    prop: 'enabled',
    label: '状态',
    type: 'select',
    component: {
      options: [
        { label: '启用', value: 'true' },
        { label: '禁用', value: 'false' }
      ]
    }
  }
]
const searchParams = reactive({ name: '', role: '', enabled: '' })

const tableData = ref(createSeedData())

// 关键字过滤（按姓名/角色/状态），过滤结果传给 EditTable
const filteredData = computed(() => {
  const kw = (searchParams.name || '').trim().toLowerCase()
  if (!kw && !searchParams.role && searchParams.enabled === '') {
    return tableData.value
  }
  return tableData.value.filter((row) => {
    if (kw && !(row.name || '').toLowerCase().includes(kw)) return false
    if (searchParams.role && row.role !== searchParams.role) return false
    if (
      searchParams.enabled !== '' &&
      String(row.enabled) !== searchParams.enabled
    )
      return false
    return true
  })
})

// 搜索时 EditTable 只持有过滤后的子集，写回时需与未展示的原始行合并
const handleDataUpdate = (list) => {
  const isFiltering = filteredData.value !== tableData.value
  if (!isFiltering) {
    tableData.value = list
    return
  }
  const displayed = new Set(filteredData.value.map((r) => r.id))
  const untouched = tableData.value.filter((r) => !displayed.has(r.id))
  tableData.value = [...untouched, ...list]
}

const handleSave = (row, index) => {
  console.log('保存', row, index)
  // 模拟保存后更新数据
  // tableData.value[index] = { ...row }
}

// 单元格变化事件：跨组件/跨行联动可在此处理
// （省市区联动已通过列配置的 options 函数 + onChange 自动完成，这里仅作观察）
const handleCellChange = ({ prop, value, row, index }) => {
  console.log('单元格变化', prop, value, '行', index, row)
}

// ---- 行多选 + 拖拽排序（config.selection / config.dragSort 开启）----
const editTableRef = ref(null)
const selectedCount = ref(0)

const handleSelectionChange = (rows) => {
  selectedCount.value = rows.length
}

// 批量删除交给组件暴露的方法：内部会清理选中行并同步 update:data
const handleBatchDelete = () => {
  editTableRef.value?.deleteSelection()
  selectedCount.value = 0
}
const handleDelete = (row, index) => {
  console.log('删除', row, index)
  // EditTable 内部已经处理了 splice，这里只需要处理后端请求
}
const handleAdd = (row) => {
  // 为新增行分配 id（row 与组件内部同一引用），保证过滤写回合并可寻址
  if (row.id === undefined) row.id = Date.now()
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
</style>
