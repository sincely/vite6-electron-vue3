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
        <el-button type="primary" @click="dialogVisible = true">
          <span>新建</span>
        </el-button>
      </template>
    </PageHeader>

    <!-- 详情弹窗 -->
    <ModalDialog
      v-model="dialogVisible"
      title="日志详情"
      subtitle="查看完整的操作日志信息"
      icon="document"
      width="800px"
      height="400px"
      @close="handleClose"
    >
      <AdvanceForm
        v-model="formModel"
        :schemas="formSchemas"
        :form-props="{ labelWidth: '120px' }"
        :col-props="{ span: 12 }"
        :is-edit="isEdit"
      />

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          导出记录
        </el-button>
      </template>
    </ModalDialog>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

const dialogVisible = ref(false)
const formModel = ref({
  keyword: '系统升级任务',
  password: '123456',
  description: '这是一个用于演示 AdvanceForm 全字段类型的表单页面。',
  count: 8,
  type: 'system',
  enabled: true,
  tags: ['publish', 'security'],
  level: 'high',
  date: ['2026-03-01', '2026-03-25'],
  datetime: '2026-03-25 10:30:00',
  month: '2026-03',
  year: '2026',
  time: '09:30:00',
  timeRange: ['09:00:00', '18:00:00'],
  department: ['platform', 'frontend'],
  owner: 'zhangsan',
  progress: 68,
  score: 4,
  themeColor: '#409EFF',
  permissions: ['api', 'dashboard'],
  action: '系统操作'
})

const searchKeyword = ref('')
const isEdit = ref(true)

const actionSuggestions = [
  { value: '系统操作' },
  { value: '用户操作' },
  { value: '批量导出' },
  { value: '权限调整' },
  { value: '日志清理' }
]

const handleClose = () => {
  dialogVisible.value = false
}

const queryActionSuggestions = (queryString, callback) => {
  const keyword = queryString.trim().toLowerCase()
  const results = keyword
    ? actionSuggestions.filter((item) =>
        item.value.toLowerCase().includes(keyword)
      )
    : actionSuggestions
  callback(results)
}

const formSchemas = ref([
  {
    label: '关键词',
    prop: 'keyword',
    type: 'input',
    required: true,
    componentProps: {
      placeholder: '请输入关键词'
    },
    rules: [{ required: true, message: '请输入关键词', trigger: 'blur' }]
  },
  {
    label: '登录密码',
    prop: 'password',
    type: 'password',
    componentProps: {
      showPassword: true
    }
  },
  {
    label: '操作说明',
    prop: 'description',
    type: 'textarea',
    colProps: {
      span: 24
    },
    componentProps: {
      rows: 4
    }
  },
  {
    label: '处理数量',
    prop: 'count',
    type: 'number',
    componentProps: {
      min: 0,
      max: 100
    }
  },
  {
    label: '日志类型',
    prop: 'type',
    type: 'select',
    options: [
      { label: '系统操作', value: 'system' },
      { label: '用户操作', value: 'user' },
      { label: '审计记录', value: 'audit' }
    ],
    handleChange: (val) => {
      formModel.value.keyword = val
    }
  },
  {
    label: '启用状态',
    prop: 'enabled',
    type: 'switch'
  },
  {
    label: '功能标签',
    prop: 'tags',
    type: 'checkbox-group',
    options: [
      { label: '发布', value: 'publish' },
      { label: '安全', value: 'security' },
      { label: '通知', value: 'notice' }
    ]
  },
  {
    label: '风险级别',
    prop: 'level',
    type: 'radio-group',
    options: [
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' }
    ]
  },
  {
    label: '操作时间',
    prop: 'date',
    type: 'daterange',
    componentProps: {
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      startPlaceholder: '开始时间',
      endPlaceholder: '结束时间'
    }
  },
  {
    label: '审批时间',
    prop: 'datetime',
    type: 'datetime',
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  {
    label: '所属月份',
    prop: 'month',
    type: 'month',
    componentProps: {
      format: 'YYYY-MM',
      valueFormat: 'YYYY-MM'
    }
  },
  {
    label: '所属年份',
    prop: 'year',
    type: 'year',
    componentProps: {
      format: 'YYYY',
      valueFormat: 'YYYY'
    }
  },
  {
    label: '执行时刻',
    prop: 'time',
    type: 'time',
    componentProps: {
      format: 'HH:mm:ss',
      valueFormat: 'HH:mm:ss'
    }
  },
  {
    label: '执行时段',
    prop: 'timeRange',
    type: 'timerange',
    componentProps: {
      format: 'HH:mm:ss',
      valueFormat: 'HH:mm:ss',
      startPlaceholder: '开始时刻',
      endPlaceholder: '结束时刻'
    }
  },
  {
    label: '归属部门',
    prop: 'department',
    type: 'cascader',
    options: [
      {
        label: '平台中心',
        value: 'platform',
        children: [
          { label: '前端组', value: 'frontend' },
          { label: '后端组', value: 'backend' }
        ]
      },
      {
        label: '产品中心',
        value: 'product',
        children: [
          { label: '设计组', value: 'design' },
          { label: '运营组', value: 'operation' }
        ]
      }
    ]
  },
  {
    label: '负责人',
    prop: 'owner',
    type: 'tree-select',
    options: [
      {
        label: '研发部',
        value: 'dev',
        children: [
          { label: '张三', value: 'zhangsan' },
          { label: '李四', value: 'lisi' }
        ]
      },
      {
        label: '运维部',
        value: 'ops',
        children: [
          { label: '王五', value: 'wangwu' },
          { label: '赵六', value: 'zhaoliu' }
        ]
      }
    ]
  },
  {
    label: '完成进度',
    prop: 'progress',
    type: 'slider'
  },
  {
    label: '满意评分',
    prop: 'score',
    type: 'rate'
  },
  {
    label: '主题颜色',
    prop: 'themeColor',
    type: 'color'
  },
  {
    label: '权限分配',
    prop: 'permissions',
    type: 'transfer',
    colProps: {
      span: 24
    },
    options: [
      { label: '接口权限', value: 'api' },
      { label: '控制台权限', value: 'dashboard' },
      { label: '报表权限', value: 'report' },
      { label: '配置权限', value: 'config' }
    ]
  },
  {
    label: '操作动作',
    prop: 'action',
    type: 'autocomplete',
    componentProps: {
      fetchSuggestions: queryActionSuggestions
    }
  }
])
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
