<template>
  <AuthLayout>
    <div class="forgot-password">
      <AuthTitle>
        {{ stepTitle }}
        <template #desc>{{ stepDesc }}</template>
      </AuthTitle>

      <!-- 步骤指示器 -->
      <div v-if="currentStep < 2" class="step-indicator">
        <div
          v-for="(step, index) in steps"
          :key="step.label"
          class="step-node"
          :class="{
            active: currentStep === index,
            done: currentStep > index
          }"
        >
          <div class="step-circle">
            <svg-icon
              v-if="currentStep > index"
              icon-class="check"
              width="14px"
              height="14px"
            />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
          <div
            v-if="index < steps.length - 1"
            class="step-line"
            :class="{ filled: currentStep > index }"
          ></div>
        </div>
      </div>

      <transition name="fade-slide" mode="out-in">
        <!-- Step 0: 验证身份 -->
        <div v-if="currentStep === 0" key="verify" class="step-content">
          <el-form
            ref="verifyFormRef"
            :model="verifyForm"
            :rules="verifyRules"
            class="login-form"
            label-position="top"
            hide-required-asterisk
            @submit.prevent
          >
            <el-form-item prop="phone" label="手机号码">
              <el-input
                v-model="verifyForm.phone"
                placeholder="请输入手机号码"
                :prefix-icon="Iphone"
                class="custom-input"
                maxlength="11"
              />
            </el-form-item>

            <el-form-item prop="code" label="验证码">
              <div class="code-input-group">
                <el-input
                  v-model="verifyForm.code"
                  placeholder="请输入验证码"
                  :prefix-icon="Key"
                  class="custom-input code-input"
                  maxlength="6"
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

            <el-form-item class="submit-item">
              <el-button
                type="primary"
                class="submit-btn"
                :loading="loading"
                @click="nextStep"
              >
                {{ loading ? '验证中...' : '下一步' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 1: 设置新密码 -->
        <div v-else-if="currentStep === 1" key="reset" class="step-content">
          <el-form
            ref="resetFormRef"
            :model="resetForm"
            :rules="resetRules"
            class="login-form"
            label-position="top"
            hide-required-asterisk
            @submit.prevent
          >
            <el-form-item prop="password" label="新密码">
              <el-input
                v-model="resetForm.password"
                placeholder="请输入新密码"
                :type="showPassword ? 'text' : 'password'"
                :prefix-icon="Lock"
                class="custom-input"
              >
                <template #suffix>
                  <span
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                  >
                    <svg-icon
                      :icon-class="showPassword ? 'open-eye' : 'close-eye'"
                      width="16px"
                      height="16px"
                    />
                  </span>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword" label="确认密码">
              <el-input
                v-model="resetForm.confirmPassword"
                placeholder="请再次输入新密码"
                :type="showConfirm ? 'text' : 'password'"
                :prefix-icon="Lock"
                class="custom-input"
              >
                <template #suffix>
                  <span
                    class="password-toggle"
                    @click="showConfirm = !showConfirm"
                  >
                    <svg-icon
                      :icon-class="showConfirm ? 'open-eye' : 'close-eye'"
                      width="16px"
                      height="16px"
                    />
                  </span>
                </template>
              </el-input>
            </el-form-item>

            <!-- 密码强度指示器 -->
            <div class="password-strength">
              <div class="strength-bars">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="strength-bar"
                  :class="{ filled: passwordStrength >= i }"
                ></div>
              </div>
              <span class="strength-text">{{ strengthLabel }}</span>
            </div>

            <el-form-item class="submit-item">
              <el-button
                type="primary"
                class="submit-btn"
                :loading="loading"
                @click="submitReset"
              >
                {{ loading ? '提交中...' : '确认重置' }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Step 2: 完成 -->
        <div v-else key="success" class="step-content success-content">
          <div class="success-icon">
            <svg-icon icon-class="success" width="62px" height="62px" />
          </div>
          <h2 class="success-title">密码重置成功</h2>
          <p class="success-desc">请使用新密码重新登录</p>
          <el-button type="primary" class="submit-btn" @click="goLogin">
            返回登录
          </el-button>
        </div>
      </transition>

      <!-- 返回链接 -->
      <div v-if="currentStep < 2" class="back-row">
        <span class="back-link" @click="goLogin">← 返回登录</span>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup>
import { Iphone, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import AuthLayout from './components/AuthLayout.vue'
import AuthTitle from './components/AuthTitle.vue'

defineOptions({ name: 'ForgotPassword' })

const router = useRouter()

const currentStep = ref(0)
const loading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

const steps = [{ label: '验证身份' }, { label: '设置密码' }, { label: '完成' }]

const stepTitle = computed(() => {
  const map = {
    0: '忘记密码? 🤦🏻‍♂️',
    1: '设置新密码',
    2: '密码重置成功'
  }
  return map[currentStep.value]
})

const stepDesc = computed(() => {
  const map = {
    0: '输入您的手机号码，我们将向您发送重置密码的验证码',
    1: '请为您的账户设置一个新密码',
    2: '您的密码已成功重置'
  }
  return map[currentStep.value]
})

// ─── Step 0: 验证身份 ─────────────────────────────
const verifyFormRef = ref()
const counting = ref(false)
const countdown = ref(60)
let timer = null

const verifyForm = reactive({
  phone: '',
  code: ''
})

const verifyRules = reactive({
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' }
  ]
})

const isPhoneValid = computed(() => /^1[3-9]\d{9}$/.test(verifyForm.phone))

const sendCode = () => {
  if (!isPhoneValid.value) {
    ElMessage.warning('请输入有效的手机号码')
    return
  }
  counting.value = true
  countdown.value = 60
  ElMessage.success('验证码已发送，请查收短信')
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      counting.value = false
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

const nextStep = async () => {
  if (!verifyFormRef.value) return
  await verifyFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟验证码校验
      setTimeout(() => {
        loading.value = false
        currentStep.value = 1
      }, 800)
    }
  })
}

// ─── Step 1: 设置新密码 ─────────────────────────────
const resetFormRef = ref()

const resetForm = reactive({
  password: '',
  confirmPassword: ''
})

const validateConfirm = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== resetForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetRules = reactive({
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' }
  ],
  confirmPassword: [{ validator: validateConfirm, trigger: 'blur' }]
})

