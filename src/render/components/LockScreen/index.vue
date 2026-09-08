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
                <Icon
                  icon="lucide:lock"
                  class="lock-dialog__lock-icon"
                  @click="handleLock"
                />
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

    <!-- 解锁界面（全屏覆盖层）：时钟态 ↔ 密码态，仅由解锁按钮切换 -->
    <div v-if="lockStore.isLock" class="unlock-overlay">
      <!-- 朦胧光晕背景 -->
      <div class="unlock-glow" aria-hidden="true">
        <span class="unlock-glow__orb unlock-glow__orb--a"></span>
        <span class="unlock-glow__orb unlock-glow__orb--b"></span>
        <span class="unlock-glow__orb unlock-glow__orb--c"></span>
        <span class="unlock-glow__orb unlock-glow__orb--d"></span>
        <span class="unlock-glow__veil"></span>
      </div>

      <!-- 顶部解锁入口：点击进入密码视图 -->
      <Transition name="fade">
        <button
          v-if="!showUnlock"
          type="button"
          class="unlock-trigger"
          @click="revealUnlock"
        >
          <Icon icon="lucide:lock" />
          <span>点击解锁</span>
        </button>
      </Transition>

      <div class="unlock-stage">
        <Transition name="view" mode="out-in" appear>
          <!-- 视图一：实时时钟（日期+星期在上，时/分数字卡片居中） -->
          <section
            v-if="!showUnlock"
            key="clock"
            class="clock"
            aria-label="当前日期与时间"
          >
            <!-- 日期：年-月-日 + 星期 -->
            <div class="clock__date">
              <Icon icon="lucide:calendar" class="clock__date-icon" />
              <span class="clock__date-text">{{ dateText }}</span>
              <span class="clock__date-sep" aria-hidden="true"></span>
              <span class="clock__week">{{ weekText }}</span>
            </div>

            <div class="clock__row">
              <template v-for="(group, gi) in timeGroups" :key="group.label">
                <span v-if="gi > 0" class="clock__colon" aria-hidden="true">
                  <i></i>
                  <i></i>
                </span>
                <div class="clock__group">
                  <div class="clock__cards">
                    <div
                      v-for="(digit, di) in group.digits"
                      :key="di"
                      class="digit-card"
                    >
                      <Transition name="digit">
                        <span :key="digit" class="digit-card__num">
                          {{ digit }}
                        </span>
                      </Transition>
                    </div>
                  </div>
                  <span class="clock__unit">{{ group.label }}</span>
                </div>
              </template>
            </div>
          </section>

          <!-- 视图二：只展示解锁密码内容，支持返回时钟 -->
          <div v-else key="unlock" class="unlock-card">
            <img
              v-if="userAvatar && !avatarLoadFailed"
              :src="userAvatar"
              :alt="displayName"
              class="unlock-card__avatar"
              @error="avatarLoadFailed = true"
            />
            <span
              v-else
              class="unlock-card__avatar unlock-card__avatar--fallback"
            >
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
                    <Icon
                      icon="lucide:lock-open"
                      class="unlock-card__unlock-icon"
                      @click="handleUnlock"
                    />
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
              <div class="unlock-card__actions">
                <el-button text @click="hideUnlock">
                  <Icon
                    icon="lucide:corner-down-left"
                    class="unlock-card__back-icon"
                  />
                  返回
                </el-button>
                <span class="unlock-card__divider" aria-hidden="true"></span>
                <el-button text @click="toLogin">返回登录</el-button>
              </div>
            </el-form>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
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

// 两段式解锁：锁定时先展示时钟页（顶部为解锁入口），进入后只展示密码内容
const showUnlock = ref(false)

const revealUnlock = () => {
  if (showUnlock.value) return
  showUnlock.value = true
  // 等 out-in 过渡结束、密码卡片挂载后再聚焦输入框
  setTimeout(() => {
    unlockInputRef.value?.focus()
  }, 300)
}

// 返回时钟视图：清空已输密码
const hideUnlock = () => {
  if (!showUnlock.value) return
  showUnlock.value = false
  unlockForm.password = ''
}

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

// ---------- 实时时钟（数字卡片呈现） ----------
const now = ref(new Date())
let clockTimer = null

const pad2 = (n) => String(n).padStart(2, '0')

// 时 / 分 两组（不展示秒），每组拆成两个数字卡片
const timeGroups = computed(() => [
  { label: '时', digits: pad2(now.value.getHours()).split('') },
  { label: '分', digits: pad2(now.value.getMinutes()).split('') }
])

const dateText = computed(() => {
  const d = now.value
  return `${d.getFullYear()} 年 ${pad2(d.getMonth() + 1)} 月 ${pad2(
    d.getDate()
  )} 日`
})

const WEEK_TEXT = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
]
const weekText = computed(() => WEEK_TEXT[now.value.getDay()])

const stopClock = () => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
}

const startClock = () => {
  stopClock()
  now.value = new Date()
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
}

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

