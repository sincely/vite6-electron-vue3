<!-- 组件中心 - 礼花 -->
<template>
  <div class="fireworks-page">
    <PageHeader
      title="礼花"
      subtitle="Canvas 粒子礼花特效，支持几何图形、图片粒子与节日自动触发"
      icon="celebrate"
    />

    <ElCard class="page-card">
      <div class="action-bar">
        <ElButton :disabled="isLaunching" @click="handleSingleLaunch">
          ✨ 放个小礼花
        </ElButton>
        <ElButton :disabled="isLaunching" @click="handleImageLaunch(bp)">
          🎉 打开幸运红包
        </ElButton>
        <ElButton :disabled="isLaunching" @click="handleMultipleLaunch('')">
          🎆 璀璨烟火秀
        </ElButton>
        <ElButton :disabled="isLaunching" @click="handleImageLaunch(sd)">
          ❄️ 飘点小雪花
        </ElButton>
        <ElButton :disabled="isLaunching" @click="handleMultipleLaunch(sd)">
          ❄️ 浪漫暴风雪
        </ElButton>
      </div>
    </ElCard>

    <ElDescriptions
      title="礼花组件说明"
      direction="vertical"
      :column="1"
      border
      class="fireworks-desc"
    >
      <ElDescriptionsItem label="显示时机">
        礼花效果组件已全局注册（layouts/index.vue），自动触发时机由配置文件控制。
        默认配置为空，不会在你使用过程中自动触发，无需担心。
      </ElDescriptionsItem>
      <ElDescriptionsItem label="礼花样式">
        默认显示几何图形，也可以配置图片粒子，图片需要在
        src/render/components/FireworksEffect/index.vue 中预先导入。
      </ElDescriptionsItem>
      <ElDescriptionsItem label="配置文件">
        在 src/render/config/festival.js 文件中，可以配置节日和对应的礼花样式，
        命中日期范围时每天自动播放一次。
      </ElDescriptionsItem>
      <ElDescriptionsItem label="快捷键">
        command + shift + p 或者 ctrl + shift + p
      </ElDescriptionsItem>
    </ElDescriptions>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import eventBus from '@/utils/eventBus'
import bp from '@/assets/images/ceremony/hb.png'
import sd from '@/assets/images/ceremony/sd.png'

defineOptions({ name: 'WidgetsFireworks' })

const timerRef = ref(null)
const isLaunching = ref(false)

/**
 * 触发连续礼花效果
 * @param {number} count 发射次数
 * @param {string} src 图片资源路径
 */
const triggerFireworks = (count, src) => {
  // 清除之前的定时器
  if (timerRef.value) {
    clearInterval(timerRef.value)
    timerRef.value = null
  }

  isLaunching.value = true

  let fired = 0
  timerRef.value = setInterval(() => {
    eventBus.emit('triggerFireworks', src)
    fired++

    if (fired >= count) {
      clearInterval(timerRef.value)
      timerRef.value = null
      isLaunching.value = false
    }
  }, 1000)
}

/**
 * 发射单个礼花
 */
const handleSingleLaunch = () => {
  eventBus.emit('triggerFireworks')
}

/**
 * 发射多个礼花
 */
const handleMultipleLaunch = (src) => {
  triggerFireworks(10, src)
}

/**
 * 发射带图片的礼花
 */
const handleImageLaunch = (src) => {
  eventBus.emit('triggerFireworks', src)
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timerRef.value) {
    clearInterval(timerRef.value)
    timerRef.value = null
  }
})
</script>

<style lang="scss" scoped>
.fireworks-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.fireworks-desc {
  margin-top: 24px;
}
</style>
