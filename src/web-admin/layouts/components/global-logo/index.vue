<template>
  <div
    class="logo-block"
    :class="{ 'is-top-mode': isTopMenu }"
    title="回到首页"
    @click="goHome"
  >
    <img src="@/assets/bar/app.png" class="logo-block__img" alt="logo" />
    <span
      class="logo-block__name"
      :class="{
        'is-hidden': (appStore.sidebarCollapsed || isDual) && !isTopMenu
      }"
    >
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
  align-items: center;
  height: 74px;
  padding: 20px 16px 0;
  cursor: pointer;
  transition: padding $transition;

  &:hover .logo-block__img {
    transform: scale(1.06);
  }

  &.is-mac {
    height: 80px;

    // 侧边栏模式：logo 区域作为窗口拖拽区域（配合 hiddenInset）
    &:not(.is-top-mode) {
      -webkit-app-region: drag;
    }
  }

  &.is-top-mode {
    height: 100%;
    padding: 0;
    padding: 0 16px;
    -webkit-app-region: drag;

    &.is-mac {
      height: 100%;
    }
  }

  &__img {
    flex-shrink: 0;
    width: 42px;
    height: 42px;

    // 拖拽区（-webkit-app-region: drag）会吞掉 click 事件，
    // 图标与名称标记为 no-drag 保证可点击，外围空白处仍可拖拽窗口
    -webkit-app-region: no-drag;
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
    -webkit-app-region: no-drag;
    transition:
      opacity $transition,
      width $transition;

    &.is-hidden {
      width: 0;
      opacity: 0;
    }
  }
}
</style>
