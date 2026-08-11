<template>
  <div class="top-menu-container">
    <!-- 左滚动箭头 -->
    <transition name="scroll-arrow">
      <button
        v-show="canScrollLeft"
        class="scroll-arrow scroll-arrow-left"
        title="向左滚动"
        @click="scrollByDir(-1)"
      >
        <Icon icon="lucide:chevron-left" width="16px" height="16px" />
      </button>
    </transition>

    <nav ref="menuNavRef" class="top-menu" @scroll="updateScrollState">
      <div
        v-for="item in mainItems"
        :key="item.id"
        class="top-menu-item"
        :class="{ active: isParentActive(item) }"
        @click="handleNav(item)"
      >
        <SvgIcon
          :icon-class="item.icon"
          class="menu-icon"
          width="16px"
          height="16px"
        />
        <span>{{ item.label }}</span>

        <!-- 二级菜单 Dropdown (仅非混合模式显示) -->
        <div v-if="item.children?.length && !isTopMixed" class="top-submenu">
          <div
            v-for="child in item.children"
            :key="child.id"
            class="top-submenu-item"
            :class="{ active: isChildActive(child) }"
            @click.stop="router.push(child.route)"
          >
            <Icon
              v-if="child.icon"
              :icon="`lucide:${child.icon}`"
              class="top-submenu-icon"
              width="14px"
              height="14px"
            />
            <span>{{ child.label }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- 右滚动箭头 -->
    <transition name="scroll-arrow">
      <button
        v-show="canScrollRight"
        class="scroll-arrow scroll-arrow-right"
        title="向右滚动"
        @click="scrollByDir(1)"
      >
        <Icon icon="lucide:chevron-right" width="16px" height="16px" />
      </button>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/store/modules/app'
import { menuItems } from '@/config/menu'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isTopMixed = computed(() => appStore.layoutMode === 'top-mixed')
const mainItems = menuItems.filter((item) => !item.footer)

const isParentActive = (item) => {
  const selfMatch = item.route === route.path
  const childMatch = item.children?.some((c) => c.route === route.path) ?? false
  return selfMatch || childMatch
}

const isChildActive = (child) => child.route === route.path

const handleNav = (item) => {
  if (isTopMixed.value) {
    // top-mixed 模式：点击一级菜单导航到其路由（或第一个子项），子菜单由 MixedSubmenu 组件显示
    if (item.children?.length) {
      router.push(item.children[0].route).catch(() => {})
    } else {
      router.push(item.route).catch(() => {})
    }
  } else if (!item.children?.length) {
    router.push(item.route).catch(() => {})
  }
}

// ─── 横向滚动溢出控制 ──────────────────────────────────────────
const menuNavRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const SCROLL_STEP = 200 // 每次点击箭头滚动的像素距离

const updateScrollState = () => {
  const el = menuNavRef.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

const scrollByDir = (dir) => {
  const el = menuNavRef.value
  if (!el) return
  el.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' })
}

let resizeObserver = null

onMounted(() => {
  nextTick(updateScrollState)
  if (menuNavRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(menuNavRef.value)
  }
  window.addEventListener('resize', updateScrollState)
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener('resize', updateScrollState)
})

// 菜单项或布局变化时重新检测溢出
watch([() => menuItems, isTopMixed], () => nextTick(updateScrollState))
</script>

<style lang="scss" scoped>
.top-menu-container {
  position: relative;
  display: flex;
  flex: 1;
  gap: 6px;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  height: 100%;
  margin-left: 24px;
  -webkit-app-region: drag;
}

.top-menu {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 0;
  height: 100%;
  overflow-x: auto;
  scrollbar-width: none; // Firefox
  -webkit-app-region: drag;

  &::-webkit-scrollbar {
    display: none; // Chrome / Edge / Electron
  }
}

.top-menu-item {
  position: relative;
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  height: 38px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  .menu-icon {
    color: var(--color-text-secondary);
    transition: color 0.2s ease;
  }

  &::after {
    position: absolute;
    bottom: -13px; // 距离底部的距离，根据 title-bar 高度微调
    left: 50%;
    width: 0;
    height: 3px;
    content: '';
    background: var(--color-primary);
    border-radius: 3px 3px 0 0;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-50%);
  }

  &:hover {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 40%);

    .menu-icon {
      color: var(--color-primary);
    }

    .top-submenu {
      visibility: visible;
      opacity: 1;
    }
  }

  &.active {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);

    .menu-icon {
      color: var(--color-primary);
    }

    &::after {
      width: 24px;
      opacity: 1;
    }
  }
}

.top-submenu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  z-index: 100;
  min-width: 180px;
  padding: 8px;
  visibility: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate(-50%, 10px);

  // 增加隐形感应区，防止鼠标移出时下拉菜单消失过快
  &::before {
    position: absolute;
    top: -12px;
    left: 0;
    width: 100%;
    height: 12px;
    content: '';
    background: transparent;
  }
}

.top-submenu-item {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  &:hover:not(.active) {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 20%);

    .top-submenu-icon {
      color: var(--color-primary);
    }
  }

  &.active,
  &.active:hover {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
    transform: none;

    .top-submenu-icon {
      color: var(--color-primary);
    }

    &::before {
      position: absolute;
      left: 6px;
      width: 3px;
      height: 14px;
      content: '';
      background: var(--color-primary);
      border-radius: 2px;
    }
  }
}

.top-submenu-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;
}

// ─── 滚动箭头按钮 ──────────────────────────────────────────
.scroll-arrow {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-primary);
    background: var(--color-bg-hover);
    border-color: var(--color-border-light);
  }

  &:active {
    transform: scale(0.92);
  }
}

// 箭头淡入淡出
.scroll-arrow-enter-active,
.scroll-arrow-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.scroll-arrow-enter-from,
.scroll-arrow-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
