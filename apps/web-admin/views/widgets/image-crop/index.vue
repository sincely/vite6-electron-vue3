<!-- 组件中心 - 图像裁剪 -->
<template>
  <div class="image-crop-page">
    <PageHeader
      title="图像裁剪"
      subtitle="基于 vue-img-cutter，支持实时预览、缩放旋转与水印"
      icon="image"
    />

    <ElCard class="page-card">
      <ImageCutter
        v-model:imgUrl="imageUrl"
        :box-width="530"
        :box-height="300"
        :cut-width="360"
        :cut-height="200"
        :quality="1"
        :tool="true"
        watermark-text="Lightning"
        watermark-color="#ff0000"
        :show-preview="true"
        :original-graph="false"
        title="图片裁剪"
        preview-title="预览效果"
        @error="handleError"
        @image-load-complete="handleLoadComplete"
        @image-load-error="handleLoadError"
      />
    </ElCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import demoImage from '@/assets/images/cover/img1.webp'

defineOptions({ name: 'WidgetsImageCrop' })

/**
 * 图片 URL
 */
const imageUrl = ref(demoImage)

/**
 * 处理裁剪错误
 */
const handleError = (error) => {
  console.error('裁剪错误:', error)
  ElMessage.error('图片裁剪失败')
}

/**
 * 处理图片加载完成
 */
const handleLoadComplete = (result) => {
  console.log('图片加载完成:', result)
}

/**
 * 处理图片加载错误
 */
const handleLoadError = (error) => {
  console.error('图片加载失败:', error)
  ElMessage.error('图片加载失败')
}
</script>

<style lang="scss" scoped>
.image-crop-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}
</style>
