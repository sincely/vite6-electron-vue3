<!--
  问题反馈：全局右下角“?”悬浮按钮 + 向上滑出的反馈面板
  - 提交流程与 FeedbackDialog 一致：拼装 GitHub Issue 内容由系统浏览器打开
-->
<template>
  <div class="problem-feedback">
    <button
      type="button"
      class="pf-fab"
      :class="{ 'is-open': panelOpen }"
      :title="panelOpen ? '收起反馈面板' : '问题反馈'"
      @click="panelOpen = !panelOpen"
    >
      <Icon :icon="panelOpen ? 'lucide:x' : 'ri:question-line'" width="20" height="20" />
    </button>

    <!-- 滑出面板：浮层定位，不挤压内容区 -->
    <Transition name="pf-panel">
      <section v-show="panelOpen" class="pf-panel">
        <header class="pf-panel-header">
          <div class="pf-panel-heading">
            <span class="pf-panel-heading-icon">
              <Icon icon="lucide:message-square-text" width="18" height="18" />
            </span>
            <div>
              <div class="pf-panel-title">问题反馈</div>
              <div class="pf-panel-subtitle">欢迎提交功能建议或 Bug，帮助我们持续改进产品</div>
            </div>
          </div>
          <button type="button" class="pf-panel-close" title="收起" @click="panelOpen = false">
            <Icon icon="lucide:x" width="16" height="16" />
          </button>
        </header>

        <div class="pf-panel-body">
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
            <el-form-item label="反馈类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio v-for="item in typeOptions" :key="item.label" :value="item.label">
                  <span class="pf-radio-label">
                    <Icon :icon="item.icon" width="14" height="14" />
                    {{ item.label }}
                  </span>
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="紧急程度" prop="urgency">
              <el-radio-group v-model="form.urgency">
                <el-radio v-for="item in urgencyOptions" :key="item" :value="item">
                  {{ item }}
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="问题标题" prop="title">
              <el-input v-model="form.title" placeholder="一句话描述问题或建议" maxlength="100" clearable />
            </el-form-item>

            <el-form-item label="详细描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                maxlength="5000"
                show-word-limit
                placeholder="请尽量写清楚触发步骤、现象、影响范围，方便我们快速复现和判断优先级"
              />
            </el-form-item>

            <el-form-item label="你期望它如何表现" prop="expectation">
              <el-input
                v-model="form.expectation"
                type="textarea"
                :rows="4"
                maxlength="1000"
                show-word-limit
                placeholder="可选，写下你觉得更合理的结果或希望新增的能力"
              />
            </el-form-item>

            <div class="pf-form-row">
              <el-form-item label="联系人" prop="contact">
                <el-input v-model="form.contact" placeholder="可选" clearable />
              </el-form-item>
              <el-form-item label="联系方式" prop="contactInfo">
                <el-input v-model="form.contactInfo" placeholder="邮箱 / QQ / 电话，可选" clearable />
              </el-form-item>
            </div>

            <div class="pf-form-row">
              <el-form-item label="发生频率" prop="frequency">
                <el-select v-model="form.frequency" placeholder="请选择">
                  <el-option v-for="item in frequencyOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item label="影响范围" prop="scope">
                <el-select v-model="form.scope" placeholder="请选择">
                  <el-option v-for="item in scopeOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </div>
          </el-form>
        </div>

        <footer class="pf-panel-footer">
          <el-button @click="handleLater">稍后再说</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            <Icon v-if="!submitting" icon="lucide:send" width="14" height="14" class="pf-btn-icon" />
            提交反馈
          </el-button>
        </footer>
      </section>
    </Transition>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'

import { useUpdateStore } from '@/store/modules/version'

const ISSUE_URL = 'https://github.com/sincely/vite6-electron-vue3/issues/new'

const route = useRoute()
const updateStore = useUpdateStore()

const panelOpen = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const typeOptions = [
  { label: '功能建议', icon: 'lucide:lightbulb' },
  { label: 'Bug 反馈', icon: 'lucide:bug' },
  { label: '体验问题', icon: 'lucide:mouse-pointer-click' },
  { label: '性能问题', icon: 'lucide:gauge' },
  { label: '其他', icon: 'lucide:ellipsis' }
]
const urgencyOptions = ['低', '中', '高', '紧急']
const frequencyOptions = ['偶尔', '经常出现', '稳定复现']
const scopeOptions = ['自己', '小范围用户', '核心流程/大范围用户']

