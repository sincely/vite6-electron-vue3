<template>
  <div class="account-login-form">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      class="login-form"
      label-position="top"
      hide-required-asterisk
    >
      <el-form-item prop="phone" label="手机号码">
        <el-input
          v-model="ruleForm.phone"
          placeholder="请输入手机号码"
          :prefix-icon="Iphone"
          class="custom-input"
        />
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input
          v-model="ruleForm.password"
          placeholder="请输入密码"
          :type="showPassword ? 'text' : 'password'"
          :prefix-icon="Lock"
          class="custom-input"
        >
          <template #suffix>
            <span class="password-toggle" @click="togglePasswordVisibility">
              <svg-icon
                :iconClass="showPassword ? 'open-eye' : 'close-eye'"
                width="16px"
                height="16px"
              />
            </span>
          </template>
        </el-input>
      </el-form-item>

      <div class="form-options">
        <el-checkbox v-model="rememberMe" label="记住我" size="small" />
        <span class="forgot-password">忘记密码?</span>
      </div>

      <el-form-item class="submit-item">
        <el-button
          :class="{ 'submit-btn': true, 'is-loading': loading }"
          :loading="loading"
          @click="submitForm(ruleFormRef)"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { Iphone, Lock } from '@element-plus/icons-vue'

const ruleFormRef = ref()
const showPassword = ref(false)
const loading = ref(false)
const rememberMe = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const ruleForm = reactive({
  phone: '',
  password: ''
})

const rules = reactive({
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6位', trigger: 'blur' }
  ]
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      // 模拟登录请求
      setTimeout(() => {
        window.ipcRenderer?.send('toMain')
        loading.value = false
      }, 800)
    } else {
      console.log('error submit!', fields)
    }
  })
}

const isInput = computed(() => {
  return ruleForm.phone && ruleForm.password
})
</script>

<style lang="scss" scoped>
.account-login-form {
  width: 100%;
  height: 100%;
  padding: 0 16px;
  animation: fade-up 0.4s ease-out;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    padding-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}

.custom-input {
  :deep(.el-input__wrapper) {
    height: 44px;
    padding: 0 14px;
    background-color: var(--color-bg-input);
    border-radius: 10px;
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

  :deep(.el-input__prefix-inner) {
    margin-right: 8px;
    color: var(--color-text-secondary);
  }
}

.password-toggle {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary);
  }
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -6px;
  margin-bottom: 20px;

  :deep(.el-checkbox__label) {
    color: var(--color-text-secondary);
  }

  .forgot-password {
    font-size: 12px;
    color: var(--color-primary);
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      text-decoration: underline;
      opacity: 0.8;
    }
  }
}

.submit-item {
  margin-bottom: 0 !important;
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  font-weight: 600;
  color: aliceblue;
  letter-spacing: 1px;
  background: #007bff;
  border: none;
  border-radius: 10px;
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
