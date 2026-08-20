<template>
  <AuthLayout>
    <transition name="fade-slide" mode="out-in">
      <component :is="activeComponent" :key="activeView" @switch="switchView" />
    </transition>
  </AuthLayout>
</template>

<script setup>
import AuthLayout from './components/AuthLayout.vue'
import AccountLogin from './components/AccountLogin.vue'
import CodeLogin from './components/CodeLogin.vue'
import RegisterForm from './components/RegisterForm.vue'

// 扫码登录为次要功能，异步加载避免 qrcode 库进入登录首屏
const QRCodeLogin = defineAsyncComponent(
  () => import('./components/QRCodeLogin.vue')
)

// vben 认证页子视图：账号登录 | 验证码登录 | 扫码登录 | 注册
const activeView = ref('account')

const activeComponent = computed(() => {
  const map = {
    account: AccountLogin,
    code: CodeLogin,
    qrcode: QRCodeLogin,
    register: RegisterForm
  }
  return map[activeView.value] || AccountLogin
})

const switchView = (view) => {
  activeView.value = view
}
</script>

<style lang="scss" scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
