<!-- 视频播放器（西瓜播放器）：https://h5player.bytedance.com/ -->
<template>
  <div :id="playerId" class="video-player" />
</template>

<script setup>
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'

defineOptions({ name: 'VideoPlayer' })

/**
 * 视频播放器
 * @property {string} playerId 播放器容器 ID（页面内唯一）
 * @property {string} videoUrl 视频源 URL
 * @property {string} posterUrl 视频封面图 URL
 * @property {boolean} autoplay 是否自动播放
 * @property {number} volume 音量大小（0-1）
 * @property {Array} playbackRates 可选的播放速率
 * @property {boolean} loop 是否循环播放
 * @property {boolean} muted 是否静音
 * @property {object} commonStyle 播放器配色自定义
 */
const props = defineProps({
  playerId: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  posterUrl: { type: String, default: '' },
  autoplay: { type: Boolean, default: false },
  volume: { type: Number, default: 1 },
  playbackRates: { type: Array, default: () => [0.5, 1, 1.5, 2] },
  loop: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  commonStyle: { type: Object, default: () => ({}) }
})

// 默认样式配置
const defaultStyle = {
  progressColor: 'rgba(255, 255, 255, 0.3)', // 进度条背景色
  playedColor: '#00AEED', // 已播放部分颜色
  cachedColor: 'rgba(255, 255, 255, 0.6)', // 缓存部分颜色
  sliderBtnStyle: {
    width: '10px',
    height: '10px',
    backgroundColor: '#00AEED'
  },
  volumeColor: '#00AEED'
}

const playerInstance = ref(null)

onMounted(() => {
  playerInstance.value = new Player({
    id: props.playerId,
    lang: 'zh', // 界面语言中文
    volume: props.volume,
    autoplay: props.autoplay,
    screenShot: true, // 启用截图功能
    url: props.videoUrl,
    poster: props.posterUrl,
    fluid: true, // 流式布局，自适应容器大小
    playbackRate: props.playbackRates,
    loop: props.loop,
    muted: props.muted,
    commonStyle: {
      ...defaultStyle,
      ...props.commonStyle
    }
  })

  playerInstance.value.on('error', (error) => {
    console.error('视频播放错误:', error)
  })
})

onBeforeUnmount(() => {
  playerInstance.value?.destroy()
})
</script>

<style lang="scss" scoped>
.video-player {
  width: 100%;
}
</style>
