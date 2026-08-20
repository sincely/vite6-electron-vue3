<template>
  <div class="brand-panel">
    <!-- vben login-background：154deg 主题色渐变 + 高斯模糊 -->
    <div class="brand-streak"></div>
    <div class="brand-blob brand-blob--1"></div>
    <div class="brand-blob brand-blob--2"></div>
    <div class="grid-pattern"></div>

    <!-- 系统介绍 -->
    <div class="brand-content enter-x">
      <div class="logo-card animate-float">
        <img src="@/assets/bar/app.png" alt="Lightning" class="brand-logo" />
      </div>
      <h2 class="brand-title">开箱即用的企业级桌面应用模版</h2>
      <p class="brand-desc">
        工程化、高性能、跨端一致的 Electron 桌面应用解决方案
      </p>
      <div class="brand-tags">
        <span class="brand-tag">Electron</span>
        <span class="brand-tag">Vue 3</span>
        <span class="brand-tag">Vite 6</span>
        <span class="brand-tag">Element Plus</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'BrandPanel' })
</script>

<style lang="scss" scoped>
.brand-panel {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: linear-gradient(160deg, #f0f5ff 0%, #fafbff 55%, #f5f7fb 100%);
}

html[data-theme='dark'] .brand-panel {
  background: linear-gradient(160deg, #070709 0%, #0d1117 60%, #0a0c10 100%);
}

// vben login-background：154deg 主题色渐变光带 + 大面积模糊
.brand-streak {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    154deg,
    rgb(7 7 9 / 8%) 30%,
    color-mix(in srgb, var(--color-primary), transparent 70%) 48%,
    rgb(7 7 9 / 8%) 64%
  );
  filter: blur(100px);
}

html[data-theme='dark'] .brand-streak {
  background: linear-gradient(
    154deg,
    rgb(255 255 255 / 4%) 30%,
    color-mix(in srgb, var(--color-primary), transparent 78%) 48%,
    rgb(255 255 255 / 4%) 64%
  );
}

// 装饰光斑
.brand-blob {
  position: absolute;
  pointer-events: none;
  filter: blur(70px);
  border-radius: 999px;
}

.brand-blob--1 {
  top: -15%;
  right: -10%;
  width: 380px;
  height: 380px;
  background: color-mix(in srgb, var(--color-primary), transparent 80%);
  animation: drift 14s ease-in-out infinite alternate;
}

.brand-blob--2 {
  bottom: -20%;
  left: -10%;
  width: 320px;
  height: 320px;
  background: color-mix(
    in srgb,
    var(--brand-accent-alt, #3b82f6),
    transparent 85%
  );
  animation: drift 17s ease-in-out infinite alternate-reverse;
}

// 点阵纹理
.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at 1px 1px,
    color-mix(in srgb, var(--color-text-primary), transparent 90%) 1px,
    transparent 0
  );
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 78%);
}

.brand-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 8%;
  text-align: center;
}

// vben animate-float
.logo-card {
  display: flex;
  padding: 18px;
  background: color-mix(in srgb, var(--color-bg-card), transparent 25%);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 30%);
  border-radius: 22px;
  box-shadow: var(--shadow-lg);
  animation: float 6s ease-in-out infinite alternate;

  .brand-logo {
    width: 56px;
    height: 56px;
  }
}

.brand-title {
  margin-top: 28px;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: 0.5px;
}

.brand-desc {
  margin-top: 10px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.brand-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 24px;

  .brand-tag {
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
    border: 1px solid color-mix(in srgb, var(--color-primary), transparent 75%);
    border-radius: 999px;
  }
}

// vben enter-x 入场动画
.enter-x {
  animation: enter-x 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes enter-x {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-16px);
  }
}

@keyframes drift {
  from {
    transform: translate(0, 0) scale(1);
  }

  to {
    transform: translate(-30px, 25px) scale(1.1);
  }
}
</style>
