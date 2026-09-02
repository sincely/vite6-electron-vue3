<template>
  <div class="code-login" @keydown.enter.prevent="handleSubmit">
    <AuthTitle>
      欢迎回来 📲
      <template #desc>请输入您的手机号码以开始管理您的项目</template>
    </AuthTitle>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      class="login-form"
      label-position="top"
      hide-required-asterisk
      @submit.prevent
    >
      <el-form-item prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="请输入手机号"
          maxlength="11"
          class="custom-input"
          autocomplete="tel"
        />
      </el-form-item>

      <el-form-item prop="code">
        <div class="code-input-group">
          <el-input
            v-model="form.code"
            placeholder="请输入验证码"
            maxlength="6"
            class="custom-input code-input"
            autocomplete="one-time-code"
          />
          <el-button
            class="code-btn"
            :disabled="counting || !isPhoneValid"
            @click="sendCode"
          >
            {{ counting ? `${countdown}s 后重发` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <el-button
      type="primary"
      class="submit-btn"
      :class="{ 'is-loading': loading }"
      :loading="loading"
      @click="handleSubmit"
    >
      {{ loading ? '登录中...' : '登 录' }}
    </el-button>

    <!-- vben code-login：返回账号登录 -->
    <el-button class="outline-btn" @click="emit('switch', 'account')">
      返回账号登录
    </el-button>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import AuthTitle from './AuthTitle.vue'

defineOptions({ name: 'CodeLogin' })

const emit = defineEmits(['switch'])

const formRef = ref()
const loading = ref(false)
const counting = ref(false)
const countdown = ref(60)
let timer = null

const form = reactive({
  phone: '',
  code: ''
})

const rules = reactive({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号码格式错误',
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' }
  ]
})

const isPhoneValid = computed(() => /^1[3-9]\d{9}$/.test(form.phone))

const sendCode = () => {
  if (!isPhoneValid.value) {
    ElMessage.warning('请输入有效的手机号码')
    return
  }
  counting.value = true
  countdown.value = 60
  ElMessage.success('验证码已发送（演示环境不校验）')
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      counting.value = false
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      // 演示环境未接入短信服务，引导用户使用账号密码登录
      await new Promise((resolve) => setTimeout(resolve, 600))
      ElMessage.info(
        '演示环境暂未接入短信服务，请使用账号密码登录（admin/123456）'
      )
    } finally {
      loading.value = false
    }
  })
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.code-login {
  width: 100%;
  animation: fade-up 0.4s ease-out;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.custom-input {
  :deep(.el-input__wrapper) {
    height: 38px;
    padding: 0 14px;
    background-color: var(--color-bg-input);
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--color-border) inset;
    transition: all 0.2s ease;

    &.is-focus {
      background-color: var(--color-bg-card);
      box-shadow: 0 0 0 2px var(--color-primary) inset !important;
    }

    &:hover:not(.is-focus) {
      background-color: var(--color-bg-hover);
      box-shadow: 0 0 0 1px var(--color-text-muted) inset;
    }

    input {
      height: 100%;
      color: var(--color-text-primary);

      &::placeholder {
        color: var(--color-text-muted);
      }
    }
  }
}

.code-input-group {
  display: flex;
  gap: 10px;
  width: 100%;

  .code-input {
    flex: 1;
  }

  .code-btn {
    flex-shrink: 0;
    width: 120px;
    height: 38px;
    padding: 0;
    font-size: 13px;
    color: var(--color-primary);
    background: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      color: #fff;
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 38px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
  background: var(--color-primary);
  border: none;
  border-radius: 8px;
  box-shadow: var(--shadow-glow-primary);

  &:hover,
  &:focus {
    background: var(--color-primary-dark, var(--color-primary));
    filter: brightness(1.05);
  }
}

.outline-btn {
  width: 100%;
  height: 38px;
  margin-top: 12px;

  // 覆盖 Element Plus 相邻按钮默认的 12px 左边距，与登录按钮保持左右对齐
  margin-left: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;

  &:hover {
    color: var(--color-primary);
    background: var(--color-bg-hover);
    border-color: var(--color-primary);
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
