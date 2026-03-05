<template>
  <div class="qrcode-login">
    <h3>手机钉钉扫码登录</h3>
    <div class="qr-code">
      <!-- <img v-if="qrCodeStatus === 'valid'" src="@/assets/qrcode-placeholder.png" alt="QR Code" /> -->
      <div v-if="qrCodeStatus === 'loading'" class="loading-spinner"></div>
      <div v-if="qrCodeStatus === 'expired'" class="qr-code-cover">
        <p>二维码已失效</p>
        <button @click="refreshQRCode">点击刷新</button>
      </div>
    </div>
    <label>
      <input type="checkbox" />
      自动登录
    </label>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const qrCodeStatus = ref('loading') // loading, valid, expired
let timer = null

const generateQRCode = () => {
  qrCodeStatus.value = 'loading'
  // Simulate fetching a new QR code
  setTimeout(() => {
    qrCodeStatus.value = 'valid'
    // QR code expires after 10 seconds
    timer = setTimeout(() => {
      qrCodeStatus.value = 'expired'
    }, 10000)
  }, 1000)
}

const refreshQRCode = () => {
  clearTimeout(timer)
  generateQRCode()
}

onMounted(() => {
  generateQRCode()
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
.qrcode-login {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;

  h3 {
    font-size: 18px;
  }

  .qr-code {
    position: relative;

    img {
      width: 200px;
      height: 200px;
    }

    .qr-code-cover {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: white;
      background-color: rgb(0 0 0 / 70%);
      opacity: 0;
      transition: opacity 0.3s ease;

      p {
        margin: 0;
      }

      button {
        padding: 5px 10px;
        margin-top: 10px;
        color: white;
        cursor: pointer;
        background: var(--color-primary);
        border: none;
        border-radius: 5px;
      }
    }

    &:hover .qr-code-cover {
      opacity: 1;
    }
  }
}
</style>
