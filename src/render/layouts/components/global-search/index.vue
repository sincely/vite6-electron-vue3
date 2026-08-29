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
      :width="640"
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
        placeholder="搜索页面名称或路径"
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

      <ElScrollbar ref="scrollbarRef" class="search-body" max-height="380px">
        <p v-if="showHistoryTitle" class="search-history-title">搜索历史</p>

        <!-- 搜索结果 / 搜索历史 -->
        <div
          v-for="(item, index) in displayList"
          :key="item.path"
          class="search-item"
          :class="{ 'is-active': activeIndex === index }"
          @click="goTo(item)"
          @mouseenter="handleMouseEnter(index)"
        >
          <div class="search-item__main">
            <p class="search-item__title">
              <template v-for="(seg, si) in highlight(item.title)" :key="si">
                <mark v-if="seg.hit" class="search-item__mark">
                  {{ seg.text }}
                </mark>
                <span v-else>{{ seg.text }}</span>
              </template>
            </p>
            <p class="search-item__path">
              <template v-for="(crumb, ci) in breadcrumbOf(item)" :key="ci">
                <span v-if="ci" class="search-item__sep">/</span>
                <span class="search-item__crumb">
                  <template v-for="(seg, si) in highlight(crumb)" :key="si">
                    <mark v-if="seg.hit" class="search-item__mark">
                      {{ seg.text }}
                    </mark>
                    <span v-else>{{ seg.text }}</span>
                  </template>
                </span>
              </template>
            </p>
          </div>
          <Icon
            v-show="activeIndex === index"
            icon="lucide:corner-down-left"
            class="search-item__enter"
            width="15"
          />
          <span
            v-if="!trimmedKeyword"
            class="search-item__remove"
            title="删除记录"
            @click.stop="removeHistory(index)"
          >
            <SvgIcon icon-class="close" width="12px" height="12px" />
          </span>
        </div>

        <!-- 空状态 -->
        <div v-if="!displayList.length" class="search-empty">
          {{
            trimmedKeyword
              ? '未找到相关菜单'
              : '可搜索页面名称或路径，快速定位菜单'
          }}
        </div>
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
              <Icon icon="lucide:chevron-up" width="12" />
            </span>
            <span class="search-footer__key">
              <Icon icon="lucide:chevron-down" width="12" />
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
import { asyncRouteTree } from '@/router'
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

// 拼接路由完整路径（与 router/index.js 的扁平化规则保持一致）
const joinRoutePath = (parentPath, routePath) => {
  if (!routePath) return parentPath || '/'
  if (routePath.startsWith('/')) return routePath
  return `${parentPath}/${routePath}`.replace(/\/+/g, '/')
}

// 菜单数据源：递归路由树，收集可搜索菜单项及其面包屑链路
const menuList = computed(() => {
  const list = []

  const walk = (routes, parentPath, ancestors) => {
    routes.forEach((route) => {
      const path = joinRoutePath(parentPath, route.path)
      const title = route.meta?.title
      const chain = title ? [...ancestors, title] : ancestors

      if (title && route.name && !route.meta?.noLayout) {
        // 页面可见性：过滤当前角色无权访问的路由
        const roles = route.meta?.roles
        const roleAllowed =
          !roles?.length || roles.some((role) => userStore.roles.includes(role))

        if (roleAllowed && !list.some((item) => item.path === path)) {
          list.push({ title, path, breadcrumb: chain })
        }
      }

      if (route.children?.length) {
        walk(route.children, path, chain)
      }
    })
  }

  walk(asyncRouteTree, '', [])
  return list
})

const menuPathMap = computed(
  () => new Map(menuList.value.map((item) => [item.path, item]))
)

