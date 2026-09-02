<template>
  <div class="account-login" @keydown.enter.prevent="handleSubmit">
    <AuthTitle>
      欢迎回来 👋🏻
      <template #desc>请输入您的账户信息以开始管理您的项目</template>
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
      <!-- vben formSchema：快速选择账号 -->
      <el-form-item class="select-item">
        <el-select
          v-model="form.selectAccount"
          placeholder="快速选择账号"
          class="account-select"
          @change="handleAccountChange"
        >
          <el-option
            v-for="option in MOCK_ACCOUNTS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <!-- vben formSchema：账号 -->
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          class="custom-input"
          autocomplete="username"
        />
      </el-form-item>

      <!-- vben formSchema：密码 -->
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          placeholder="请输入密码"
          type="password"
          show-password
          class="custom-input"
          autocomplete="current-password"
        />
      </el-form-item>
    </el-form>

    <!-- vben：记住账号 + 忘记密码? -->
    <div class="form-options">
      <el-checkbox v-model="rememberMe" size="small">记住账号</el-checkbox>
      <span class="link" @click="goForgotPassword">忘记密码?</span>
    </div>

    <!-- vben：登录按钮（loading 状态） -->
    <el-button
      type="primary"
      class="submit-btn"
      :class="{ 'is-loading': loading }"
      :loading="loading"
      @click="handleSubmit"
    >
      {{ loading ? '登录中...' : '登 录' }}
    </el-button>

    <!-- vben：手机号登录 + 扫码登录（outline 按钮） -->
    <div class="alt-actions">
      <el-button class="outline-btn" @click="emit('switch', 'code')">
        手机号登录
      </el-button>
      <el-button class="outline-btn" @click="emit('switch', 'qrcode')">
        扫码登录
      </el-button>
    </div>

    <!-- vben：第三方登录 -->
    <ThirdPartyLogin />

    <!-- vben：注册链接 -->
    <div class="to-register">
      还没有账号?
      <span class="link" @click="emit('switch', 'register')">创建账号</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import AuthTitle from './AuthTitle.vue'
import ThirdPartyLogin from './ThirdPartyLogin.vue'

defineOptions({ name: 'AccountLogin' })

const emit = defineEmits(['switch'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

// vben MOCK_USER_OPTIONS：快速选择账号（与 mock 后端用户一致）
const MOCK_ACCOUNTS = [
  { label: '超级管理员', value: 'admin' },
  { label: '运营编辑', value: 'editor' },
  { label: '测试用户', value: 'user' }
]

const form = reactive({
  selectAccount: '',
  username: '',
  password: ''
})

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于 6 位', trigger: 'blur' }
  ]
})

// vben REMEMBER_ME_KEY：按主机名持久化记住的账号
const REMEMBER_ME_KEY = `REMEMBER_ME_USERNAME_${location.hostname}`
const localUsername = localStorage.getItem(REMEMBER_ME_KEY) || ''
const rememberMe = ref(!!localUsername)

// vben dependencies：选择账号后自动填充用户名与密码（demo 密码均为 123456）
const handleAccountChange = (value) => {
  const account = MOCK_ACCOUNTS.find((item) => item.value === value)
  if (account) {
    form.username = account.value
    form.password = '123456'
    formRef.value?.clearValidate()
  }
}

onMounted(() => {
  if (localUsername) {
    form.username = localUsername
  } else {
    form.selectAccount = 'admin'
    handleAccountChange('admin')
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      localStorage.setItem(
        REMEMBER_ME_KEY,
        rememberMe.value ? form.username : ''
      )
      await userStore.loginAction({
        username: form.username,
        password: form.password
      })
      // 守卫携带 redirect 时（如主窗口内 token 失效后重登）原地回跳
      const redirect = route.query.redirect
      if (redirect) {
        router.push(decodeURIComponent(String(redirect)))
      } else {
        // 浏览器环境直接路由跳转
        router.push('/desktop')
      }
    } catch (error) {
      // 错误提示已由请求层统一处理
      console.log('login failed:', error)
    } finally {
      loading.value = false
    }
  })
}

const goForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style lang="scss" scoped>
.account-login {
  width: 100%;
  animation: fade-up 0.4s ease-out;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  .select-item {
    margin-bottom: 12px;
  }
}

// vben 风格输入框：大号、圆角、聚焦主色描边
.custom-input,
.account-select {
  width: 100%;

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

  :deep(.el-input__prefix),
  :deep(.el-input__suffix) {
    color: var(--color-text-muted);
  }
}

.account-select {
  :deep(.el-select__wrapper) {
    min-height: 38px;
    padding: 0 14px;
    background-color: var(--color-bg-input);
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--color-border) inset;
    transition: all 0.2s ease;

    &.is-focused {
      background-color: var(--color-bg-card);
      box-shadow: 0 0 0 2px var(--color-primary) inset !important;
    }

    &:hover:not(.is-focused) {
      background-color: var(--color-bg-hover);
      box-shadow: 0 0 0 1px var(--color-text-muted) inset;
    }

    .el-select__placeholder {
      color: var(--color-text-muted);
    }

    .el-select__selected-item {
      color: var(--color-text-primary);
    }
  }
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -2px;
  margin-bottom: 12px;

  :deep(.el-checkbox__label) {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}

.link {
  font-size: 13px;
  color: var(--color-primary);
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}

.submit-btn {
  width: 100%;
  height: 38px;
  font-size: 15px;
  font-weight: 600;
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

.alt-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;

  .outline-btn {
    flex: 1;
    height: 36px;

    // 覆盖 Element Plus 相邻按钮默认的 12px 左边距（与 gap 叠加会错位）
    margin-left: 0;
    font-size: 13px;
    color: var(--color-text-primary);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-primary);
      background: var(--color-bg-hover);
      border-color: var(--color-primary);
    }
  }
}

.to-register {
  margin-top: 12px;
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
