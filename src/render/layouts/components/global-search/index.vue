<template>
  <div class="global-search">
    <!-- 搜索触发按钮 -->
    <button class="search-trigger" title="搜索菜单" @click="openDialog">
      <SvgIcon
        icon-class="search"
        class="search-trigger__icon"
        width="14px"
        height="14px"
      />
      <span class="search-trigger__text">搜索</span>
      <span class="search-trigger__kbd">{{ isMac() ? '⌘' : 'Ctrl' }} K</span>
    </button>

    <!-- 搜索弹窗 -->
    <ElDialog
      v-model="visible"
      :width="600"
      :show-close="false"
      :lock-scroll="false"
      append-to-body
      modal-class="search-modal"
      @close="handleClose"
      @opened="focusInput"
    >
      <ElInput
        ref="searchInputRef"
        v-model="keyword"
        class="search-input"
        placeholder="搜索菜单..."
      >
        <template #prefix>
          <SvgIcon icon-class="search" width="15px" height="15px" />
        </template>
        <template #suffix>
          <span class="search-input__enter">
            <Icon icon="lucide:corner-down-left" width="13" />
          </span>
        </template>
      </ElInput>

      <ElScrollbar ref="scrollbarRef" class="search-body" max-height="360px">
        <!-- 搜索结果 -->
        <template v-if="trimmedKeyword">
          <div
            v-for="(item, index) in searchResult"
            :key="item.path"
            class="search-item"
            :class="{ 'is-active': activeIndex === index }"
            @click="goTo(item)"
            @mouseenter="handleMouseEnter(index)"
          >
            <span class="search-item__title">{{ item.title }}</span>
            <Icon
              v-show="activeIndex === index"
              icon="lucide:corner-down-left"
              class="search-item__enter"
              width="14"
            />
            <!-- <span class="search-item__path">{{ item.path }}</span> -->
          </div>
          <div v-if="!searchResult.length" class="search-empty">
            未找到相关菜单
          </div>
        </template>

        <!-- 搜索历史 -->
        <template v-else-if="searchStore.searchHistory.length">
          <p class="search-history-title">搜索历史</p>
          <div
            v-for="(item, index) in searchStore.searchHistory"
            :key="item.path"
            class="search-item"
            :class="{ 'is-active': activeIndex === index }"
            @click="goTo(item)"
            @mouseenter="handleMouseEnter(index)"
          >
            <span class="search-item__title">{{ item.title }}</span>
            <span class="search-item__path">{{ item.path }}</span>
            <span
              class="search-item__remove"
              title="删除记录"
              @click.stop="removeHistory(index)"
            >
              <SvgIcon icon-class="close" width="12px" height="12px" />
            </span>
          </div>
        </template>

        <!-- 无关键字且无历史 -->
        <div v-else class="search-empty">输入关键字搜索菜单</div>
      </ElScrollbar>

      <template #footer>
        <div class="search-footer">
          <div class="search-footer__item">
            <span class="search-footer__key">
              <Icon icon="lucide:corner-down-left" width="12" />
            </span>
            <span>选择</span>
          </div>
          <div class="search-footer__item">
            <span class="search-footer__key">
              <Icon icon="ri:arrow-up-down-fill" width="12" />
            </span>
            <span>切换</span>
          </div>
          <div class="search-footer__item">
            <span class="search-footer__key search-footer__key--text">ESC</span>
            <span>关闭</span>
          </div>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { asyncRoutes } from '@/router'
import { useSearchStore } from '@/store/modules/search'
import { useUserStore } from '@/store/modules/user'
import { isMac } from '@/utils/platform'

const router = useRouter()
const searchStore = useSearchStore()
const userStore = useUserStore()

const visible = ref(false)
const keyword = ref('')
const activeIndex = ref(0)
const searchInputRef = ref(null)
const scrollbarRef = ref(null)
// 是否正在键盘导航（短暂置位，防止高亮被 hover 抢占）
const isKeyboardNavigating = ref(false)