// 匹配评分：标题前缀 > 标题包含 > 面包屑包含 > 路径包含，未命中为 Infinity
const matchScore = (item, kw) => {
  const title = item.title.toLowerCase()
  if (title.startsWith(kw)) return 0
  if (title.includes(kw)) return 1
  if (item.breadcrumb.some((crumb) => crumb.toLowerCase().includes(kw))) {
    return 2
  }
  if (item.path.toLowerCase().includes(kw)) return 3
  return Infinity
}

// 搜索结果（按匹配评分升序）
const searchResult = computed(() => {
  const kw = trimmedKeyword.value
  if (!kw) return []

  return menuList.value
    .map((item) => ({ item, score: matchScore(item, kw) }))
    .filter(({ score }) => score !== Infinity)
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item)
})

// 当前展示列表：有关键字为搜索结果，否则为历史记录
const displayList = computed(() => {
  return trimmedKeyword.value ? searchResult.value : searchStore.searchHistory
})

const showHistoryTitle = computed(
  () => !trimmedKeyword.value && searchStore.searchHistory.length > 0
)

// 将文本按关键字拆分为高亮/普通片段
const highlight = (text) => {
  const kw = trimmedKeyword.value
  if (!kw || !text) return [{ text, hit: false }]

  const segments = []
  const lower = text.toLowerCase()
  let cursor = 0
  let index = lower.indexOf(kw)

  while (index !== -1) {
    if (index > cursor) {
      segments.push({ text: text.slice(cursor, index), hit: false })
    }
    segments.push({ text: text.slice(index, index + kw.length), hit: true })
    cursor = index + kw.length
    index = lower.indexOf(kw, cursor)
  }

  segments.push({ text: text.slice(cursor), hit: false })
  return segments
}

// 面包屑：结果项自带链路；历史记录按 path 回填，兜底为标题本身
const breadcrumbOf = (item) => {
  if (item.breadcrumb?.length) return item.breadcrumb
  return menuPathMap.value.get(item.path)?.breadcrumb ?? [item.title]
}

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
  if (!displayList.value.length) return
  setKeyboardNavigating()
  activeIndex.value =
    (activeIndex.value - 1 + displayList.value.length) %
    displayList.value.length
  scrollToActiveItem()
}

const highlightNext = () => {
  if (!displayList.value.length) return
  setKeyboardNavigating()
  activeIndex.value = (activeIndex.value + 1) % displayList.value.length
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
  const item = displayList.value[activeIndex.value]
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
    min-height: 240px;
    margin-top: 12px;
  }

  .search-history-title {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .search-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px 14px;
    margin-top: 8px;
    cursor: pointer;
    background: color-mix(in srgb, var(--color-bg-input), transparent 40%);
    border-radius: var(--radius-md);
    transition:
      background 0.15s ease,
      color 0.15s ease;

    &:first-of-type {
      margin-top: 0;
    }

    &__main {
      flex: 1;
      min-width: 0;
    }

    &__title {
      margin: 0;
      overflow: hidden;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__path {
      margin: 4px 0 0;
      overflow: hidden;
      font-size: 12px;
      color: var(--color-text-muted);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__sep {
      margin: 0 6px;
      color: var(--color-text-muted);
    }

    &__mark {
      padding: 0 2px;
      color: #1f2937;
      background: #f5df7a;
      border-radius: 3px;
    }

    &__enter {
      flex-shrink: 0;
    }

    &__remove {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--color-text-muted);
      border-radius: 50%;
      transition: all 0.15s ease;

      &:hover {
        color: var(--color-danger);
        background: color-mix(in srgb, var(--color-danger), transparent 85%);
      }
    }

    &.is-active {
      background: color-mix(in srgb, var(--color-primary), transparent 20%);

      .search-item__title {
        color: #fff;
      }

      .search-item__path,
      .search-item__sep,
      .search-item__remove {
        color: rgb(255 255 255 / 75%);
      }

      .search-item__mark {
        color: #1f2937;
      }
    }
  }

  .search-empty {
    padding: 72px 0;
    font-size: 14px;
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
