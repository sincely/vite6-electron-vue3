<!-- 图片卡片：封面图 + 分类 + 标题 + 浏览/评论/日期 -->
<template>
  <div class="image-card" @click="handleClick">
    <div class="image-card__cover">
      <ElImage
        :src="imageUrl"
        fit="cover"
        loading="lazy"
        class="image-card__img"
      >
        <template #placeholder>
          <div class="image-card__placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </ElImage>
      <div v-if="readTime" class="image-card__read-time">
        {{ readTime }} 阅读
      </div>
    </div>

    <div class="image-card__body">
      <div v-if="category" class="image-card__category">{{ category }}</div>
      <p class="image-card__title">{{ title }}</p>
      <div class="image-card__meta">
        <span v-if="views" class="image-card__meta-item">
          <el-icon :size="16"><View /></el-icon>
          {{ views }}
        </span>
        <span v-if="comments" class="image-card__meta-item">
          <el-icon :size="16"><ChatLineRound /></el-icon>
          {{ comments }}
        </span>
        <span>{{ date }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'ImageCard' })

const props = defineProps({
  /** 图片地址 */
  imageUrl: { type: String, default: '' },
  /** 标题 */
  title: { type: String, default: '' },
  /** 分类 */
  category: { type: String, default: '' },
  /** 阅读时长 */
  readTime: { type: String, default: '' },
  /** 浏览量 */
  views: { type: Number, default: 0 },
  /** 评论数 */
  comments: { type: Number, default: 0 },
  /** 日期 */
  date: { type: String, default: '' }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props)
}
</script>

<style lang="scss" scoped>
.image-card {
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: var(--shadow-md);

    .image-card__img {
      transform: scale(1.05);
    }
  }

  &__cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    overflow: hidden;
  }

  &__img {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease-in-out;
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--color-text-muted);
    background: var(--color-bg-hover);
  }

  &__read-time {
    position: absolute;
    right: 14px;
    bottom: 14px;
    padding: 4px 8px;
    font-size: 12px;
    color: var(--color-text-primary);
    background: var(--color-bg-card);
    border-radius: 6px;
    opacity: 0.9;
  }

  &__body {
    padding: 16px;
  }

  &__category {
    display: inline-block;
    padding: 2px 8px;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--color-text-secondary);
    background: var(--color-bg-hover);
    border-radius: 6px;
  }

  &__title {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__meta {
    display: flex;
    gap: 16px;
    align-items: center;
    font-size: 12px;
    color: var(--color-text-secondary);
  }

  &__meta-item {
    display: flex;
    gap: 4px;
    align-items: center;
  }
}
</style>