const trimmedKeyword = computed(() => keyword.value.trim().toLowerCase())

// 菜单数据源：扁平化路由中可搜索的菜单项
const menuList = computed(() => {
  const map = new Map()

  asyncRoutes.forEach((route) => {
    const title = route.meta?.title
    const path = route.path

    if (!title || !path) return
    if (route.meta?.noLayout) return
    if (!route.name) return
    // 页面可见性：过滤当前角色无权访问的路由
    const roles = route.meta?.roles
    if (
      roles?.length &&
      !roles.some((role) => userStore.roles.includes(role))
    ) {
      return
    }

    if (!map.has(path)) {
      map.set(path, { title, path })
    }
  })

  return Array.from(map.values())
})

// 搜索结果
const searchResult = computed(() => {
  const kw = trimmedKeyword.value
  if (!kw) return []

  return menuList.value.filter((item) => {
    return (
      item.title.toLowerCase().includes(kw) ||
      item.path.toLowerCase().includes(kw)
    )
  })
})

// 当前激活列表（参与键盘导航）：有关键字为搜索结果，否则为历史记录
const activeList = computed(() => {
  return trimmedKeyword.value ? searchResult.value : searchStore.searchHistory
})

watch(trimmedKeyword, () => {
  activeIndex.value = 0
})

// 全局快捷键与弹窗内按键操作
useEventListener(document, 'keydown', (event) => {
  const isCommandKey = isMac() ? event.metaKey : event.ctrlKey

  // Ctrl/Cmd + K 打开搜索弹窗
  if (isCommandKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (!visible.value) openDialog()
    return
  }

  if (!visible.value) return

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlightPrev()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    highlightNext()
  } else if (event.key === 'Enter') {
    event.preventDefault()
    selectActive()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    visible.value = false
  }
})

const openDialog = () => {
  visible.value = true
}

const focusInput = () => {
  searchInputRef.value?.focus()
}

const handleClose = () => {
  keyword.value = ''
  activeIndex.value = 0
}

const highlightPrev = () => {
  if (!activeList.value.length) return
  setKeyboardNavigating()
  activeIndex.value =
    (activeIndex.value - 1 + activeList.value.length) % activeList.value.length
  scrollToActiveItem()
}

const highlightNext = () => {
  if (!activeList.value.length) return
  setKeyboardNavigating()
  activeIndex.value = (activeIndex.value + 1) % activeList.value.length
  scrollToActiveItem()
}

const setKeyboardNavigating = () => {
  isKeyboardNavigating.value = true
  setTimeout(() => {
    isKeyboardNavigating.value = false
  }, 100)
}

const handleMouseEnter = (index) => {
  if (isKeyboardNavigating.value) return
  activeIndex.value = index
}

// 高亮项滚动跟随
const scrollToActiveItem = () => {
  nextTick(() => {
    const wrapEl = scrollbarRef.value?.wrapRef
    if (!wrapEl) return

    const items = wrapEl.querySelectorAll('.search-item')
    const activeEl = items[activeIndex.value]
    if (!activeEl) return

    const wrapRect = wrapEl.getBoundingClientRect()
    const itemRect = activeEl.getBoundingClientRect()
    const itemTop = itemRect.top - wrapRect.top + wrapEl.scrollTop
    const itemBottom = itemTop + activeEl.offsetHeight
    const { scrollTop, clientHeight } = wrapEl

    if (itemTop < scrollTop) {
      scrollbarRef.value.setScrollTop(itemTop)
    } else if (itemBottom > scrollTop + clientHeight) {
      scrollbarRef.value.setScrollTop(itemBottom - clientHeight)
    }
  })
}

const selectActive = () => {
  const item = activeList.value[activeIndex.value]
  if (item) goTo(item)
}

const goTo = (item) => {
  visible.value = false
  searchStore.addSearchHistory(item)
  router.push(item.path)
}

