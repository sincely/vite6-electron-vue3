<!-- 右键菜单 -->
<template>
  <Teleport to="body">
    <Transition name="context-menu" @before-enter="onBeforeEnter">
      <div
        v-if="visible"
        ref="menuElement"
        :class="[
          'context-menu',
          {
            'context-menu--submenu-left': submenuDirection === 'left',
            'context-menu--submenu-up': submenuVertical === 'up'
          }
        ]"
        :style="menuStyle"
        @click.stop
        @contextmenu.prevent.stop
      >
        <ul class="context-menu__list" :style="menuListStyle">
          <template v-for="item in menuItems" :key="item.key">
            <!-- 普通菜单项 -->
            <li
              v-if="!item.children"
              class="context-menu__item"
              :class="{
                'is-disabled': item.disabled,
                'has-line': item.showLine
              }"
              :style="menuItemStyle"
              @click="handleMenuClick(item)"
            >
              <Icon
                v-if="item.icon"
                :icon="item.icon"
                class="context-menu__icon"
                width="16"
                height="16"
              />
              <span class="context-menu__label">{{ item.label }}</span>
            </li>

            <!-- 子菜单 -->
            <li
              v-else
              class="context-menu__item context-menu__item--submenu"
              :style="menuItemStyle"
            >
              <div class="context-menu__submenu-title">
                <Icon
                  v-if="item.icon"
                  :icon="item.icon"
                  class="context-menu__icon"
                  width="16"
                  height="16"
                />
                <span class="context-menu__label">{{ item.label }}</span>
                <Icon
                  icon="ri:arrow-right-s-line"
                  class="context-menu__arrow"
                  width="16"
                  height="16"
                />
              </div>
              <ul class="context-menu__submenu" :style="submenuListStyle">
                <li
                  v-for="child in item.children"
                  :key="child.key"
                  class="context-menu__item context-menu__item--child"
                  :class="{
                    'is-disabled': child.disabled,
                    'has-line': child.showLine
                  }"
                  :style="menuItemStyle"
                  @click="handleMenuClick(child)"
                >
                  <Icon
                    v-if="child.icon"
                    :icon="child.icon"
                    class="context-menu__icon"
                    width="16"
                    height="16"
                  />
                  <span class="context-menu__label">{{ child.label }}</span>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineOptions({ name: 'ContextMenu' })

/**
 * 右键菜单
 * 菜单项结构：{ key, label, icon?, disabled?, showLine?, children? }
 * @property {Array} menuItems 菜单项配置
 * @property {number} menuWidth 菜单宽度
 * @property {number} submenuWidth 子菜单宽度
 * @property {number} itemHeight 菜单项高度
 * @property {number} boundaryDistance 边界距离
 * @property {number} menuPadding 菜单内边距
 * @property {number} itemPaddingX 菜单项水平内边距
 * @property {number} borderRadius 菜单圆角
 * @property {number} animationDuration 动画持续时间
 */
const props = defineProps({
  menuItems: { type: Array, default: () => [] },
  menuWidth: { type: Number, default: 120 },
  submenuWidth: { type: Number, default: 150 },
  itemHeight: { type: Number, default: 32 },
  boundaryDistance: { type: Number, default: 10 },
  menuPadding: { type: Number, default: 5 },
  itemPaddingX: { type: Number, default: 6 },
  borderRadius: { type: Number, default: 6 },
  animationDuration: { type: Number, default: 100 }
})

const emit = defineEmits(['select', 'show', 'hide'])

const visible = ref(false)
const position = ref({ x: 0, y: 0 })
const menuElement = ref()
const submenuDirection = ref('right')
const submenuVertical = ref('down')
const lastTrigger = ref(null)

// 用于清理定时器和事件监听器
let showTimer = null
let eventListenersAdded = false

const hasSubmenu = computed(() =>
  props.menuItems.some(
    (item) => Array.isArray(item.children) && item.children.length > 0
  )
)

const menuStyle = computed(() => ({
  position: 'fixed',
  left: `${position.value.x}px`,
  top: `${position.value.y}px`,
  zIndex: 2000,
  width: `${Math.max(1, props.menuWidth)}px`,
  maxWidth: `calc(100vw - ${props.boundaryDistance * 2}px)`,
  borderRadius: `${props.borderRadius}px`
}))

const menuListStyle = computed(() => ({
  padding: `${props.menuPadding}px`
}))

const menuItemStyle = computed(() => ({
  height: `${props.itemHeight}px`,
  padding: `0 ${props.itemPaddingX}px`
}))

const submenuListStyle = computed(() => ({
  minWidth: `${props.submenuWidth}px`,
  maxWidth: `calc(100vw - ${props.boundaryDistance * 2}px)`,
  padding: `${props.menuPadding}px 0`,
  borderRadius: `${props.borderRadius}px`
}))

// 计算菜单高度（用于边界检测）
const calculateMenuHeight = () => {
  let totalHeight = props.menuPadding * 2

  props.menuItems.forEach((item) => {
    totalHeight += props.itemHeight
    if (item.showLine) totalHeight += 10
  })

  return totalHeight
}

