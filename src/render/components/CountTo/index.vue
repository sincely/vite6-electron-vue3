<template>
  <span class="count-to">{{ formattedValue }}</span>
</template>

<script setup>
import { computed, watch, nextTick, shallowRef } from 'vue'
import { useTransition, TransitionPresets } from '@vueuse/core'

defineOptions({ name: 'CountTo' })

/**
 * 数字滚动
 * @property {number} target 目标值
 * @property {number} duration 动画持续时间（毫秒）
 * @property {boolean} autoStart 是否自动开始
 * @property {number} decimals 小数位数
 * @property {string} decimal 小数点符号
 * @property {string} separator 千分位分隔符
 * @property {string} prefix 前缀
 * @property {string} suffix 后缀
 * @property {string} easing 缓动函数（@vueuse/core TransitionPresets）
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
  easing: { type: String, default: 'easeOutExpo' }
})

const emit = defineEmits(['started', 'finished'])

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

// useTransition 在 currentValue 变化时按缓动曲线过渡到目标值
const transitionValue = useTransition(currentValue, {
  duration: computed(() => props.duration),
  transition: computed(() => TransitionPresets[safeEasing.value]),
  onStarted: () => {
    isRunning.value = true
    emit('started', targetValue.value)
  },
  onFinished: () => {
    isRunning.value = false
    emit('finished', targetValue.value)
  }
})

const formattedValue = computed(() => {
  const value = transitionValue.value
  if (!Number.isFinite(value)) return `${props.prefix}0${props.suffix}`
  return (
    props.prefix +
    formatNumber(value, props.decimals, props.decimal, props.separator) +
    props.suffix
  )
})

/** 开始滚动到目标值（默认滚动到当前 target） */
function start(target) {
  const finalTarget = target !== undefined ? target : targetValue.value
  if (!Number.isFinite(finalTarget)) return
  targetValue.value = finalTarget
  // 目标值与当前值一致时跳过动画
  if (Math.abs(transitionValue.value - finalTarget) < Number.EPSILON) return
  nextTick(() => {
    currentValue.value = finalTarget
  })
}

/** 重置到指定值（默认 0） */
function reset(newTarget = 0) {
  currentValue.value = newTarget
  targetValue.value = newTarget
  isRunning.value = false
}

watch(
  () => props.target,
  (val) => {
    if (props.autoStart) start(val)
    else targetValue.value = val
  },
  { immediate: props.autoStart }
)

defineExpose({ start, reset })
</script>

<style lang="scss" scoped>
.count-to {
  font-variant-numeric: tabular-nums;
}
</style>
