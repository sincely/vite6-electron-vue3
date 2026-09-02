<!-- 组件中心 - 数字滚动 -->
<template>
  <div class="count-to-page">
    <PageHeader
      title="数字滚动"
      subtitle="基于 VueUse useTransition 的高性能数字滚动动画组件"
      icon="gauge"
    />

    <!-- 基础用法 -->
    <h1 class="page-title">基础用法</h1>
    <div class="count-box">
      <CountTo :target="1000" :duration="2000" />
    </div>

    <!-- 带前缀后缀 -->
    <h1 class="page-title">带前缀后缀</h1>
    <div class="count-box">
      <CountTo
        :target="20000"
        :duration="2500"
        prefix="¥"
        suffix="元"
        :decimals="2"
      />
    </div>

    <!-- 小数点和分隔符 -->
    <h1 class="page-title">小数点和分隔符</h1>
    <div class="count-box">
      <CountTo :target="2023.45" :duration="3000" :decimals="2" separator="," />
    </div>

    <!-- 动画效果对比 -->
    <h1 class="page-title">动画效果对比</h1>
    <ElCard class="page-card">
      <ElRow :gutter="20">
        <ElCol
          v-for="easing in easingTypes"
          :key="easing.type"
          :xs="12"
          :sm="8"
          :md="4"
          class="easing-col"
        >
          <div class="easing-name">{{ easing.name }}</div>
          <div class="count-box count-box--sm">
            <CountTo
              :target="easingTarget"
              :duration="3000"
              :easing="easing.type"
            />
          </div>
        </ElCol>
      </ElRow>
      <div class="section-action">
        <ElButton @click="triggerEasing">触发所有动画</ElButton>
      </div>
    </ElCard>

    <!-- 控制按钮 -->
    <h1 class="page-title">控制按钮</h1>
    <ElCard class="page-card">
      <div class="count-box">
        <CountTo
          ref="countToRef"
          :target="controlTarget"
          :duration="2000"
          @started="handleAnimationStarted"
          @finished="handleAnimationFinished"
          @paused="handleAnimationPaused"
          @reset="handleAnimationReset"
        />
      </div>
      <div class="section-action">
        <ElButton @click="startCount">开始</ElButton>
        <ElButton @click="pauseCount">暂停</ElButton>
        <ElButton @click="resetCount">重置</ElButton>
      </div>
    </ElCard>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

defineOptions({ name: 'WidgetsCountTo' })

const controlTarget = ref(0)
const countToRef = ref()
const easingTarget = ref(0)

/**
 * 缓动动画类型配置
 */
const easingTypes = [
  { name: 'Linear', type: 'linear' },
  { name: 'Ease Out Cubic', type: 'easeOutCubic' },
  { name: 'Ease Out Expo', type: 'easeOutExpo' },
  { name: 'Ease Out Sine', type: 'easeOutSine' },
  { name: 'Ease In Out', type: 'easeInOutCubic' },
  { name: 'Ease In Quad', type: 'easeInQuad' }
]

/**
 * 开始计数动画
 */
const startCount = () => {
  const newTarget = 5000
  controlTarget.value = newTarget
  countToRef.value?.start(newTarget)
}

/**
 * 暂停计数动画
 */
const pauseCount = () => {
  countToRef.value?.pause()
}

/**
 * 重置计数动画
 */
const resetCount = () => {
  countToRef.value?.reset()
  controlTarget.value = 0
}

/**
 * 触发缓动效果演示，在 0 和 1000 之间切换
 */
const triggerEasing = () => {
  easingTarget.value = easingTarget.value === 0 ? 1000 : 0
}

/**
 * 动画开始回调
 */
const handleAnimationStarted = (value) => {
  ElMessage.info(`动画开始，目标值: ${value}`)
}

/**
 * 动画完成回调
 */
const handleAnimationFinished = (value) => {
  ElMessage.success(`动画完成，最终值: ${value}`)
}

/**
 * 动画暂停回调
 */
const handleAnimationPaused = (value) => {
  ElMessage.warning(`动画暂停，当前值: ${Math.round(value)}`)
}

/**
 * 动画重置回调
 */
const handleAnimationReset = () => {
  ElMessage.info('动画已重置')
}
</script>

<style lang="scss" scoped>
.count-to-page {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
}

.page-title {
  margin: 20px 0 12px;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-text-primary);

  &:first-of-type {
    margin-top: 16px;
  }
}

.count-box {
  padding: 20px;
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: center;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  &--sm {
    margin-bottom: 0;
    font-size: 20px;
  }
}

.page-card {
  margin-bottom: 12px;
}

.easing-col {
  margin-bottom: 16px;
  text-align: center;

  .easing-name {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
  }
}

.section-action {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-top: 8px;
}
</style>
