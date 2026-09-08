<!-- 锁屏（参照 art-design-pro 的锁屏功能） -->
<template>
  <div class="lock-screen">
    <!-- 设置锁屏密码弹窗 -->
    <el-dialog
      v-model="lockStore.dialogVisible"
      class="lock-dialog"
      width="370"
      :show-close="true"
      @open="handleDialogOpen"
    >
      <div class="lock-dialog__content">
        <img
          v-if="userAvatar && !avatarLoadFailed"
          :src="userAvatar"
          :alt="displayName"
          class="lock-dialog__avatar"
          @error="avatarLoadFailed = true"
        />
        <span v-else class="lock-dialog__avatar lock-dialog__avatar--fallback">
          {{ userInitial }}
        </span>
        <div class="lock-dialog__name">{{ displayName }}</div>
        <el-form
          ref="lockFormRef"
          :model="lockForm"
          :rules="rules"
          class="lock-dialog__form"
          @submit.prevent="handleLock"
        >
          <el-form-item prop="password">
            <el-input
              ref="lockInputRef"
              v-model="lockForm.password"
              type="password"
              placeholder="请输入锁屏密码"
              :show-password="true"
              autocomplete="new-password"
              @keyup.enter="handleLock"
            >
              <template #suffix>
                <el-icon class="lock-dialog__lock-icon" @click="handleLock">
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-button
            type="primary"
            class="lock-dialog__btn"
            @click="handleLock"
          >
            锁定
          </el-button>
        </el-form>
      </div>
    </el-dialog>

    <!-- 解锁界面（全屏覆盖层） -->
    <div v-if="lockStore.isLock" class="unlock-overlay">
      <!-- 朦胧光晕背景 -->
      <div class="unlock-glow" aria-hidden="true">
        <span class="unlock-glow__orb unlock-glow__orb--a"></span>
        <span class="unlock-glow__orb unlock-glow__orb--b"></span>
        <span class="unlock-glow__orb unlock-glow__orb--c"></span>
        <span class="unlock-glow__orb unlock-glow__orb--d"></span>
        <span class="unlock-glow__veil"></span>
      </div>
      <div class="unlock-card">
        <div class="unlock-card__badge">
          <el-icon><Lock /></el-icon>
        </div>
        <img
          v-if="userAvatar && !avatarLoadFailed"
          :src="userAvatar"
          :alt="displayName"
          class="unlock-card__avatar"
          @error="avatarLoadFailed = true"
        />
        <span v-else class="unlock-card__avatar unlock-card__avatar--fallback">
          {{ userInitial }}
        </span>
        <div class="unlock-card__name">{{ displayName }}</div>
        <div class="unlock-card__tip">屏幕已锁定，请输入密码解锁</div>
        <el-form
          ref="unlockFormRef"
          :model="unlockForm"
          :rules="rules"
          class="unlock-card__form"
          @submit.prevent="handleUnlock"
        >
          <el-form-item prop="password">
            <el-input
              ref="unlockInputRef"
              v-model="unlockForm.password"
              :class="{ 'shake-animation': shaking }"
              type="password"
              placeholder="请输入解锁密码"
              :show-password="true"
              autocomplete="new-password"
              @keyup.enter="handleUnlock"
            >
              <template #suffix>
                <el-icon class="unlock-card__unlock-icon" @click="handleUnlock">
                  <Unlock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-button
            type="primary"
            class="unlock-card__btn"
            @click="handleUnlock"
          >
            解锁
          </el-button>
          <div class="unlock-card__back">
            <el-button text @click="toLogin">返回登录</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Lock, Unlock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// 仅引入 AES 相关模块，避免整包 crypto-js 拖慢首屏
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import { useLockStore } from '@/store/modules/lock'
import { useUserStore } from '@/store/modules/user'

const ENCRYPT_KEY = import.meta.env.VITE_LOCK_ENCRYPT_KEY

const lockStore = useLockStore()
const userStore = useUserStore()
const router = useRouter()

// 输入框引用
const lockInputRef = ref(null)
const unlockInputRef = ref(null)

// 表单引用与数据
const lockFormRef = ref()
const unlockFormRef = ref()
const lockForm = reactive({ password: '' })
const unlockForm = reactive({ password: '' })
const shaking = ref(false)

// 表单验证规则
const rules = {
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 用户信息展示（与 UserDropdown 保持一致）
const avatarLoadFailed = ref(false)
const displayName = computed(
  () =>
    userStore.userInfo?.nickname ||
    userStore.userInfo?.name ||
    userStore.userInfo?.username ||
    'Admin'
)
const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())
const userAvatar = computed(() => userStore.userInfo?.avatar || '')

// 校验解锁密码：解密存储的密文与输入比对
const verifyPassword = (inputPassword, storedPassword) => {
  try {
    const decryptedPassword = AES.decrypt(storedPassword, ENCRYPT_KEY).toString(
      Utf8
    )
    return inputPassword === decryptedPassword
  } catch (error) {
    console.error('密码解密失败:', error)
    return false
  }
}

const handleDialogOpen = () => {
  setTimeout(() => {
    lockInputRef.value?.focus()
  }, 100)
}

// 锁定：加密密码并进入锁屏状态
const handleLock = async () => {
  if (!lockFormRef.value) return

  await lockFormRef.value.validate((valid) => {
    if (valid) {
      const encryptedPassword = AES.encrypt(
        lockForm.password,
        ENCRYPT_KEY
      ).toString()
      lockStore.setLockStatus(true)
      lockStore.setLockPassword(encryptedPassword)
      lockStore.closeLockDialog()
      lockForm.password = ''
    }
  })
}

