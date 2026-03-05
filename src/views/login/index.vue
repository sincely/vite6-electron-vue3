<template>
  <div class="login-page">
    <CustomTitleBar @update:active-tab="updateActiveTab" />
    <div class="login-body">
      <transition name="fade" mode="out-in">
        <component :is="activeTabComponent" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CustomTitleBar from './components/CustomTitleBar.vue'
import AccountLogin from './components/AccountLogin.vue'
import QRCodeLogin from './components/QRCodeLogin.vue'

const activeTab = ref('account')

const activeTabComponent = computed(() => {
  return activeTab.value === 'account' ? AccountLogin : QRCodeLogin
})

const updateActiveTab = (tab) => {
  activeTab.value = tab
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-bg-primary);
}

.login-body {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
