<template>
  <el-dialog
    v-model="visible"
    class="modal-dialog"
    width="560px"
    :show-close="true"
    :close-on-click-modal="false"
    align-center
    append-to-body
    destroy-on-close
    @closed="handleClosed"
  >
    <template #header>
      <div class="feedback-header">
        <div class="feedback-header__title">问题反馈</div>
        <div class="feedback-header__subtitle">
          欢迎提交功能建议或 Bug 反馈，帮助我们持续改进产品
        </div>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="feedback-form"
      @submit.prevent
    >
      <div class="form-row">
        <el-form-item label="反馈类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择反馈类型">
            <el-option
              v-for="item in typeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="紧急程度" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择紧急程度">
            <el-option
              v-for="item in priorityOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </div>

      <el-form-item label="问题标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="一句话描述问题或建议"
          maxlength="100"
          clearable
        />
      </el-form-item>

      <el-form-item label="详细描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          maxlength="5000"
          show-word-limit
          resize="none"
          placeholder="请尽量写清楚触发步骤、现象、影响范围，方便我们快速复现和判断优先级"
        />
      </el-form-item>

      <el-form-item label="你期望它如何表现" prop="expectation">
        <el-input
          v-model="form.expectation"
          type="textarea"
          :rows="3"
          maxlength="1000"
          show-word-limit
          resize="none"
          placeholder="可选，写下你觉得更合理的结果或希望新增的能力"
        />
      </el-form-item>

      <div class="form-row">
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" placeholder="可选" clearable />
        </el-form-item>
        <el-form-item label="联系方式" prop="contactInfo">
          <el-input
            v-model="form.contactInfo"
            placeholder="邮箱 / QQ / 电话，可选"
            clearable
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="feedback-footer">
        <el-button @click="handleLater">稍后再说</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          提交反馈
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useUpdateStore } from '@/store/modules/version'

const ISSUE_URL = 'https://github.com/sincely/vite6-electron-vue3/issues/new'

const updateStore = useUpdateStore()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const typeOptions = ['功能建议', 'Bug 反馈', '体验问题', '性能问题', '其他']
const priorityOptions = ['高', '中', '低']

const defaultForm = () => ({
  type: '功能建议',
  priority: '中',
  title: '',
  description: '',
  expectation: '',
  contact: '',
  contactInfo: ''
})

const form = ref(defaultForm())

const rules = {
  type: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  title: [
    { required: true, message: '请填写问题标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度需在 2-100 字之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请填写详细描述', trigger: 'blur' },
    { min: 10, message: '描述至少 10 个字，方便我们定位问题', trigger: 'blur' }
  ]
}

const open = () => {
  visible.value = true
}

const handleLater = () => {
  visible.value = false
}

// 弹窗完全关闭后重置表单，避免下次打开残留上次内容
const handleClosed = () => {
  formRef.value?.resetFields()
  form.value = defaultForm()
  submitting.value = false
}

// 收集运行环境信息，附在 issue 中方便排查
const getEnvInfo = () => {
  const lines = [
    `- 应用版本: ${updateStore.currentVersion || '未知'}`,
    `- 浏览器: ${navigator.userAgent || '-'}`,
    `- 平台: ${navigator.platform || '-'}`
  ]
  return lines.join('\n')
}

const buildIssueUrl = () => {
  const {
    type,
    priority,
    title,
    description,
    expectation,
    contact,
    contactInfo
  } = form.value
  const body = [
    `## 反馈类型\n${type}`,
    `## 紧急程度\n${priority}`,
    `## 详细描述\n${description}`,
    expectation ? `## 期望表现\n${expectation}` : '',
    contact || contactInfo
      ? `## 联系方式\n${contact || '-'} ${contactInfo || ''}`.trim()
      : '',
    `## 环境信息\n${getEnvInfo()}`
  ]
    .filter(Boolean)
    .join('\n\n')

  const params = new URLSearchParams({
    title: `[${type}] ${title}`,
    body
  })
  return `${ISSUE_URL}?${params.toString()}`
}

const handleSubmit = async () => {
  if (submitting.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    // 浏览器端直接在新标签页打开 GitHub Issues
    window.open(buildIssueUrl(), '_blank', 'noopener')
    ElMessage.success(
      '感谢反馈！已为你打开 GitHub Issues 页面，点击提交即可完成'
    )
    visible.value = false
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<style lang="scss" scoped>
.feedback-header {
  padding: 16px 20px;
  margin: -20px -20px 0;
  border-radius: 8px 8px 0 0;

  // background: color-mix(in srgb, var(--color-primary), transparent 92%);

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary, #303133);
  }

  &__subtitle {
    margin-top: 6px;
    font-size: 13px;
    color: var(--color-text-secondary, #909399);
  }
}

.feedback-form {
  margin-top: 20px;

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }

  :deep(.el-select) {
    width: 100%;
  }
}

.feedback-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
