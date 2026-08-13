<!-- 基础横幅组件：标题/副标题/按钮/背景图/流星效果，支持插槽自定义 -->
<template>
  <div
    class="basic-banner"
    :class="{ 'has-decoration': decoration }"
    :style="{ height, background }"
    @click="emit('click')"
  >
    <!-- 流星效果（仅暗色模式开启） -->
    <div v-if="meteorConfig?.enabled && isDark" class="basic-banner__meteors">
      <span
        v-for="(meteor, index) in meteors"
        :key="index"
        class="meteor"
        :style="{
          top: '-60px',
          left: `${meteor.x}%`,
          animationDuration: `${meteor.speed}s`,
          animationDelay: `${meteor.delay}s`
        }"
      ></span>
    </div>

    <div class="basic-banner__content">
      <!-- title 插槽 -->
      <slot name="title">
        <p
          v-if="title"
          class="basic-banner__title"
          :style="{ color: titleColor }"
        >
          {{ title }}
        </p>
      </slot>

      <!-- subtitle 插槽 -->
      <slot name="subtitle">
        <p
          v-if="subtitle"
          class="basic-banner__subtitle"
          :style="{ color: subtitleColor }"
        >
          {{ subtitle }}
        </p>
      </slot>

      <!-- button 插槽 -->
      <slot name="button">
        <div
          v-if="buttonConfig?.show"
          class="basic-banner__button"
          :style="{
            backgroundColor: buttonColor,
            color: buttonTextColor,
            borderRadius: buttonRadius
          }"
          @click.stop="emit('buttonClick')"
        >
          {{ buttonConfig?.text }}
        </div>
      </slot>

      <!-- 默认插槽 -->
      <slot></slot>

      <!-- 背景图片 -->
      <img
        v-if="imageConfig.src"
        class="basic-banner__background-image"
        :src="imageConfig.src"
        :style="{
          width: imageConfig.width,
          bottom: imageConfig.bottom,
          right: imageConfig.right
        }"
        loading="lazy"
        alt="背景图片"
      />
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'

defineOptions({ name: 'BasicBanner' })

const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)

const props = defineProps({
  /** 横幅高度 */
  height: { type: String, default: '11rem' },
  /** 标题文本 */
  title: { type: String, default: '' },
  /** 副标题文本 */
  subtitle: { type: String, default: '' },
  /** 背景（任意 CSS background 值） */
  background: {
    type: String,
    default: 'color-mix(in srgb, var(--color-primary) 60%, transparent)'
  },
  /** 是否显示装饰效果 */
  decoration: { type: Boolean, default: true },
  /** 按钮配置 */
  buttonConfig: {
    type: Object,
    default: () => ({
      show: true,
      text: '查看',
      color: '#fff',
      textColor: '#333',
      radius: '6px'
    })
  },
  /** 流星配置 */
  meteorConfig: {
    type: Object,
    default: () => ({ enabled: false, count: 10 })
  },
  /** 背景图片配置 */
  imageConfig: {
    type: Object,
    default: () => ({ src: '', width: '12rem', bottom: '-3rem', right: '0' })
  },
  /** 标题颜色 */
  titleColor: { type: String, default: 'white' },
  /** 副标题颜色 */
  subtitleColor: { type: String, default: 'white' }
})

const emit = defineEmits(['click', 'buttonClick'])

// 按钮样式
const buttonColor = computed(() => props.buttonConfig?.color ?? '#fff')
const buttonTextColor = computed(() => props.buttonConfig?.textColor ?? '#333')
const buttonRadius = computed(() => props.buttonConfig?.radius ?? '6px')

// 流星数据
const meteors = ref([])

/**
 * 生成流星数据数组
 * @param {number} count 流星数量
 */
function generateMeteors(count) {
  const segmentWidth = 100 / count
  return Array.from({ length: count }, (_, index) => {
    const segmentStart = index * segmentWidth
    const x = segmentStart + Math.random() * segmentWidth
    const isSlow = Math.random() > 0.5
    return {
      x,
      speed: isSlow ? 5 + Math.random() * 3 : 2 + Math.random() * 2,
      delay: Math.random() * 5
    }
  })
}

onMounted(() => {
  if (props.meteorConfig?.enabled) {
    meteors.value = generateMeteors(props.meteorConfig?.count ?? 10)
  }
})
</script>

<style lang="scss" scoped>
.basic-banner {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 32px;
  overflow: hidden;
  color: #fff;
  border-radius: calc(var(--radius-lg) + 2px);

  &__content {
    position: relative;
    z-index: 1;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 600;
  }

  &__subtitle {
    position: relative;
    z-index: 10;
    margin: 0 0 24px;
    font-size: 0.9rem;
    opacity: 0.9;
  }

  &__button {
    box-sizing: border-box;
    display: inline-block;
    min-width: 80px;
    height: 32px;
    padding: 0 12px;
    font-size: 14px;
    line-height: 32px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    transition: all 0.3s;

    &:hover {
      opacity: 0.8;
    }
  }

  &__background-image {
    position: absolute;
    right: 0;
    bottom: -3rem;
    z-index: 0;
    width: 12rem;
  }

  &.has-decoration::after {
    position: absolute;
    right: -10%;
    bottom: -20%;
    width: 60%;
    height: 140%;
    content: '';
    background: rgb(255 255 255 / 10%);
    border-radius: 30%;
    transform: rotate(-20deg);
  }

  &__meteors {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .meteor {
      position: absolute;
      width: 2px;
      height: 60px;
      background: linear-gradient(
        to top,
        rgb(255 255 255 / 40%),
        rgb(255 255 255 / 10%),
        transparent
      );
      opacity: 0;
      transform-origin: top left;
      animation-name: meteor-fall;
      animation-timing-function: linear;
      animation-iteration-count: infinite;

      &::before {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 2px;
        height: 2px;
        content: '';
        background: rgb(255 255 255 / 50%);
      }
    }
  }
}

@keyframes meteor-fall {
  0% {
    opacity: 1;
    transform: translate(0, -60px) rotate(-45deg);
  }

  100% {
    opacity: 0;
    transform: translate(400px, 340px) rotate(-45deg);
  }
}

@media (width <= 640px) {
  .basic-banner {
    box-sizing: border-box;
    justify-content: flex-start;
    padding: 16px;

    &__title {
      font-size: 1.4rem;
    }

    &__background-image {
      display: none;
    }

    &.has-decoration::after {
      display: none;
    }
  }
}
</style>
