<template>
  <div v-loading="changeRegLoading || submitLoading" class="login-main">
    <div class="drag-region" />
    <div class="login-shell page-enter">
      <section class="login-brand">
        <img src="@/assets/bar/logo.svg" alt="logo" class="brand-logo" />
        <p class="brand-chip">UI UX Pro Max</p>
        <h1 class="brand-title">AI Desktop</h1>
        <p class="brand-desc">一体化桌面控制台，统一管理模型、配额、日志与代理配置。</p>
        <div class="brand-badges">
          <span class="badge">本地部署</span>
          <span class="badge">安全同步</span>
          <span class="badge">多模型切换</span>
        </div>
      </section>

      <el-form ref="loginForm" :model="loginObj" :rules="rules" class="form glass-card" @submit.prevent="submit">
        <div class="form-head">
          <p class="form-subtitle">{{ regState ? '创建新账户' : '欢迎回来' }}</p>
          <h2 class="form-title">{{ regState ? '注册账号' : '登录账号' }}</h2>
        </div>

        <div class="field-label">账户</div>
        <el-form-item prop="username" class="input-form-item">
          <el-input v-model="loginObj.username" placeholder="请输入账户" class="custom-input">
            <template #prefix>
              <img src="@/assets/login/email.svg" alt="email" class="prefix-icon" />
            </template>
          </el-input>
        </el-form-item>

        <div class="field-label">密码</div>
        <el-form-item prop="password" class="input-form-item">
          <el-input
            v-model="loginObj.password"
            type="password"
            placeholder="请输入密码"
            show-password
            class="custom-input"
          >
            <template #prefix>
              <img src="@/assets/login/pass.svg" alt="password" class="prefix-icon" />
            </template>
          </el-input>
        </el-form-item>

        <transition name="fade">
          <div v-if="regState" class="reg-container">
            <div class="field-label">确认密码</div>
            <el-form-item prop="affirmPassword" class="input-form-item">
              <el-input
                v-model="loginObj.affirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
                class="custom-input"
              >
                <template #prefix>
                  <img src="@/assets/login/pass.svg" alt="confirm-password" class="prefix-icon" />
                </template>
              </el-input>
            </el-form-item>
          </div>
        </transition>

        <div class="form-row">
          <button v-if="!regState" type="button" class="link-btn">忘记密码?</button>
          <span class="hint">{{ actionTip }}</span>
        </div>

        <el-button type="primary" class="button-submit" @click="submit">{{ submitText }}</el-button>

        <div class="switch-container">
          <p class="switch-text">
            {{ regState ? '已有账户?' : '没有账户?' }}
            <button type="button" class="switch-btn" @click="toggleRegisterState">
              {{ regState ? '返回登录' : '立即注册' }}
            </button>
          </p>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
const regState = ref(false)
const submitLoading = ref(false)
const changeRegLoading = ref(false)
const loginForm = ref(null)

const loginObj = reactive({
  username: '',
  password: '',
  affirmPassword: ''
})

const submitText = computed(() => (regState.value ? '注 册' : '登 录'))
const actionTip = computed(() => (regState.value ? '设置一个安全的登录密码' : '使用账户密码进入控制台'))

