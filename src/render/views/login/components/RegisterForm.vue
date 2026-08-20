<template>
  <div class="register-form" @keydown.enter.prevent="handleSubmit">
    <AuthTitle>
      创建一个账号 🚀
      <template #desc>让您的应用程序管理变得简单而有趣</template>
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
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          class="custom-input"
          autocomplete="username"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          placeholder="请输入密码"
          type="password"
          show-password
          class="custom-input"
          autocomplete="new-password"
        />
        <!-- vben passwordStrength 提示 -->
        <p class="strength-hint">使用 8 个或更多字符，混合字母、数字和符号。</p>
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          placeholder="确认密码"
          type="password"
          show-password
          class="custom-input"
          autocomplete="new-password"
        />
      </el-form-item>

      <el-form-item prop="agreePolicy" class="policy-item">
        <el-checkbox v-model="form.agreePolicy">
          我同意
          <span class="link" @click.stop>隐私政策</span>
          与
          <span class="link" @click.stop>条款</span>
        </el-checkbox>
      </el-form-item>
    </el-form>

    <el-button
      type="primary"
      class="submit-btn"
      :class="{ 'is-loading': loading }"
      :loading="loading"
      @click="handleSubmit"
    >
      {{ loading ? '注册中...' : '注 册' }}
    </el-button>

    <!-- vben：已经有账号了? 去登录 -->
    <div class="to-login">
      已经有账号了?
      <span class="link" @click="emit('switch', 'account')">去登录</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import AuthTitle from './AuthTitle.vue'

defineOptions({ name: 'RegisterForm' })

const emit = defineEmits(['switch'])

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  agreePolicy: false
})

const validateConfirm = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePolicy = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请同意隐私政策和条款'))
  } else {
    callback()
  }
}

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少 8 个字符', trigger: 'blur' }
  ],
  confirmPassword: [{ validator: validateConfirm, trigger: 'blur' }],
  agreePolicy: [{ validator: validatePolicy, trigger: 'change' }]
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      ElMessage.info('演示环境暂未开放注册，请使用测试账号登录（admin/123456）')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.register-form {
  width: 100%;
  animation: fade-up 0.4s ease-out;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .policy-item {
    margin-bottom: 18px;

    :deep(.el-form-item__content) {
      line-height: 1.5;
    }

    :deep(.el-checkbox__label) {
      font-size: 13px;
      color: var(--color-text-secondary);
    }
  }
}

.custom-input {
  :deep(.el-input__wrapper) {
    height: 42px;
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

.strength-hint {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-muted);
}

.submit-btn {
  width: 100%;
  height: 42px;
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

.link {
  color: var(--color-primary);
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}

.to-login {
  margin-top: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: center;
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
