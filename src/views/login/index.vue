<template>
  <div class="login-container">
    <CustomTitleBar class="login-titlebar" />

    <div class="login-content">
      <div class="login-card">
        <!-- Logo / Branding Area -->
        <div class="login-header">
          <div class="logo-wrapper">
            <img src="@/assets/bar/icon.png" alt="Logo" class="app-logo" />
          </div>
          <h1 class="app-title">Lightning</h1>
          <p class="app-subtitle">下一代企业级管理平台</p>
        </div>

        <!-- Login Mode Switcher -->
        <div class="login-tabs">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'account' }"
            @click="updateActiveTab('account')"
          >
            <span class="tab-text">账号登录</span>
            <div v-if="activeTab === 'account'" class="active-indicator"></div>
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'qrcode' }"
            @click="updateActiveTab('qrcode')"
          >
            <span class="tab-text">扫码登录</span>
            <div v-if="activeTab === 'qrcode'" class="active-indicator"></div>
          </div>
        </div>

        <!-- Dynamic Content -->
        <div class="login-form-wrapper">
          <transition name="fade-slide" mode="out-in">
            <component :is="activeTabComponent" />
          </transition>
        </div>

        <!-- Footer / Copyright -->
        <div class="login-footer">
          <span>© 2024 Lightning Inc.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg-window);
  background-image: var(--app-bg-gradient);

  // 装饰性背景光斑
  &::before {
    position: absolute;
    top: -20%;
    left: -10%;
    width: 600px;
    height: 600px;
    content: '';
    background: radial-gradient(
      circle,
      var(--brand-accent-soft) 0%,
      transparent 70%
    );
    filter: blur(80px);
    opacity: 0.6;
    animation: float 10s ease-in-out infinite alternate;
  }

  &::after {
    position: absolute;
    right: -10%;
    bottom: -20%;
    width: 500px;
    height: 500px;
    content: '';
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--color-success), transparent 85%) 0%,
      transparent 70%
    );
    filter: blur(60px);
    opacity: 0.5;
    animation: float 12s ease-in-out infinite alternate-reverse;
  }
}

.login-titlebar {
  position: relative;
  z-index: 10;
}

.login-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.login-card {
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 500px;
}

.login-header {
  margin-bottom: 20px;
  text-align: center;

  .logo-wrapper {
    display: inline-flex;
    padding: 8px;
    margin-bottom: 10px;
    background: linear-gradient(
      135deg,
      var(--color-bg-card),
      var(--color-bg-hover)
    );
    border-radius: 12px;
    box-shadow: var(--shadow-sm);

    .app-logo {
      width: 40px;
      height: 40px;
    }
  }

  .app-title {
    margin-bottom: 2px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: var(--color-text-primary);
    letter-spacing: -0.5px;
  }

  .app-subtitle {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

.login-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);

  .tab-item {
    position: relative;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-text-primary);
    }

    &.active {
      font-weight: 600;
      color: var(--color-primary);
    }

    .active-indicator {
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--color-primary);
      border-radius: 2px 2px 0 0;
      animation: tab-slide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
}

.login-form-wrapper {
  flex: 1;
  width: 100%;
}

.login-footer {
  margin-top: 24px;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
  opacity: 0.6;
}

// Animations
@keyframes float {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-20px);
  }
}

@keyframes tab-slide {
  from {
    opacity: 0;
    transform: scaleX(0.8);
  }

  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

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
</style>