// 解锁：校验密码
const handleUnlock = async () => {
  if (!unlockFormRef.value) return

  await unlockFormRef.value.validate((valid) => {
    if (valid) {
      const isValid = verifyPassword(
        unlockForm.password,
        lockStore.lockPassword
      )

      if (isValid) {
        lockStore.resetLock()
        unlockForm.password = ''
      } else {
        // 触发抖动动画
        shaking.value = true
        setTimeout(() => {
          shaking.value = false
        }, 500)
        ElMessage.error({ message: '密码错误', zIndex: 4000 })
        unlockForm.password = ''
      }
    }
  })
}

// 返回登录：退出登录并重置锁屏状态
const toLogin = async () => {
  try {
    await userStore.logoutAction().catch(() => {})
    lockStore.resetLock()
    unlockForm.password = ''
    router.push('/login').catch(() => {})
    window.ipcRenderer?.send('logout')
  } catch {
    // 用户取消退出
  }
}

// 监听锁屏状态变化
watch(
  () => lockStore.isLock,
  (locked) => {
    if (locked) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => {
        unlockInputRef.value?.focus()
      }, 100)
    } else {
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style lang="scss" scoped>
.lock-screen :deep(.lock-dialog.el-dialog) {
  border-radius: var(--radius-lg);
}

.lock-dialog {
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0 4px;
  }

  &__avatar {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border: 2px solid var(--color-border);
    border-radius: 50%;

    &--fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      background: var(--color-primary);
    }
  }

  &__name {
    margin: 14px 0 6px;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__form {
    width: 90%;
    margin-top: 12px;
  }

  &__lock-icon {
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__btn {
    width: 100%;
  }
}

// 解锁覆盖层：玻璃拟态风格，复用主题 CSS 变量，明暗主题自适应
.unlock-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--color-bg-window);
  background-image: var(--gradient-mesh), var(--app-bg-gradient);
  animation: lock-fade-in 0.3s ease-in-out;
}

// 朦胧光晕背景：多层彩色光斑 + 磨砂罩层，营造柔和雾面极光效果
.unlock-glow {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;

  &__orb {
    position: absolute;
    filter: blur(80px);
    border-radius: 50%;
    opacity: 0.5;
    will-change: transform;

    &--a {
      top: -18%;
      left: -12%;
      width: 60vmin;
      height: 60vmin;
      background: rgb(59 130 246 / 70%);
      animation: lock-orb-drift-a 16s ease-in-out infinite alternate;
    }

    &--b {
      right: -14%;
      bottom: -20%;
      width: 64vmin;
      height: 64vmin;
      background: rgb(124 58 237 / 60%);
      animation: lock-orb-drift-b 20s ease-in-out infinite alternate;
    }

    &--c {
      top: 24%;
      left: 54%;
      width: 46vmin;
      height: 46vmin;
      background: rgb(6 182 212 / 45%);
      animation: lock-orb-drift-a 24s ease-in-out -8s infinite alternate;
    }

    &--d {
      bottom: 10%;
      left: 12%;
      width: 40vmin;
      height: 40vmin;
      background: rgb(236 72 153 / 35%);
      animation: lock-orb-drift-b 18s ease-in-out -12s infinite alternate;
    }
  }

  // 磨砂罩层：进一步柔化光斑，形成朦胧雾面感
  &__veil {
    position: absolute;
    inset: 0;
    background: rgb(255 255 255 / 30%);
    backdrop-filter: blur(52px);
  }
}

// 暗色主题：光晕更明亮通透，罩层压暗以保持对比
html[data-theme='dark'],
html.dark {
  .unlock-glow {
    &__orb {
      opacity: 0.68;

      &--a {
        background: rgb(96 165 250 / 75%);
      }

      &--b {
        background: rgb(167 139 250 / 68%);
      }

      &--c {
        background: rgb(34 211 238 / 55%);
      }

      &--d {
        background: rgb(244 114 182 / 45%);
      }
    }

    &__veil {
      background: rgb(11 12 15 / 40%);
    }
  }
}

.unlock-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 340px;
  padding: 36px 32px 24px;
  background: var(--glass-surface);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);

  &__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-bottom: 18px;
    font-size: 20px;
    color: #fff;
    background: var(--gradient-primary);
    border-radius: 14px;
    box-shadow: var(--shadow-lg);
  }

  &__avatar {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border: 2px solid var(--color-border);
    border-radius: 50%;

    &--fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      background: var(--color-primary);
    }
  }

  &__name {
    margin-top: 14px;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__tip {
    margin: 6px 0 18px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__form {
    width: 100%;
  }

  &__unlock-icon {
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__btn {
    width: 100%;
    margin-top: 2px;
  }

  &__back {
    width: 100%;
    margin-top: 8px;
    text-align: center;

    :deep(.el-button) {
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-primary);
        background: transparent;
      }
    }
  }
}

@keyframes lock-fade-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

// 光斑缓慢漂浮，形成流动的极光感
@keyframes lock-orb-drift-a {
  from {
    transform: translate(0, 0) scale(1);
  }

  to {
    transform: translate(7vmin, 5vmin) scale(1.18);
  }
}

@keyframes lock-orb-drift-b {
  from {
    transform: translate(0, 0) scale(1.1);
  }

  to {
    transform: translate(-6vmin, -5vmin) scale(0.94);
  }
}

@keyframes lock-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}

.shake-animation {
  animation: lock-shake 0.5s ease-in-out;
}
</style>
