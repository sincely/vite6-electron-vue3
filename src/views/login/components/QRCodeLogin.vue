<template>
  <div class="qrcode-login-container">
    <!-- <div class="title">使用钉钉扫码登录</div> -->
    <div class="qrcode-wrapper">
      <div class="canvas-box">
        <canvas id="myCanvas" ref="qrCanvas"></canvas>

        <!-- Status Overlays -->
        <transition name="fade">
          <div
            v-if="qrCodeStatus !== 'waiting' && qrCodeStatus !== 'scanned'"
            class="status-overlay"
          >
            <div class="status-content">
              <svg-icon
                v-if="qrCodeStatus === 'confirmed'"
                icon-class="success"
                width="48px"
                height="48px"
                class="status-icon success"
              />
              <svg-icon
                v-else-if="qrCodeStatus === 'expired'"
                icon-class="fail"
                width="48px"
                height="48px"
                class="status-icon fail"
              />
              <svg-icon
                v-else-if="qrCodeStatus === 'cancelled'"
                icon-class="cancelled"
                width="48px"
                height="48px"
                class="status-icon fail"
              />

              <p class="status-text">
                {{ statusText }}
              </p>

              <button
                v-if="['expired', 'cancelled'].includes(qrCodeStatus)"
                class="refresh-btn"
                @click="onRefresh"
              >
                点击刷新
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <p class="helper-text">
      请使用
      <span class="highlight">钉钉 APP</span>
      扫码登录
    </p>
  </div>
</template>

<script setup>
import QRCode from 'qrcode'

const referralCode = ref('sadasq2e1q2ee3232332')
const qrCanvas = ref(null)

const qrCodeStatus = ref('waiting')
let pollInterval = null
let lastStatus = null

const qrCodeStatusMap = {
  WAITING: 'waiting',
  SCANNED: 'scanned',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
}

const statusText = computed(() => {
  const map = {
    confirmed: '登录成功',
    expired: '二维码已失效',
    cancelled: '已取消登录',
    scanned: '已扫描，请确认'
  }
  return map[qrCodeStatus.value] || ''
})

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

onMounted(() => {
  fetchQrCode()
})

const fetchQrCode = async () => {
  try {
    await generateQrCode(referralCode.value)
    qrCodeStatus.value = qrCodeStatusMap.WAITING
    lastStatus = null
    pollQrCodeStatus()
  } catch (error) {
    console.error('获取二维码失败', error)
  }
}

const generateQrCode = (code) => {
  return new Promise((resolve, reject) => {
    QRCode.toCanvas(
      qrCanvas.value,
      code,
      {
        width: 160,
        margin: 0,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      },
      (error) => {
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      }
    )
  })
}

const pollQrCodeStatus = () => {
  stopPolling()
  if (qrCodeStatus.value !== qrCodeStatusMap.WAITING) return

  pollInterval = setInterval(async () => {
    // 模拟轮询逻辑
    // console.log('Polling status...')
  }, 3000)
}

const onRefresh = () => {
  qrCodeStatus.value = 'waiting'
  lastStatus = null
  fetchQrCode()
}

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style lang="scss" scoped>
.qrcode-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  animation: fade-up 0.4s ease-out;
}

.title {
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.qrcode-wrapper {
  position: relative;
  padding: 10px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.canvas-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160px;
  height: 160px;
  overflow: hidden;
  border-radius: 8px;
}

.status-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(4px);
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-text {
  margin: 12px 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.status-icon {
  &.success {
    color: var(--color-success);
  }

  &.fail {
    color: var(--color-danger);
  }
}

.refresh-btn {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  background: var(--brand-accent-soft);
  border: 1px solid transparent;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary), transparent 85%);
  }
}

.helper-text {
  font-size: 13px;
  color: var(--color-text-muted);

  .highlight {
    font-weight: 600;
    color: var(--color-primary);
  }
}

// Animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
