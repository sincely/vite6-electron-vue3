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

    <nav ref="menuNavRef" class="top-menu">
      <div
        class="top-menu-inner"
        :style="{ transform: `translateX(-${scrollLeft}px)` }"
      >
        <div
          v-for="item in mainItems"
          :key="item.id"
          class="top-menu-item"
          :class="{ active: isParentActive(item) }"
          @click="handleNav(item)"
          @mouseenter="onItemEnter"
          @mouseleave="onItemLeave"
        >
          <Icon
            v-if="item.icon"
            :icon="`lucide:${item.icon}`"
            class="menu-icon"
            width="16px"
            height="16px"
          />
          <span>{{ item.label }}</span>
          <span v-if="item.showBadge" class="menu-badge"></span>
          <span v-else-if="item.showTextBadge" class="menu-text-badge">
            {{ item.showTextBadge }}
          </span>

          <!-- 二级菜单 Dropdown (仅非混合模式显示) -->
          <div v-if="item.children?.length && !isTopMixed" class="top-submenu">
            <div
              v-for="child in item.children"
              :key="child.id"
              class="top-submenu-item"
              :class="{
                active: child.route === route.path,
                'has-flyout': child.children?.length
              }"
              @click.stop="handleLeafNav(firstLeaf(child))"
            >
              <Icon
                v-if="child.icon"
                :icon="`lucide:${child.icon}`"
                class="top-submenu-icon"
                width="14px"
                height="14px"
              />
              <span>{{ child.label }}</span>
              <span v-if="child.showBadge" class="menu-badge"></span>
              <span v-else-if="child.showTextBadge" class="menu-text-badge">
                {{ child.showTextBadge }}
              </span>
              <Icon
                v-if="child.link"
                icon="lucide:arrow-up-right"
                class="top-submenu-icon"
                width="12px"
                height="12px"
              />

              <!-- 三级菜单 Flyout（悬停展开） -->
              <Icon
                v-if="child.children?.length"
                icon="lucide:chevron-right"
                class="flyout-arrow"
                width="12px"
                height="12px"
              />
              <div v-if="child.children?.length" class="top-submenu-flyout">
                <div
                  v-for="leaf in child.children"
                  :key="leaf.id"
                  class="top-submenu-item"
                  :class="{ active: leaf.route === route.path }"
                  @click.stop="handleLeafNav(leaf)"
                >
                  <Icon
                    v-if="leaf.icon"
                    :icon="`lucide:${leaf.icon}`"
                    class="top-submenu-icon"
                    width="14px"
                    height="14px"
                  />
                  <span>{{ leaf.label }}</span>
                  <span v-if="leaf.showBadge" class="menu-badge"></span>
                  <span v-else-if="leaf.showTextBadge" class="menu-text-badge">
                    {{ leaf.showTextBadge }}
                  </span>
                  <Icon
                    v-if="leaf.link"
                    icon="lucide:arrow-up-right"
                    class="top-submenu-icon"
                    width="12px"
                    height="12px"
                  />
                </div>
              </div>
            </div>
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
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/store/modules/app'
import { visibleMenuItems, containsRoute, firstLeaf } from '@/config/menu'
import { openExternalLink } from '@/utils/openLink'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isTopMixed = computed(() => appStore.layoutMode === 'top-mixed')
const mainItems = computed(() =>
  visibleMenuItems.value.filter((item) => !item.footer)
)

// 任一层级后代激活时，一级菜单保持高亮
const isParentActive = (item) => containsRoute(item, route.path)

// 叶子菜单点击：外链唤起系统浏览器（声明 iframe 的内嵌页除外），否则应用内路由跳转
const handleLeafNav = (leaf) => {
  if (!leaf) return
  if (leaf.link && !leaf.iframe) return openExternalLink(leaf.link)
  router.push(leaf.route).catch(() => {})
}

const handleNav = (item) => {
  if (isTopMixed.value) {
    // top-mixed 模式：点击一级菜单导航到其第一个叶子页面，子菜单由 MixedSubmenu 组件显示
    handleLeafNav(firstLeaf(item) || item)
  } else if (item.children?.length) {
    // top 模式：有子菜单的项，点击导航到第一个叶子页面路由
    handleLeafNav(firstLeaf(item))
  } else {
    handleLeafNav(item)
  }
}

