<!-- 组件中心 - 水印 -->
<template>
  <div class="watermark-page">
    <PageHeader
      title="水印"
      subtitle="Element Plus 水印组件与全局水印开关"
      icon="watermark"
    />

    <!-- 基础文字水印 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">基础文字水印</span>
      </template>
      <ElWatermark
        content="Lightning"
        :font="{ color: 'rgba(128, 128, 128, 0.2)' }"
      >
        <div class="watermark-area" />
      </ElWatermark>
    </ElCard>

    <!-- 多行文字水印 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">多行文字水印</span>
      </template>
      <ElWatermark
        :content="['Lightning', '专注用户体验，高效开发']"
        :font="{ fontSize: 16, color: 'rgba(128, 128, 128, 0.2)' }"
      >
        <div class="watermark-area" />
      </ElWatermark>
    </ElCard>

    <!-- 图片水印 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">图片水印</span>
      </template>
      <ElWatermark
        :image="watermarkImage"
        :opacity="0.3"
        :width="60"
        :height="60"
      >
        <div class="watermark-area" />
      </ElWatermark>
    </ElCard>

    <!-- 自定义样式水印 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">自定义样式水印</span>
      </template>
      <ElWatermark
        content="Lightning"
        :font="{
          fontSize: 20,
          fontFamily: 'Arial',
          color: 'rgba(255, 0, 0, 0.3)'
        }"
        :rotate="-22"
        :gap="[100, 100]"
      >
        <div class="watermark-area" />
      </ElWatermark>
    </ElCard>

    <!-- 全局水印开关 -->
    <ElCard class="page-card">
      <template #header>
        <span class="card-title">全局水印</span>
      </template>
      <p class="global-tip">
        全局水印覆盖整个应用窗口（不拦截交互），内容由
        <code>settings/appSetting.js</code>
        的 watermarkContent 配置。
      </p>
      <ElButton
        :type="appStore.watermarkVisible ? 'danger' : 'primary'"
        @click="handleWatermarkVisible"
      >
        {{ appStore.watermarkVisible ? '隐藏全局水印' : '显示全局水印' }}
      </ElButton>
    </ElCard>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import watermarkImage from '@/assets/images/draw/draw1.png'

defineOptions({ name: 'WidgetsWatermark' })

const appStore = useAppStore()

/**
 * 切换全局水印显示状态
 */
const handleWatermarkVisible = () => {
  const nextVisible = !appStore.watermarkVisible
  appStore.setWatermarkVisible(nextVisible)
  ElMessage.success(nextVisible ? '已显示全局水印' : '已隐藏全局水印')
}
</script>

<style lang="scss" scoped>
.watermark-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.page-card {
  :deep(.el-card__header) {
    padding: 14px 20px;
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.watermark-area {
  height: 200px;
}

.global-tip {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-text-secondary);

  code {
    padding: 2px 6px;
    font-size: 13px;
    background-color: var(--color-bg-input);
    border-radius: 4px;
  }
}
</style>
