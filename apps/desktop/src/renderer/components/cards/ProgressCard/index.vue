<!-- 进度卡片：百分比数字滚动 + 进度条动画 -->
<template>
  <div class="progress-card">
    <div
      class="progress-card__header"
      :style="{ justifyContent: icon ? 'space-between' : 'flex-start' }"
    >
      <div
        v-if="icon"
        class="progress-card__icon"
        :style="{
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          color
        }"
      >
        <el-icon :size="24">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="progress-card__info">
        <CountTo
          class="progress-card__value"
          :target="percentage"
          :duration="2000"
          suffix="%"
          :style="{ textAlign: icon ? 'right' : 'left' }"
        />
        <p class="progress-card__title">{{ title }}</p>
      </div>
    </div>
    <ElProgress
      :percentage="currentPercentage"
      :stroke-width="strokeWidth"
      :show-text="false"
      :color="color"
    />
  </div>
</template>

<script setup>
defineOptions({ name: 'ProgressCard' })

const props = defineProps({
  /** 进度百分比 */
  percentage: { type: Number, required: true },
  /** 标题 */
  title: { type: String, required: true },
  /** 进度条颜色 */
  color: { type: String, default: '#67C23A' },
  /** Element Plus 图标名（全局注册） */
  icon: { type: String, default: '' },
  /** 进度条宽度 */
  strokeWidth: { type: Number, default: 5 }
})

const animationDuration = 500
const currentPercentage = ref(0)

// rAF 线性过渡到新百分比
function animateProgress() {
  const startTime = Date.now()
  const startValue = currentPercentage.value
  const endValue = props.percentage

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / animationDuration, 1)

    currentPercentage.value = startValue + (endValue - startValue) * progress

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

onMounted(() => {
  animateProgress()
})

// percentage 变化时重新执行动画
watch(() => props.percentage, animateProgress)
</script>

<style lang="scss" scoped>
.progress-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 128px;
  padding: 0 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
  }

  &__info {
    flex: 1;
  }

  &__value {
    display: block;
    margin-bottom: 4px;
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__title {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-muted);
  }

  :deep(.el-progress-bar__outer) {
    background-color: color-mix(
      in srgb,
      var(--color-text-primary) 8%,
      transparent
    );
  }
}
</style>