const defaultForm = () => ({
  type: '',
  urgency: '',
  title: '',
  description: '',
  expectation: '',
  contact: '',
  contactInfo: '',
  frequency: '偶尔',
  scope: '自己'
})

const form = ref(defaultForm())

const rules = {
  type: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  title: [
    { required: true, message: '请填写问题标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度需在 2-100 字之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请填写详细描述', trigger: 'blur' },
    { min: 10, message: '描述至少 10 个字，方便我们定位问题', trigger: 'blur' }
  ]
}

const handleLater = () => {
  panelOpen.value = false
}

// 关闭动画结束后重置，避免下次打开残留上次内容
watch(panelOpen, (open) => {
  if (open) return
  formRef.value?.resetFields()
  form.value = defaultForm()
  submitting.value = false
})

// 收集运行环境与页面上下文，附在 issue 中方便排查
const getEnvInfo = () => {
  const versions = window.versions || {}
  return [
    `- 应用版本: ${updateStore.currentVersion || '未知'}`,
    `- Electron: ${versions.electron || '-'}`,
    `- Chrome: ${versions.chrome || '-'}`,
    `- Node: ${versions.node || '-'}`,
    `- 平台: ${navigator.platform || '-'}`,
    `- 当前页面: ${route.fullPath}`
  ].join('\n')
}

const buildIssueUrl = () => {
  const { type, urgency, title, description, expectation, contact, contactInfo, frequency, scope } = form.value
  const body = [
    `## 反馈类型\n${type}`,
    `## 紧急程度\n${urgency}`,
    `## 详细描述\n${description}`,
    `## 发生频率\n${frequency}`,
    `## 影响范围\n${scope}`,
    expectation ? `## 期望表现\n${expectation}` : '',
    contact || contactInfo ? `## 联系方式\n${contact || '-'} ${contactInfo || ''}`.trim() : '',
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
    // window.open 会被主进程 setWindowOpenHandler 拦截并交给系统浏览器打开
    window.open(buildIssueUrl(), '_blank', 'noopener')
    ElMessage.success('感谢反馈！已为你打开 GitHub Issues 页面，点击提交即可完成')
    panelOpen.value = false
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.problem-feedback {
  position: fixed;
  right: 30px;
  bottom: 50px;
  z-index: 1100;
}

/* 右下角圆形悬浮按钮 */
.pf-fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  color: var(--el-color-primary);
  cursor: pointer;
  background: var(--el-bg-color-overlay);
  border: none;
  border-radius: 50%;
  box-shadow: var(--el-box-shadow-lighter);
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  &:hover,
  &.is-open {
    background-color: var(--el-color-primary-light-9);
  }
}

/* 滑出面板：按钮正上方向上展开，不挤压内容区布局 */
.pf-panel {
  position: absolute;
  right: 0;
  bottom: 52px;
  display: flex;
  flex-direction: column;
  width: 420px;
  max-height: calc(100vh - var(--titlebar-height) - 120px);
  overflow: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
}

.pf-panel-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-border-light);

  .pf-panel-heading {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .pf-panel-heading-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 32px;
    height: 32px;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
    border-radius: 8px;
  }

  .pf-panel-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .pf-panel-subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

.pf-panel-close {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm, 6px);
  transition:
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }
}

.pf-panel-body {
  flex: 1;
  min-height: 0;
  padding: 16px 20px 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 4px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
  }

  :deep(.el-select) {
    width: 100%;
  }
}

/* 两列并排字段（联系人/联系方式、发生频率/影响范围） */
.pf-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pf-radio-label {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.pf-btn-icon {
  margin-right: 4px;
}

.pf-panel-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid var(--color-border-light);
}

/* 面板滑入滑出：横向平移 + 淡入淡出 */
.pf-panel-enter-active,
.pf-panel-leave-active {
  transition:
    opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.pf-panel-enter-from,
.pf-panel-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
