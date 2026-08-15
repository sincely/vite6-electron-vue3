<template>
  <div class="form-basic-page">
    <PageHeader
      title="基础表单"
      subtitle="AdvanceForm 配置驱动：schema 描述字段、校验规则、编辑态与联动显隐"
      icon="file-text"
    >
      <template #actions>
        <el-switch
          v-model="isEdit"
          inline-prompt
          active-text="编辑"
          inactive-text="只读"
          style="margin-right: 12px"
        />
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :disabled="!isEdit" @click="handleSubmit">
          提交
        </el-button>
      </template>
    </PageHeader>

    <el-card shadow="never" class="form-card">
      <AdvanceForm
        ref="formRef"
        v-model="formModel"
        :schemas="schemas"
        :rules="rules"
        :is-edit="isEdit"
        :form-props="{ labelWidth: '100px' }"
        @submit="onSubmit"
      />
    </el-card>

    <el-card shadow="never" class="form-card">
      <template #header>
        <span class="card-title">当前表单数据（实时）</span>
      </template>
      <pre class="model-preview">{{ formModel }}</pre>
    </el-card>
  </div>
</template>

<script setup>
defineOptions({ name: 'example-form-basic' })
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const isEdit = ref(true)

const formModel = ref({
  name: '',
  phone: '',
  gender: 'male',
  type: 'personal',
  company: '',
  department: '',
  skills: [],
  joinDate: '',
  dateRange: [],
  level: 3,
  score: 0,
  enabled: true,
  remark: ''
})

// 字段 schema：prop 对应 model 字段，type 决定渲染组件，colProps 控制栅格宽度
const schemas = [
  {
    prop: 'name',
    label: '姓名',
    type: 'input',
    required: true,
    componentProps: { maxlength: 20, showWordLimit: true }
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    inputType: 'tel',
    required: true
  },
  {
    prop: 'gender',
    label: '性别',
    type: 'radio-group',
    options: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' }
    ]
  },
  {
    prop: 'type',
    label: '类型',
    type: 'select',
    required: true,
    options: [
      { label: '个人用户', value: 'personal' },
      { label: '企业用户', value: 'company' }
    ]
  },
  {
    prop: 'company',
    label: '企业名称',
    type: 'input',
    required: true,
    colProps: { xl: 12, lg: 12, md: 12 },
    // 条件显隐：仅企业用户展示（hidden 支持布尔值或函数）
    hidden: (model) => model.type !== 'company'
  },
  {
    prop: 'department',
    label: '部门',
    type: 'tree-select',
    colProps: { xl: 12, lg: 12, md: 12 },
    componentProps: {
      checkStrictly: true,
      data: [
        {
          label: '技术中心',
          value: 'tech',
          children: [
            { label: '前端组', value: 'tech-fe' },
            { label: '后端组', value: 'tech-be' }
          ]
        },
        {
          label: '运营中心',
          value: 'ops',
          children: [{ label: '市场部', value: 'ops-market' }]
        }
      ]
    }
  },
  {
    prop: 'skills',
    label: '技能标签',
    type: 'checkbox-group',
    colProps: { xl: 12, lg: 12, md: 12 },
    options: [
      { label: 'Vue', value: 'vue' },
      { label: 'React', value: 'react' },
      { label: 'Node', value: 'node' },
      { label: 'Electron', value: 'electron' }
    ]
  },
  {
    prop: 'joinDate',
    label: '入职日期',
    type: 'date',
    componentProps: { valueFormat: 'YYYY-MM-DD' }
  },
  {
    prop: 'dateRange',
    label: '项目周期',
    type: 'daterange',
    colProps: { xl: 12, lg: 12, md: 12 },
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期'
    }
  },
  {
    prop: 'level',
    label: '职级',
    type: 'slider',
    componentProps: { min: 1, max: 10, showStops: true }
  },
  {
    prop: 'score',
    label: '满意度评分',
    type: 'rate',
    componentProps: { allowHalf: true, showScore: true }
  },
  {
    prop: 'enabled',
    label: '启用状态',
    type: 'switch'
  },
  {
    prop: 'remark',
    label: '备注',
    type: 'textarea',
    colProps: { span: 24 },
    componentProps: { rows: 3, maxlength: 200, showWordLimit: true }
  }
]

// 校验规则（与 schema 的 required 标记配合）
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  company: [{ required: true, message: '请输入企业名称', trigger: 'blur' }]
}

const handleReset = () => {
  formRef.value?.resetFields()
  ElMessage.info('表单已重置')
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('校验通过，表单已提交')
    } else {
      ElMessage.error('表单校验未通过，请检查必填项')
    }
  })
}

const onSubmit = (model) => {
  console.log('AdvanceForm submit:', model)
}
</script>

<style lang="scss" scoped>
.form-basic-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.form-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.model-preview {
  max-height: 240px;
  padding: 12px;
  margin: 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  border-radius: var(--radius-sm);
}
</style>
