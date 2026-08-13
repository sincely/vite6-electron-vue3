<!-- 卡片横幅组件：图标 + 标题 + 描述 + 主/取消按钮 -->
<template>
  <div class="card-banner" :style="{ height }">
    <div class="card-banner__inner">
      <div class="card-banner__image">
        <img :src="image" :alt="title" />
      </div>
      <div class="card-banner__text">
        <p class="card-banner__title">{{ title }}</p>
        <p class="card-banner__desc">{{ description }}</p>
      </div>
      <div class="card-banner__actions">
        <div
          v-if="cancelButton?.show"
          class="card-banner__btn card-banner__btn--cancel"
          :style="{
            backgroundColor: cancelButton?.color,
            color: cancelButton?.textColor
          }"
          @click="handleCancel"
        >
          {{ cancelButton?.text }}
        </div>
        <div
          v-if="button?.show"
          class="card-banner__btn"
          :style="{ backgroundColor: button?.color, color: button?.textColor }"
          @click="handleClick"
        >
          {{ button?.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import defaultIcon from '@/assets/images/3d/icon1.webp'

defineOptions({ name: 'CardBanner' })

const props = defineProps({
  /** 高度 */
  height: { type: String, default: '24rem' },
  /** 图片路径 */
  image: { type: String, default: defaultIcon },
  /** 标题文本 */
  title: { type: String, default: '' },
  /** 描述文本 */
  description: { type: String, default: '' },
  /** 主按钮配置 */
  button: {
    type: Object,
    default: () => ({
      show: true,
      text: '查看详情',
      color: 'var(--color-primary)',
      textColor: '#fff'
    })
  },
  /** 取消按钮配置 */
  cancelButton: {
    type: Object,
    default: () => ({
      show: false,
      text: '取消',
      color: 'var(--color-bg-hover)',
      textColor: 'var(--color-text-secondary)'
    })
  }
})

const emit = defineEmits(['click', 'cancel'])

const handleClick = () => emit('click')
const handleCancel = () => emit('cancel')
</script>

<style lang="scss" scoped>
.card-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px 24px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__inner {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }

  &__image {
    width: 180px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__text {
    box-sizing: border-box;
    padding: 0 16px;
  }

  &__title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__desc {
    margin: 0;
    font-size: 14px;
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__btn {
    display: inline-block;
    height: 36px;
    padding: 0 12px;
    font-size: 14px;
    line-height: 36px;
    cursor: pointer;
    user-select: none;
    background: var(--color-primary);
    border-radius: 8px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }

    &--cancel {
      background: var(--color-bg-hover);
      border: 1px solid var(--color-border);
    }
  }
}
</style>
