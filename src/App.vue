<template>
  <div class="app-box" :class="{ 'is-login': isLoginPage }">
    <div class="ambient ambient-a" aria-hidden="true" />
    <div class="ambient ambient-b" aria-hidden="true" />
    <div class="ambient ambient-c" aria-hidden="true" />
    <div class="app-container" :class="{ 'is-login': isLoginPage }">
      <router-view />
    </div>
    <UpdateProgress />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UpdateProgress from '@/components/UpdateProgress.vue'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>

<style lang="scss" scoped>
.app-box {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg-window);
  isolation: isolate;

  .ambient {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    filter: blur(0.6px);
    border-radius: 999px;
    opacity: 0.9;

    &-a {
      top: -140px;
      right: -120px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgb(249 115 22 / 24%) 0%, rgb(249 115 22 / 0%) 70%);
      animation: drift-a 12s ease-in-out infinite alternate;
    }

    &-b {
      bottom: -180px;
      left: -140px;
      width: 420px;
      height: 420px;
      background: radial-gradient(circle, rgb(14 165 233 / 20%) 0%, rgb(14 165 233 / 0%) 72%);
      animation: drift-b 16s ease-in-out infinite alternate;
    }

    &-c {
      top: 36%;
      left: 36%;
      width: 260px;
      height: 260px;
      background: radial-gradient(circle, rgb(34 197 94 / 11%) 0%, rgb(34 197 94 / 0%) 72%);
      animation: drift-c 10s ease-in-out infinite alternate;
    }
  }

  &.is-login .ambient {
    opacity: 1;
  }
}

.app-container {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  &.is-login {
    height: 100vh;
  }
}

@keyframes drift-a {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }

  to {
    transform: translate3d(-18px, 28px, 0) scale(1.05);
  }
}

@keyframes drift-b {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(20px, -14px, 0);
  }
}

@keyframes drift-c {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(-8px, -16px, 0);
  }
}
</style>