// ─── 横向滚动溢出控制（transform 方式，避免 overflow 裁剪下拉菜单） ───
const menuNavRef = ref(null)
const scrollLeft = ref(0)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const SCROLL_STEP = 200 // 每次点击箭头滚动的像素距离

// 二级菜单边界对齐：悬停时计算居中偏移并夹取到 .top-menu 可视范围内，
// 避免首个/末个一级菜单的下拉被 overflow-x: clip 横向截断
const hoveredItemEl = ref(null)

const positionSubmenu = (itemEl) => {
  const submenu = itemEl && itemEl.querySelector('.top-submenu')
  const menu = menuNavRef.value
  if (!submenu || !menu) return
  const subWidth = submenu.offsetWidth
  if (!subWidth) return
  const itemRect = itemEl.getBoundingClientRect()
  const menuRect = menu.getBoundingClientRect()
  const itemLeftInMenu = itemRect.left - menuRect.left
  let leftPx = (itemRect.width - subWidth) / 2 // 居中偏移
  const minLeft = -itemLeftInMenu // 不越过菜单左边界
  const maxLeft = menu.clientWidth - itemLeftInMenu - subWidth // 不越过右边界
  if (leftPx < minLeft) leftPx = minLeft
  else if (leftPx > maxLeft) leftPx = maxLeft
  submenu.style.left = `${leftPx}px`
  submenu.style.transform = 'translateY(10px)'
}

const onItemEnter = (e) => {
  const el = e.currentTarget
  if (!el.querySelector('.top-submenu')) return // 无二级菜单不处理
  hoveredItemEl.value = el
  positionSubmenu(el)
}

const onItemLeave = () => {
  hoveredItemEl.value = null
}

const updateScrollState = () => {
  const el = menuNavRef.value
  if (!el) return
  const inner = el.querySelector('.top-menu-inner')
  if (!inner) return

  const containerWidth = el.clientWidth
  const contentWidth = inner.scrollWidth
  const maxScroll = Math.max(0, contentWidth - containerWidth)

  // 裁剪 scrollLeft 到有效范围
  if (scrollLeft.value > maxScroll) {
    scrollLeft.value = maxScroll
  }

  canScrollLeft.value = scrollLeft.value > 4
  canScrollRight.value = scrollLeft.value < maxScroll - 4

  // 滚动或尺寸变化后，重新对齐当前展开的二级菜单
  if (hoveredItemEl.value) positionSubmenu(hoveredItemEl.value)
}

const scrollByDir = (dir) => {
  const el = menuNavRef.value
  if (!el) return
  const inner = el.querySelector('.top-menu-inner')
  if (!inner) return

  const containerWidth = el.clientWidth
  const contentWidth = inner.scrollWidth
  const maxScroll = Math.max(0, contentWidth - containerWidth)

  const newLeft = scrollLeft.value + dir * SCROLL_STEP
  scrollLeft.value = Math.max(0, Math.min(newLeft, maxScroll))
  nextTick(updateScrollState)
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
watch([visibleMenuItems, isTopMixed], () => nextTick(updateScrollState))
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
  -webkit-app-region: no-drag;
}

.top-menu {
  display: flex;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: visible;
  overflow-x: clip; // 裁剪横向溢出，但不创建滚动容器（避免 overflow-y 被强制变为 auto）
  -webkit-app-region: no-drag;
}

.top-menu-inner {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 100%;
  white-space: nowrap;
  will-change: transform;
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
  -webkit-app-region: no-drag;

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
  transition:
    opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
  -webkit-app-region: no-drag;

  &:not(:last-child) {
    margin-bottom: 2px;
  }

  // 悬停二级分组项时向右展开三级 flyout
  &:hover > .top-submenu-flyout {
    visibility: visible;
    opacity: 1;
    transform: translateX(0);
  }

  &.has-flyout {
    padding-right: 10px;
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

// ─── 三级菜单 Flyout（悬停二级分组项时向右展开） ──────────────
.flyout-arrow {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--color-text-muted);
}

.top-submenu-flyout {
  position: absolute;
  top: -9px;
  left: calc(100% + 6px);
  z-index: 101;
  min-width: 160px;
  padding: 8px;
  visibility: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(6px);

  // 隐形感应桥：连接父级菜单项与 flyout，避免鼠标移动途中菜单消失
  &::before {
    position: absolute;
    top: 0;
    left: -8px;
    width: 8px;
    height: 100%;
    content: '';
    background: transparent;
  }
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
