<template>
  <!-- 全局水印：全屏覆盖、不拦截交互（参考 art-design-pro） -->
  <div v-if="appStore.watermarkVisible" class="global-watermark">
    <el-watermark
      :content="appSetting.watermarkContent"
      :font="{ fontSize: 16, color: 'rgba(128, 128, 128, 0.2)' }"
      :rotate="-22"
      :gap="[100, 100]"
      :offset="[50, 50]"
    >
      <div class="global-watermark__fill" />
    </el-watermark>
  </div>
</template>

<script setup>
import appSetting from '@/settings/appSetting'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.global-watermark {
  position: fixed;
  inset: 0;
  z-index: 3100;
  pointer-events: none;

  &__fill {
    width: 100%;
    height: 100vh;
  }
}
</style>