const removeHistory = (index) => {
  searchStore.removeSearchHistory(index)
  // 删除后修正高亮索引
  const length = searchStore.searchHistory.length
  if (activeIndex.value >= length) {
    activeIndex.value = Math.max(0, length - 1)
  }
}
</script>

<style lang="scss" scoped>
.search-trigger {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 160px;
  height: 32px;
  padding: 0 8px 0 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: color-mix(in srgb, var(--color-bg-input), transparent 30%);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 35%);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-text-primary);
    border-color: color-mix(in srgb, var(--color-primary), transparent 50%);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-primary), transparent 88%);
  }

  &__icon {
    flex-shrink: 0;
  }

  &__text {
    line-height: 1;
  }

  &__kbd {
    padding: 2px 5px;
    font-size: 11px;
    line-height: 1;
    color: var(--color-text-muted);
    background: var(--color-bg-hover);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }
}
</style>

<style lang="scss">
// 弹窗挂载到 body，使用全局样式覆盖
.search-modal {
  background: rgb(15 23 42 / 30%);

  .el-dialog {
    max-width: calc(100vw - 32px);
    padding: 16px;
    overflow: visible;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);

    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__footer {
      padding: 0;
    }
  }

  .search-input {
    .el-input__wrapper {
      height: 46px;
      padding: 0 12px;
      background: var(--color-bg-input);
      border-radius: var(--radius-md);
      box-shadow: none;

      .el-input__inner {
        color: var(--color-text-primary);
      }

      .el-input__inner::placeholder {
        color: var(--color-text-muted);
      }

      .el-input__prefix {
        color: var(--color-text-secondary);
      }
    }

    &__enter {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      color: var(--color-text-muted);
      background: var(--color-bg-hover);
      border: 1px solid var(--color-border);
      border-radius: 4px;
    }
  }

  .search-body {
    margin-top: 12px;
  }

  .search-item {
    display: flex;
    gap: 8px;
    align-items: center;
    height: 44px;
    padding: 0 12px;
    margin-top: 8px;
    font-size: 13px;
    color: var(--color-text-primary);
    cursor: pointer;
    background: color-mix(in srgb, var(--color-bg-input), transparent 40%);
    border-radius: var(--radius-md);
    transition:
      background 0.15s ease,
      color 0.15s ease;

    &:first-child {
      margin-top: 0;
    }

    &__title {
      overflow: hidden;
      font-weight: 500;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__enter {
      flex-shrink: 0;
      margin-left: auto;
    }

    &__path {
      flex-shrink: 0;
      margin-left: auto;
      font-size: 12px;
      color: var(--color-text-muted);
    }

    &__remove {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin-left: 4px;
      color: var(--color-text-muted);
      border-radius: 50%;
      transition: all 0.15s ease;

      &:hover {
        color: var(--color-danger);
        background: color-mix(in srgb, var(--color-danger), transparent 85%);
      }
    }

    &.is-active {
      color: #fff;
      background: color-mix(in srgb, var(--color-primary), transparent 20%);

      .search-item__path,
      .search-item__remove {
        color: rgb(255 255 255 / 75%);
      }
    }
  }

  .search-history-title {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .search-empty {
    padding: 32px 0;
    font-size: 13px;
    color: var(--color-text-muted);
    text-align: center;
  }

  .search-footer {
    display: flex;
    align-items: center;
    padding-top: 12px;
    margin-top: 16px;
    border-top: 1px solid var(--color-border);

    &__item {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-right: 18px;
      font-size: 12px;
      color: var(--color-text-muted);
    }

    &__key {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 20px;
      padding: 0 4px;
      color: var(--color-text-secondary);
      background: var(--color-bg-input);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      box-shadow: 0 2px 0 var(--color-border);

      &--text {
        font-size: 10px;
        font-weight: 600;
      }
    }
  }
}

html.dark .search-modal {
  background: rgb(0 0 0 / 55%);
}
</style>
