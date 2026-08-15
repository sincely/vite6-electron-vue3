<template>
  <span class="count-to">{{ formattedValue }}</span>
</template>

<script setup>
import { computed, watch, nextTick, shallowRef } from 'vue'
import { useTransition, TransitionPresets } from '@vueuse/core'

defineOptions({ name: 'CountTo' })

/**
 * 数字滚动
 * 基于 VueUse useTransition 的高性能数字滚动动画组件，
 * 支持完整的动画控制（开始/暂停/重置）和事件监听
 * @property {number} target 目标值
 * @property {number} duration 动画持续时间（毫秒）
 * @property {boolean} autoStart 是否自动开始
 * @property {number} decimals 小数位数
 * @property {string} decimal 小数点符号
 * @property {string} separator 千分位分隔符
 * @property {string} prefix 前缀
 * @property {string} suffix 后缀
 * @property {string} easing 缓动函数（@vueuse/core TransitionPresets）
 * @property {boolean} disabled 是否禁用动画
 */
const props = defineProps({
  target: { type: Number, default: 0 },
  duration: { type: Number, default: 2000 },
  autoStart: { type: Boolean, default: true },
  decimals: { type: Number, default: 0 },
  decimal: { type: String, default: '.' },
  separator: { type: String, default: '' },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  easing: { type: String, default: 'easeOutExpo' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['started', 'finished', 'paused', 'reset'])

const DEFAULT_EASING = 'easeOutExpo'

function formatNumber(value, decimals, decimal, separator) {
  let result =
    decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toString()

  // 处理小数点符号
  if (decimal !== '.' && result.includes('.')) {
    result = result.replace(/\./g, decimal)
  }

  // 处理千分位分隔符
  if (separator) {
    const parts = result.split(decimal)
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    result = parts.join(decimal)
  }

  return result
}

const safeEasing = computed(() =>
  props.easing in TransitionPresets ? props.easing : DEFAULT_EASING
)

// 状态管理
const currentValue = shallowRef(0)
const targetValue = shallowRef(props.target)
const isRunning = shallowRef(false)
const isPaused = shallowRef(false)
const pausedValue = shallowRef(0)

// useTransition 在 currentValue 变化时按缓动曲线过渡到目标值
const transitionValue = useTransition(currentValue, {
  duration: computed(() => props.duration),
  transition: computed(() => TransitionPresets[safeEasing.value]),
  onStarted: () => {
    isRunning.value = true
    isPaused.value = false
    emit('started', targetValue.value)
  },
  onFinished: () => {
    isRunning.value = false
    isPaused.value = false
    emit('finished', targetValue.value)
  }
})

const formattedValue = computed(() => {
  const value = isPaused.value ? pausedValue.value : transitionValue.value
  if (!Number.isFinite(value)) return `${props.prefix}0${props.suffix}`
  return (
    props.prefix +
    formatNumber(value, props.decimals, props.decimal, props.separator) +
    props.suffix
  )
})

function resetPauseState() {
  isPaused.value = false
  pausedValue.value = 0
}

/** 开始滚动到目标值（默认滚动到当前 target），支持从暂停处继续 */
function start(target) {
  if (props.disabled) return
  const finalTarget = target !== undefined ? target : targetValue.value
  if (!Number.isFinite(finalTarget)) return
  targetValue.value = finalTarget
  // 目标值与当前值一致时跳过动画
  const current = isPaused.value ? pausedValue.value : transitionValue.value
  if (Math.abs(current - finalTarget) < Number.EPSILON) return
  // 从暂停值继续（如果存在）
  if (isPaused.value) {
    currentValue.value = pausedValue.value
    resetPauseState()
  }
  nextTick(() => {
    currentValue.value = finalTarget
  })
}

/** 暂停滚动，记录当前值供继续/重置使用 */
function pause() {
  if (!isRunning.value || isPaused.value) return
  isPaused.value = true
  pausedValue.value = transitionValue.value
  currentValue.value = pausedValue.value
  emit('paused', pausedValue.value)
}

/** 重置到指定值（默认 0） */
function reset(newTarget = 0) {
  const target = Number.isFinite(newTarget) ? newTarget : 0
  currentValue.value = target
  targetValue.value = target
  resetPauseState()
  emit('reset')
}

/** 停止滚动并归零 */
function stop() {
  if (isRunning.value || isPaused.value) {
    currentValue.value = 0
    resetPauseState()
    emit('paused', 0)
  }
}

/** 设置新的目标值（运行中或 autoStart 时立即开始滚动） */
function setTarget(target) {
  if (!Number.isFinite(target)) return
  targetValue.value = target
  if ((isRunning.value || props.autoStart) && !props.disabled) {
    start(target)
  }
}

watch(
  () => props.target,
  (val) => {
    if (props.autoStart && !props.disabled) start(val)
    else targetValue.value = val
  },
  { immediate: props.autoStart && !props.disabled }
)

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled && isRunning.value) stop()
  }
)

defineExpose({ start, pause, reset, stop, setTarget })
</script>

<style lang="scss" scoped>
.count-to {
  font-variant-numeric: tabular-nums;
}
</style>
