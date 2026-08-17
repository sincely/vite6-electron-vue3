<!-- 组件中心 - 视频播放器 -->
<template>
  <div class="video-page">
    <PageHeader
      title="视频播放器"
      subtitle="基于西瓜播放器（xgplayer），支持截图、倍速与自适应布局"
      icon="video"
    />

    <ElCard class="page-card">
      <div class="player-wrap">
        <VideoPlayer
          player-id="widgets-video-1"
          :video-url="videoUrl"
          :poster-url="posterUrl"
          :autoplay="false"
          :volume="1"
          :playback-rates="[0.5, 1, 1.5, 2]"
        />
      </div>
      <p class="video-tip">
        演示视频来自 xgplayer
        官方示例（需联网加载）。播放器支持音量调节、倍速切换、
        全屏、画中画与视频截图等能力。
      </p>
    </ElCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import posterUrl from '@/assets/images/cover/img1.webp'

defineOptions({ name: 'WidgetsVideo' })

/**
 * 视频源 URL
 */
const videoUrl = ref(
  '//lf3-static.bytednsdoc.com/obj/eden-cn/nupenuvpxnuvo/xgplayer_doc/xgplayer-demo.mp4'
)
</script>

<style lang="scss" scoped>
.video-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.player-wrap {
  max-width: 800px;
}

.video-tip {
  max-width: 800px;
  margin: 16px 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}
</style>
