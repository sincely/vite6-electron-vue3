<!-- 文字滚动公告 -->
<template>
  <div
    ref="containerRef"
    class="text-scroll"
    :class="`text-scroll--${normalizedType}`"
    :style="containerStyle"
  >
    <div class="text-scroll__side text-scroll__side--left">
      <Icon icon="ri:volume-down-line" width="18" height="18" />
    </div>

    <div
      ref="contentRef"
      class="text-scroll__content"
      :class="{
        'is-vertical': !isHorizontal,
        'is-ready': isReady
      }"
      :style="contentStyle"
      @click="handleContentClick"
    >
      <!-- 原始内容 -->
      <span ref="textRef" class="text-scroll__text">
        <slot>
          <span v-html="text"></span>
        </slot>
      </span>
      <!-- 克隆内容用于无缝循环 -->
      <span
        v-if="shouldClone"
        class="text-scroll__text text-scroll__text--clone"
      >
        <slot>
          <span v-html="text"></span>
        </slot>
      </span>
    </div>

    <div
      v-if="showClose"
      class="text-scroll__side text-scroll__side--right"
      @click="handleClose"
    >
      <Icon icon="ri:close-fill" width="18" height="18" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@iconify/vue'
import {
  useElementSize,
  useRafFn,
  useElementHover,
  useDebounceFn,
  useTimeoutFn
} from '@vueuse/core'

defineOptions({ name: 'TextScroll' })

/**
 * 文字滚动
 * @property {string} text 滚动文本内容（支持 HTML）
 * @property {string} type 主题类型 primary | success | warning | danger | info
 * @property {string} direction 滚动方向 left | right | up | down
 * @property {number} speed 滚动速度（像素/秒）
 * @property {string} width 容器宽度
 * @property {string} height 容器高度
 * @property {boolean} pauseOnHover 鼠标悬停时是否暂停滚动
 * @property {boolean} showClose 是否显示关闭按钮
 * @property {boolean} alwaysScroll 始终滚动（即使文字未溢出）
 */
const props = defineProps({
  text: { type: String, default: '' },
  type: { type: String, default: 'primary' },
  direction: { type: String, default: 'left' },
  speed: { type: Number, default: 80 },
  width: { type: String, default: '100%' },
  height: { type: String, default: '36px' },
  pauseOnHover: { type: Boolean, default: true },
  showClose: { type: Boolean, default: false },
  alwaysScroll: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

const handleClose = () => emit('close')

// theme 别名映射到 primary
const normalizedType = computed(() =>
  props.type === 'theme' ? 'primary' : props.type
)

const containerRef = ref()
const contentRef = ref()
const textRef = ref()
const isReady = ref(false)

const currentPosition = ref(0)
const textSize = ref(0)
const containerSize = ref(0)
const shouldClone = ref(false)

const isHorizontal = computed(
  () => props.direction === 'left' || props.direction === 'right'
)
const isReverse = computed(
  () => props.direction === 'right' || props.direction === 'down'
)

// 监听容器尺寸变化
const { width: containerWidth, height: containerHeight } =
  useElementSize(containerRef)

// 检测鼠标悬停
const isHovered = useElementHover(containerRef)

// 是否暂停动画
const isPaused = computed(() => {
  // 未启用 alwaysScroll 且文字未超出容器时保持静止
  if (!props.alwaysScroll && textSize.value <= containerSize.value) {
    return true
  }
  return props.pauseOnHover && isHovered.value
})

const containerStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

const contentStyle = computed(() => ({
  transform: isHorizontal.value
    ? `translateX(${currentPosition.value}px)`
    : `translateY(${currentPosition.value}px)`,
  willChange: 'transform'
}))

const measureSizes = () => {
  if (!containerRef.value || !textRef.value) return

  const text = textRef.value

  if (isHorizontal.value) {
    containerSize.value = containerWidth.value
    textSize.value = text.offsetWidth
  } else {
    containerSize.value = containerHeight.value
    textSize.value = text.offsetHeight
  }

  shouldClone.value = textSize.value > containerSize.value

  // 初始居中显示
  currentPosition.value = (containerSize.value - textSize.value) / 2

  if (!isReady.value) isReady.value = true
}

const debouncedMeasure = useDebounceFn(measureSizes, 150)

let lastTimestamp = 0

// 基于 requestAnimationFrame 的滚动循环
const { pause, resume } = useRafFn(
  ({ timestamp }) => {
    if (!lastTimestamp) lastTimestamp = timestamp

    if (!isPaused.value) {
      const delta = (timestamp - lastTimestamp) / 1000
      const distance = props.speed * delta
      const spacing = textSize.value * 0.1

      currentPosition.value += isReverse.value ? distance : -distance

      // 循环边界检测
      if (isReverse.value) {
        if (currentPosition.value > containerSize.value) {
          currentPosition.value = -(textSize.value + spacing)
        }
      } else {
        if (currentPosition.value < -(textSize.value + spacing)) {
          currentPosition.value = containerSize.value
        }
      }
    }

    lastTimestamp = timestamp
  },
  { immediate: false }
)

const handleContentClick = (e) => {
  if (e.target?.tagName === 'A') e.stopPropagation()
}

watch([containerWidth, containerHeight], () => {
  debouncedMeasure()
})

watch(
  () => [props.direction, props.speed, props.text],
  () => {
    measureSizes()
    lastTimestamp = 0
  }
)

const { start: startMeasure } = useTimeoutFn(() => {
  measureSizes()
  resume()
}, 100)

onMounted(() => {
  startMeasure()
})

onBeforeUnmount(() => {
  pause()
})
</script>

<style lang="scss" scoped>
.text-scroll {
  --ts-color: var(--color-primary);

  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
  font-size: 14px;
  color: var(--ts-color);
  background-color: color-mix(
    in srgb,
    var(--ts-color) 8%,
    var(--color-bg-card)
  );
  border: 1px solid color-mix(in srgb, var(--ts-color) 45%, transparent);
  border-radius: var(--radius-sm);

  &--success {
    --ts-color: var(--color-success);
  }

  &--warning {
    --ts-color: var(--color-warning);
  }

  &--danger {
    --ts-color: var(--color-danger);
  }

  &--info {
    --ts-color: var(--color-info);
  }

  &__side {
    position: absolute;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 100%;
    background-color: color-mix(
      in srgb,
      var(--ts-color) 12%,
      var(--color-bg-card)
    );

    &--left {
      left: 0;
    }

    &--right {
      right: 0;
      cursor: pointer;
    }
  }

  &__content {
    display: inline-block;
    padding: 0 36px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.6s;

    &.is-ready {
      opacity: 1;
    }

    &.is-vertical {
      display: flex;
      flex-direction: column;
    }

    :deep(a) {
      color: var(--color-danger);

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__text {
    display: inline-block;

    &--clone {
      margin-left: 2em;
    }
  }
}
</style>