// 密码强度
const passwordStrength = computed(() => {
  const pwd = resetForm.password
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 6) strength += 1
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1
  if (/\d/.test(pwd)) strength += 1
  if (/[^a-zA-Z\d]/.test(pwd)) strength += 1
  return strength
})

const strengthLabel = computed(() => {
  const labels = ['', '弱', '中', '强', '很强']
  return labels[passwordStrength.value] || ''
})

const submitReset = async () => {
  if (!resetFormRef.value) return
  await resetFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟重置密码请求
      setTimeout(() => {
        loading.value = false
        currentStep.value = 2
        ElMessage.success('密码重置成功')
      }, 800)
    }
  })
}

// ─── 导航 ──────────────────────────────────────────
const goLogin = () => {
  router.push('/login')
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.forgot-password {
  width: 100%;
  animation: fade-up 0.4s ease-out;
}

// ─── 步骤指示器 ─────────────────────────────────────
.step-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 24px;

  .step-node {
    display: flex;
    flex: 1;
    align-items: center;

    &:last-child {
      flex: 0;
    }

    .step-circle {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-right: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-muted);
      background: var(--color-bg-hover);
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .step-label {
      flex-shrink: 0;
      font-size: 12px;
      color: var(--color-text-muted);
      transition: color 0.3s ease;
    }

    .step-line {
      flex: 1;
      height: 2px;
      margin: 0 8px;
      background: var(--color-border);
      transition: background 0.3s ease;

      &.filled {
        background: var(--color-primary);
      }
    }

    &.active {
      .step-circle {
        color: #fff;
        background: var(--color-primary);
        box-shadow: 0 0 0 4px
          color-mix(in srgb, var(--color-primary), transparent 75%);
      }

      .step-label {
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    &.done {
      .step-circle {
        color: #fff;
        background: var(--color-primary);
      }

      .step-label {
        color: var(--color-text-secondary);
      }
    }
  }
}

.step-content {
  width: 100%;
}

// ─── 表单样式 ───────────────────────────────────────
.login-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
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

  :deep(.el-input__prefix-inner) {
    margin-right: 8px;
    color: var(--color-text-secondary);
  }
}

// ─── 验证码输入组 ───────────────────────────────────
.code-input-group {
  display: flex;
  gap: 10px;
  width: 100%;

  .code-input {
    flex: 1;
  }

  .code-btn {
    flex-shrink: 0;
    width: 110px;
    height: 42px;
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

// ─── 密码强度 ───────────────────────────────────────
.password-strength {
  display: flex;
  align-items: center;
  margin: -6px 0 18px;

  .strength-bars {
    display: flex;
    gap: 4px;

    .strength-bar {
      width: 36px;
      height: 4px;
      background: var(--color-border);
      border-radius: 2px;
      transition: background 0.3s ease;

      &.filled {
        background: var(--strength-color, var(--color-primary));
      }

      &:nth-child(1).filled {
        --strength-color: #f56c6c;
      }

      &:nth-child(2).filled {
        --strength-color: #e6a23c;
      }

      &:nth-child(3).filled {
        --strength-color: #409eff;
      }

      &:nth-child(4).filled {
        --strength-color: var(--color-success);
      }
    }
  }

  .strength-text {
    margin-left: 8px;
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.submit-item {
  margin-bottom: 0 !important;
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

// ─── 成功页 ─────────────────────────────────────────
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  text-align: center;

  .success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .success-title {
    margin-bottom: 6px;
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .success-desc {
    margin-bottom: 24px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  .submit-btn {
    width: 100%;
  }
}

// ─── 返回链接 ───────────────────────────────────────
.back-row {
  margin-top: 20px;
  text-align: center;

  .back-link {
    font-size: 13px;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--color-primary);
    }
  }
}

// ─── 动画 ───────────────────────────────────────────
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.5);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
