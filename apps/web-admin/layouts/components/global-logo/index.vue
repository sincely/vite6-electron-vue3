<template>
  <div
    class="logo-block"
    :class="{ 'is-top-mode': isTopMenu }"
    title="回到首页"
    @click="goHome"
  >
    <img src="@/assets/bar/app.png" class="logo-block__img" alt="logo" />
    <span class="logo-block__name" :class="{ 'is-hidden': isRail }">
      Lightning
    </span>
  </div>
</template>

<script setup>
import { useAppStore } from '@/store/modules/app'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()
const isTopMenu = computed(
  () => appStore.layoutMode === 'top' || appStore.layoutMode === 'top-mixed'
)
const isDual = computed(() => appStore.layoutMode === 'dual')
// 窄栏形态（侧边栏收起 / 双列菜单第一列）：仅显示图标并水平居中
const isRail = computed(
  () => (appStore.sidebarCollapsed || isDual.value) && !isTopMenu.value
)

// 点击 app 区域回到首页（工作台）
const goHome = () => {
  router.push('/desktop').catch(() => {})
}
</script>

<style lang="scss" scoped>
$transition: 0.3s cubic-bezier(0.22, 0.7, 0.2, 1);

.logo-block {
  position: relative;
  z-index: 2;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: 60px;
  padding: 0 16px;
  cursor: pointer;
  transition: padding $transition;

  &:hover .logo-block__img {
    transform: scale(1.06);
  }

  &.is-top-mode {
    justify-content: flex-start;
    height: 100%;
    padding: 0 16px;
  }

  // 窄栏形态：去掉左右留白，图标在栏内水平居中
  &.is-rail {
    justify-content: center;
    padding-right: 0;
    padding-left: 0;
  }

  &__img {
    flex-shrink: 0;
    width: 42px;
    height: 42px;
    transition: transform 0.2s ease;
  }

  &__name {
    margin-left: 12px;
    overflow: hidden;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-primary);
    text-overflow: ellipsis;
    letter-spacing: 0.3px;
    white-space: nowrap;
    opacity: 1;
    transition:
      opacity $transition,
      width $transition,
      margin-left $transition;

    // 隐藏时必须连同 margin 一起归零，
    // 否则残留的 12px 左外边距会把图标挤离中心
    &.is-hidden {
      width: 0;
      margin-left: 0;
      opacity: 0;
    }
  }
}
</style>