const rules = reactive({
  username: [{ required: true, message: '账户不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
  affirmPassword: [
    {
      validator: (_, value, callback) => {
        if (!regState.value) {
          callback()
          return
        }
        if (value === '') {
          callback(new Error('确认密码不能为空'))
          return
        }
        if (value !== loginObj.password) {
          callback(new Error('两次密码输入不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
})

const resetForm = () => {
  loginObj.username = ''
  loginObj.password = ''
  loginObj.affirmPassword = ''
}

const toggleRegisterState = () => {
  changeRegLoading.value = true
  setTimeout(() => {
    regState.value = !regState.value
    resetForm()
    loginForm.value?.clearValidate()
    changeRegLoading.value = false
  }, 240)
}

const submit = () => {
  if (!loginForm.value) return
  loginForm.value.validate((valid) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      const screenWidth = window.screen.width
      const screenHeight = window.screen.height
      window.ipcRenderer.send('toMain', {
        username: loginObj.username,
        token: '',
        screenWidth,
        screenHeight
      })
      submitLoading.value = false
    }, 520)
  })
}
</script>

<style lang="scss" scoped>
.drag-region {
  position: absolute;
  inset: 0 0 auto;
  z-index: 30;
  width: 100%;
  height: 40px;
  -webkit-app-region: drag;
}

.login-main {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  padding: 30px;
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(330px, 420px);
  gap: 18px;
  align-items: stretch;
  width: min(920px, 100%);
  min-height: 560px;
  max-height: calc(100vh - 90px);
  -webkit-app-region: no-drag;
}

.login-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
  min-width: 0;
  padding: 30px 24px;
  overflow: hidden;
  color: #f8fafc;
  background: radial-gradient(circle at 14% 12%, rgb(255 255 255 / 24%) 0%, transparent 32%),
    radial-gradient(circle at 84% 86%, rgb(12 74 110 / 50%) 0%, transparent 44%),
    linear-gradient(160deg, #f97316 0%, #f59e0b 42%, #0ea5e9 100%);
  border-radius: 24px;
  box-shadow: 0 22px 34px -20px rgb(15 23 42 / 52%);
  animation: orbit 6s ease-in-out infinite alternate;

  .brand-logo {
    width: 40px;
    height: 40px;
    filter: drop-shadow(0 8px 14px rgb(15 23 42 / 35%));
  }

  .brand-chip {
    align-self: flex-start;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.4px;
    background: rgb(15 23 42 / 28%);
    border: 1px solid rgb(255 255 255 / 28%);
    border-radius: 999px;
  }

  .brand-title {
    font-size: 34px;
    font-weight: 700;
    letter-spacing: 0.4px;
  }

  .brand-desc {
    max-width: 280px;
    font-size: 14px;
    line-height: 1.5;
    color: rgb(248 250 252 / 92%);
  }

  .brand-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .badge {
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: rgb(15 23 42 / 26%);
    border: 1px solid rgb(255 255 255 / 24%);
    border-radius: 999px;
  }
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 32px 28px 22px;
  border-radius: 24px;
  -webkit-app-region: no-drag;
}

.form-head {
  margin-bottom: 18px;
}

.form-subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.form-title {
  margin-top: 4px;
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.field-label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 0.2px;
}

.input-form-item {
  margin-bottom: 14px;
}

.prefix-icon {
  width: 18px;
  height: 18px;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  margin-top: 2px;
}

.link-btn {
  font-size: 12px;
  color: var(--color-text-link);
  cursor: pointer;
  background: transparent;
  border: none;
}

.hint {
  font-size: 12px;
  color: var(--color-text-muted);
}

.button-submit {
  width: 100%;
  height: 46px;
  margin-top: 14px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.6px;
  background: linear-gradient(
    96deg,
    color-mix(in srgb, var(--brand-accent), white 6%) 0%,
    color-mix(in srgb, var(--brand-accent-alt), black 8%) 100%
  );
  border: none;
  border-radius: 12px;
  box-shadow: 0 14px 24px -18px color-mix(in srgb, var(--brand-accent), black 8%);
}

.switch-container {
  margin-top: 16px;
  text-align: center;
}

.switch-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.switch-btn {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-link);
  cursor: pointer;
  background: transparent;
  border: none;
}

:deep(.el-input__wrapper) {
  height: 42px;
  padding-inline: 10px;
  background: color-mix(in srgb, var(--color-bg-input), transparent 15%);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 28%);
  border-radius: 12px;
  box-shadow: none;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: color-mix(in srgb, var(--brand-accent), transparent 36%);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-accent), transparent 80%);
}

:deep(.el-input__inner) {
  color: var(--color-text-primary);
}

:deep(.el-form-item__error) {
  font-size: 12px;
}

:deep(.el-loading-mask) {
  border-radius: 24px;
}

@media (width <= 900px) {
  .login-main {
    padding: 16px;
  }

  .login-shell {
    grid-template-columns: minmax(280px, 450px);
    min-height: auto;
  }

  .login-brand {
    display: none;
  }
}
</style>