// 位置计算：优先显示在鼠标右下侧，空间不足时翻转。
// 预留子菜单宽度，避免子菜单出现在屏幕外。
const calculatePosition = (e, measuredSize = {}) => {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight
  const boundary = props.boundaryDistance
  const menuWidth = Math.min(
    measuredSize.width || props.menuWidth,
    Math.max(1, screenWidth - boundary * 2)
  )
  const menuHeight = Math.min(
    measuredSize.height || calculateMenuHeight(),
    Math.max(1, screenHeight - boundary * 2)
  )
  const submenuWidth = hasSubmenu.value ? props.submenuWidth : 0

  let x = e.clientX
  let y = e.clientY

  const canOpenRight = x + menuWidth + submenuWidth <= screenWidth - boundary
  submenuDirection.value = canOpenRight ? 'right' : 'left'
  if (!canOpenRight) {
    x -= menuWidth
  }

  const canOpenDown = y + menuHeight <= screenHeight - boundary
  submenuVertical.value = canOpenDown ? 'down' : 'up'
  if (!canOpenDown) {
    y = screenHeight - menuHeight - boundary
  }

  x = Math.max(boundary, Math.min(x, screenWidth - menuWidth - boundary))
  y = Math.max(boundary, Math.min(y, screenHeight - menuHeight - boundary))

  return { x, y }
}

const handleDocumentClick = (e) => {
  if (menuElement.value?.contains(e.target)) return
  hide()
}

const handleDocumentContextmenu = (e) => {
  if (!menuElement.value?.contains(e.target)) hide()
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') hide()
}

const addEventListeners = () => {
  if (eventListenersAdded) return
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('contextmenu', handleDocumentContextmenu)
  document.addEventListener('keydown', handleKeydown)
  eventListenersAdded = true
}

const removeEventListeners = () => {
  if (!eventListenersAdded) return
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('contextmenu', handleDocumentContextmenu)
  document.removeEventListener('keydown', handleKeydown)
  eventListenersAdded = false
}

const refreshPosition = () => {
  if (!visible.value || !lastTrigger.value) return
  const rect = menuElement.value?.getBoundingClientRect()
  position.value = calculatePosition(lastTrigger.value, {
    width: rect?.width,
    height: rect?.height
  })
}

/** 在鼠标位置显示菜单 */
const show = (e) => {
  if (!e || typeof e.clientX !== 'number' || typeof e.clientY !== 'number') {
    return
  }

  e.preventDefault()
  e.stopPropagation()

  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }

  lastTrigger.value = {
    clientX: e.clientX,
    clientY: e.clientY
  }
  position.value = calculatePosition(lastTrigger.value)
  visible.value = true
  emit('show')

  // v-if 首次挂载后再用真实尺寸修正位置，解决长标签、字体缩放和窗口边缘场景。
  nextTick(refreshPosition)

  // 延迟添加事件监听器，避免立即触发关闭
  showTimer = window.setTimeout(() => {
    if (visible.value) addEventListeners()
    showTimer = null
  }, 50)
}

const hide = () => {
  if (!visible.value && !showTimer) return

  visible.value = false
  lastTrigger.value = null
  emit('hide')

  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }

  removeEventListeners()
}

const handleMenuClick = (item) => {
  if (item.disabled) return
  emit('select', item)
  hide()
}

const onBeforeEnter = (el) => {
  el.style.transformOrigin = 'top left'
}

onUnmounted(() => {
  removeEventListeners()
  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }
})

useEventListener(window, 'resize', refreshPosition)
useEventListener(window, 'scroll', hide, true)

defineExpose({
  show,
  hide,
  visible: computed(() => visible.value)
})
</script>

<style lang="scss" scoped>
.context-menu {
  overflow: visible;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: v-bind('props.borderRadius + "px"');
  box-shadow: var(--shadow-lg);

  &__list {
    margin: 0;
    list-style: none;
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--color-text-primary);
    cursor: pointer;
    user-select: none;
    border-radius: 4px;
    transition: background-color 0.15s;

    &:hover {
      background-color: var(--color-bg-hover);
    }

    &.has-line {
      margin-bottom: 10px;

      &::after {
        position: absolute;
        right: 0;
        bottom: -5px;
        left: 0;
        height: 1px;
        content: '';
        background-color: var(--color-border);
      }
    }

    &.is-disabled {
      color: var(--el-text-color-disabled);
      cursor: not-allowed;

      &:hover {
        background-color: transparent;
      }

      .context-menu__icon,
      .context-menu__label {
        color: var(--el-text-color-disabled);
      }
    }

    &--submenu:hover {
      .context-menu__submenu {
        display: block;
      }

      .context-menu__arrow {
        transform: rotate(90deg);
      }
    }

    &--child {
      margin: 0 6px;
    }
  }

  &__icon {
    flex-shrink: 0;
    margin-right: 8px;
    color: var(--color-text-secondary);
  }

  &__label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__submenu-title {
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__arrow {
    margin-left: auto;
    color: var(--color-text-muted);
    transition: transform 0.15s;
  }

  &__submenu {
    position: absolute;
    top: 0;
    left: 100%;
    z-index: 2001;
    display: none;
    width: max-content;
    min-width: max-content;
    max-width: calc(100vw - 20px);
    margin: 0;
    list-style: none;
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
  }

  &--submenu-left {
    .context-menu__submenu {
      right: 100%;
      left: auto;
    }

    .context-menu__item--submenu:hover .context-menu__arrow {
      transform: rotate(180deg);
    }
  }

  &--submenu-up {
    .context-menu__submenu {
      top: auto;
      bottom: 0;
    }
  }
}

/* 动画样式 */
.context-menu-enter-active,
.context-menu-leave-active {
  transition: all v-bind('props.animationDuration + "ms"') ease-out;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.context-menu-enter-to,
.context-menu-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
