<template>
  <div class="auth-container" :class="`layout-${authPanelLayout}`">
    <!-- 悬浮窗口标题栏（拖拽区 + 布局切换 + 主题切换 + 窗口控制） -->
    <CustomTitleBar class="auth-titlebar" />

    <!-- 品牌面板（left 布局居右 / right 布局居左；窄窗口及 center 布局隐藏） -->
    <BrandPanel v-if="authPanelLayout !== 'center'" class="auth-brand-panel" />

    <!-- 认证表单面板（left=居右 / right=居左 / center=居中卡片） -->
    <div class="auth-form-panel">
      <!-- Logo + 应用名 -->
      <div class="form-header">
        <img src="@/assets/bar/app.png" alt="Lightning" class="app-logo" />
        <span class="app-name">Lightning</span>
      </div>

      <!-- 表单内容（垂直居中；center 布局渲染为居中卡片，复刻 vben authPanelCenter） -->
      <div class="form-content">
        <div class="form-inner">
          <slot />
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="form-footer">
        <span>Copyright © 2026 Lightning</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import CustomTitleBar from './CustomTitleBar.vue'
import BrandPanel from './BrandPanel.vue'
import { useAuthPanelLayout } from '../composables/useAuthPanelLayout'

const { authPanelLayout } = useAuthPanelLayout()
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg-window);
}

.auth-titlebar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
}

// ─── 布局排序：DOM 顺序固定，用 CSS order 控制面板位置 ──
// left：表单居左、品牌居右（默认）
.layout-left {
  .auth-form-panel {
    order: 1;
  }

  .auth-brand-panel {
    order: 2;
  }
}

// right：品牌居左、表单居右
.layout-right {
  .auth-form-panel {
    order: 2;
  }

  .auth-brand-panel {
    order: 1;
  }
}

// ─── 表单面板 ────────────────────────────────────────
.auth-form-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 40%;
  min-width: 400px;
  background: var(--color-bg-window);
}

.form-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;

  .app-logo {
    width: 34px;
    height: 34px;
  }

  .app-name {
    margin-left: 10px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.3px;
  }
}

.form-content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  overflow-y: auto;
}

.form-inner {
  width: 100%;
  max-width: 360px;
}

.form-footer {
  padding: 16px;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
  opacity: 0.75;
}

// ─── center 布局：vben authPanelCenter 居中卡片 ─────
.layout-center {
  .auth-form-panel {
    width: 100%;
    min-width: 0;
  }

  .form-inner {
    width: 100%;
    max-width: 400px;
    padding: 32px 32px 28px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 24px;
    box-shadow: var(--shadow-lg);
  }
}

// ─── 响应式：窄窗口隐藏品牌面板，表单占满 ─────────────
@media (width <= 880px) {
  .auth-form-panel {
    width: 100%;
    min-width: 0;
  }

  .auth-brand-panel {
    display: none;
  }
}
</style>