// 监听锁屏状态变化：锁定时启动时钟并等待点击解锁，解锁后停止计时器
watch(
  () => lockStore.isLock,
  (locked) => {
    if (locked) {
      document.body.style.overflow = 'hidden'
      showUnlock.value = false
      startClock()
    } else {
      document.body.style.overflow = ''
      stopClock()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  stopClock()
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
  flex-direction: column;
  padding: 32px 20px;
  overflow-y: auto;
  background-color: var(--color-bg-window);
  background-image: var(--gradient-mesh), var(--app-bg-gradient);
  animation: lock-fade-in 0.3s ease-in-out;
}

// 朦胧光晕背景：多层彩色光斑 + 磨砂罩层，营造柔和雾面极光效果
.unlock-glow {
  position: fixed;
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

// 暗色主题：光晕更明亮通透，罩层压暗以保持对比；数字卡片改为深色玻璃
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

  .digit-card {
    background: linear-gradient(
      180deg,
      rgb(255 255 255 / 10%) 0%,
      rgb(255 255 255 / 4%) 100%
    );
    border-color: rgb(255 255 255 / 10%);
    box-shadow:
      var(--shadow-lg),
      inset 0 1px 0 rgb(255 255 255 / 8%);

    // 翻页钟中缝提亮为微弱白线
    &::after {
      background: rgb(255 255 255 / 7%);
    }
  }
}

// 舞台：时钟 + 解锁卡片纵向居中，窗口过矮时可滚动
.unlock-stage {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
}

// ---------- 实时时钟（数字卡片呈现，居中） ----------
.clock {
  --digit-w: clamp(64px, 7.6vw, 92px);
  --digit-h: clamp(88px, 10.4vw, 124px);
  --digit-fs: clamp(46px, 5.8vw, 68px);

  display: flex;
  flex-direction: column;
  align-items: center;

  &__row {
    display: flex;
    gap: clamp(10px, 1.6vw, 18px);
    align-items: flex-start;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }

  &__cards {
    display: flex;
    gap: clamp(8px, 1.2vw, 14px);
  }

  &__unit {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-indent: 6px; // 抵消最后一个字的字距，保持视觉居中
    letter-spacing: 6px;
  }

  // 时/分之间的冒号，缓慢呼吸提示实时走动
  &__colon {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-self: flex-start;
    justify-content: center;
    height: var(--digit-h);

    i {
      width: 8px;
      height: 8px;
      background: var(--color-primary);
      border-radius: 50%;
      animation: colon-pulse 2s ease-in-out infinite;
    }
  }

  // 日期行：纯文本置顶，不加胶囊容器，避免与数字卡片、触发按钮抢层级
  &__date {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
  }

  &__date-icon {
    font-size: 16px;
    color: var(--color-primary);
  }

  &__date-text {
    font-size: 16px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-secondary);
  }

  &__date-sep {
    width: 1px;
    height: 14px;
    background: var(--color-border);
  }

  &__week {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-primary);
  }
}

// 数字卡片：翻页钟风格，中缝细线 + 玻璃质感
.digit-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--digit-w);
  height: var(--digit-h);
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 92%) 0%,
    rgb(244 247 250 / 86%) 100%
  );
  border: 1px solid rgb(15 23 42 / 6%);
  border-radius: var(--radius-lg);
  box-shadow:
    var(--shadow-lg),
    inset 0 1px 0 rgb(255 255 255 / 80%);

  // 翻页钟中缝
  &::after {
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    height: 1px;
    content: '';
    background: rgb(15 23 42 / 6%);
  }

  &__num {
    position: absolute;
    font-family:
      Inter, 'DIN Alternate', Bahnschrift, 'SF Pro Display', system-ui,
      sans-serif;
    font-size: var(--digit-fs);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--color-text-primary);
  }
}

// 数字切换：新数字自下而上推入，旧数字向上推出（翻页钟韵律）
.digit-enter-active,
.digit-leave-active {
  transition:
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.24s ease;
}

.digit-enter-from {
  opacity: 0;
  transform: translateY(72%);
}

.digit-leave-to {
  opacity: 0;
  transform: translateY(-72%);
}

// 视图切换：时钟与密码卡片交替，out-in 保证同一时刻只存在一个
.view-enter-active {
  transition:
    opacity 0.26s ease,
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}

.view-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.view-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.view-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 顶部解锁入口淡入淡出
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// “点击解锁”触发按钮：顶部居中（避开标题栏拖拽区），玻璃胶囊 + 呼吸微光
.unlock-trigger {
  position: absolute;
  top: calc(var(--titlebar-height) + 16px);
  left: 50%;
  z-index: 1;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 36px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
  background: var(--glass-surface);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-surface-border);
  border-radius: 999px;
  box-shadow: var(--glass-shadow-soft);
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
  transform: translateX(-50%);
  animation: trigger-breathe 2.6s ease-in-out infinite;

  // 标题栏为拖拽区（-webkit-app-region: drag）会吞掉 click 事件，需挖出可点击洞
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  &__icon {
    font-size: 16px;
    color: var(--color-primary);
  }
}

.unlock-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  padding: 32px 32px 20px;

  // background: var(--glass-surface);
  backdrop-filter: blur(24px);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);

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

  &__actions {
    display: flex;
    gap: 14px;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 8px;

    :deep(.el-button) {
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-primary);
        background: transparent;
      }
    }
  }

  &__back-icon {
    margin-right: 4px;
    font-size: 14px;
  }

  &__divider {
    width: 1px;
    height: 12px;
    background: var(--color-border);
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

// 冒号缓慢呼吸
@keyframes colon-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.25;
  }
}

// 触发按钮呼吸微光
@keyframes trigger-breathe {
  0%,
  100% {
    box-shadow: var(--glass-shadow-soft);
  }

  50% {
    box-shadow: var(--shadow-glow-primary);
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

// 无障碍：用户偏好减弱动效时，关闭装饰性动画
@media (prefers-reduced-motion: reduce) {
  .unlock-glow__orb,
  .clock__colon i,
  .unlock-trigger {
    animation: none;
  }

  .digit-enter-active,
  .digit-leave-active,
  .view-enter-active,
  .view-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
