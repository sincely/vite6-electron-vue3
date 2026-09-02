<!-- 组件中心 - 二维码 -->
<template>
  <div class="qrcode-page">
    <PageHeader
      title="二维码"
      subtitle="基于 qrcode 库，支持 canvas / svg 渲染与中心 Logo"
      icon="qrcode"
    />

    <!-- 内容输入 -->
    <ElCard class="page-card">
      <div class="value-input">
        <span class="input-label">二维码内容：</span>
        <ElInput
          v-model="qrValue"
          placeholder="请输入二维码内容"
          class="input-field"
        />
        <ElSwitch
          v-model="isShowLogo"
          active-text="显示 Logo"
          class="logo-switch"
        />
      </div>
    </ElCard>

    <ElRow :gutter="20">
      <ElCol
        v-for="preset in qrcodePresets"
        :key="preset.title"
        :xs="24"
        :sm="12"
        :md="6"
        class="page-col"
      >
        <ElCard>
          <template #header>
            <span class="card-title">{{ preset.title }}</span>
          </template>
          <div class="qrcode-box">
            <QrCode :value="qrValue" v-bind="preset.config" />
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup>
import drawLogo from '@/assets/images/draw/draw1.png'

defineOptions({ name: 'WidgetsQrcode' })

/**
 * 二维码内容
 */
const qrValue = ref('https://www.electronjs.org/')
const isShowLogo = ref(false)

/**
 * 中心 Logo 配置
 */
const logoImageSettings = computed(() =>
  isShowLogo.value
    ? {
        src: drawLogo,
        width: 40,
        height: 40,
        excavate: true
      }
    : null
)

/**
 * 预设二维码样式配置
 */
const qrcodePresets = computed(() => [
  {
    title: '渲染成 svg 标签',
    config: {
      size: 160,
      level: 'H',
      renderAs: 'svg',
      margin: 0,
      background: '#ffffff',
      foreground: '#000000',
      imageSettings: logoImageSettings.value
    }
  },
  {
    title: '渲染成 canvas 标签',
    config: {
      size: 160,
      level: 'H',
      renderAs: 'canvas',
      margin: 0,
      background: '#ffffff',
      foreground: '#000000',
      imageSettings: logoImageSettings.value
    }
  },
  {
    title: '自定义颜色',
    config: {
      size: 160,
      level: 'H',
      renderAs: 'canvas',
      margin: 0,
      background: '#f0f0f0',
      foreground: '#2563eb',
      imageSettings: logoImageSettings.value
    }
  },
  {
    title: '带有 Logo',
    config: {
      size: 160,
      level: 'H',
      renderAs: 'canvas',
      margin: 0,
      background: '#ffffff',
      foreground: '#000000',
      imageSettings: {
        src: drawLogo,
        width: 40,
        height: 40,
        excavate: true
      }
    }
  }
])
</script>

<style lang="scss" scoped>
.qrcode-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.value-input {
  display: flex;
  gap: 12px;
  align-items: center;

  .input-label {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--color-text-primary);
  }

  .input-field {
    max-width: 400px;
  }
}

.page-col {
  margin-bottom: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.qrcode-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>
