<template>
  <div class="content-container">
    <div class="title">使用钉钉扫码登录</div>
    <div class="qrcode-container">
      <div class="canvas-container">
        <canvas id="myCanvas" ref="qrCanvas"></canvas>
      </div>

      <svg-icon
        v-if="qrCodeStatus === 'confirmed'"
        icon-class="success"
        width="80px"
        height="80px"
        class="success-icon"
      />
      <svg-icon
        v-else-if="qrCodeStatus === 'expired'"
        icon-class="fail"
        width="80px"
        height="80px"
        class="fail-icon"
      />
      <svg-icon
        v-else-if="qrCodeStatus === 'cancelled'"
        icon-class="cancelled"
        width="80px"
        height="80px"
        class="fail-icon"
      />
      <!-- 当二维码失效或用户取消时，使用蒙层覆盖 -->
      <div
        v-if="qrCodeStatus === 'expired' || qrCodeStatus === 'cancelled'"
        class="overlay"
      ></div>
      <h4 v-if="qrCodeStatus === 'expired'" class="expired">二维码失效</h4>
      <h4 v-if="qrCodeStatus === 'cancelled'" class="expired">已取消登录</h4>
      <h4
        v-if="qrCodeStatus === 'expired' || qrCodeStatus === 'cancelled'"
        class="refresh"
        @click="onRefresh"
      >
        点击刷新
      </h4>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
// message 不是一个Vue组件，而是一个函数，因此无法通过 unplugin-vue-components 自动按需引入。
// 需要手动引入,不引入的话，ReferenceError: message is not defined
import QRCode from 'qrcode'
const referralCode = ref('sadasq2e1q2ee3232332')
const qrCanvas = ref(null)

const qrCodeStatus = ref('waiting') // 初始状态
let pollInterval = null // 轮询定时器
let lastStatus = null // 记录上一次状态，避免重复提示
// 二维码状态
const qrCodeStatusMap = {
  WAITING: 'waiting', // 等待扫描
  SCANNED: 'scanned', // 已扫描
  CONFIRMED: 'confirmed', // 已确认
  CANCELLED: 'cancelled', // 已取消
  EXPIRED: 'expired' // 已过期
}

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
    // const response = await getQrCode()
    // const { code, data } = response
    // console.log('response', response)
    // if (code === 200) {
    //   referralCode.value = data
    //   await generateQrCode(referralCode.value)
    //   qrCodeStatus.value = qrCodeStatusMap.WAITING
    //   lastStatus = null
    //   pollQrCodeStatus()
    // } else if (code === 401) {
    //   message.error('登录已过期，请重新登录')
    // } else {
    //   message.error('获取二维码失败，请重试')
    // }
    await generateQrCode(referralCode.value)
    // 生成二维码后，设置状态为等待扫描
    qrCodeStatus.value = qrCodeStatusMap.WAITING
    // 重置上一次状态，避免重复提示
    lastStatus = null
    // 开始轮询检查二维码状态
    pollQrCodeStatus()
  } catch (error) {
    message.error('获取二维码失败，请重试')
  }
}

// 生成二维码
const generateQrCode = (code) => {
  return new Promise((resolve, reject) => {
    QRCode.toCanvas(
      qrCanvas.value,
      code,
      {
        width: 220,
        margin: 0,
        errorCorrectionLevel: 'H'
      },
      (error) => {
        if (error) {
          console.error(error)
          reject(error)
        } else {
          console.log('QR code generated successfully.')
          resolve()
        }
      }
    )
  })
}

// 轮询检查二维码状态
const pollQrCodeStatus = () => {
  // 只在 waiting 状态启动轮询
  stopPolling()
  if (qrCodeStatus.value !== qrCodeStatusMap.WAITING) return

  pollInterval = setInterval(async () => {
    try {
      // const statusResponse = await checkQrCodeStatus(referralCode.value)
      // console.log(statusResponse)
      // if (statusResponse.code === 200) {
      //   const nextStatus = statusResponse.data.code

      //   if (lastStatus === nextStatus) {
      //     return
      //   }
      //   lastStatus = nextStatus
      //   qrCodeStatus.value = nextStatus

      //   if (nextStatus === qrCodeStatusMap.CONFIRMED) {
      //     const idToken = statusResponse.data.token
      //     console.log('idToken', idToken)
      //     message.success('登录成功，正在跳转...')
      //     stopPolling()
      //     // stopPolling()
      //     // 处理登录成功逻辑
      //   } else if (nextStatus === qrCodeStatusMap.CANCELLED) {
      //     console.log('用户已取消，请刷新二维码重试')
      //     stopPolling()
      //   } else if (nextStatus === qrCodeStatusMap.EXPIRED) {
      //     console.log('二维码已过期，请刷新页面重试')
      //     stopPolling()
      //   } else if (nextStatus === qrCodeStatusMap.SCANNED) {
      //     console.log('二维码已扫描，请在钉钉中确认登录')
      //   }
      // }
      console.log(1111111111111)
    } catch (error) {
      console.error('检查二维码状态失败', error)
    }
  }, 6000) // 每6秒检查一次1
}

const onRefresh = () => {
  // 重置状态并重新获取二维码
  qrCodeStatus.value = 'waiting'
  lastStatus = null
  fetchQrCode()
}

onBeforeUnmount(() => {
  // 清除轮询定时器
  stopPolling()
})
</script>

<style lang="scss" scoped>
.canvas-container {
  padding: 10px;
  background: rgb(255 255 255 / 90%);
  backdrop-filter: blur(4px);
  border: 1px solid rgb(255 255 255 / 13.5%);
  border-radius: 6px;
  box-shadow: 0 8px 32px rgb(0 0 0 / 15%);
}

.content-container {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
}

.logo {
  width: 48px;
  height: 48px;
  margin-bottom: 10px;
}

.qrcode-container {
  position: relative;
  display: inline-block;
  padding: 10px;
  margin: 18px 0;
  background: white;
  transition: all 0.3s ease;
}

.success-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.fail-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
}

.expired {
  position: absolute;
  top: 70%;
  left: 50%;
  z-index: 2;
  font-weight: bold;
  color: #050505;
  cursor: pointer;
  transform: translateX(-50%);
}

.refresh {
  position: absolute;
  top: 80%;
  left: 50%;
  z-index: 2;
  color: #050505;
  cursor: pointer;
  transform: translateX(-50%);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  background-color: rgb(255 255 255 / 80%);
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}
</style>
