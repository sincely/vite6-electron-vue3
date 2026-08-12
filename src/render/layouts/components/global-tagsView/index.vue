<template>
  <div class="tags-view-wrapper" :class="`is-style-${tagsViewStyle}`">
    <!-- 标签列表（横向滚动） -->
    <div ref="scrollRef" class="tags-view-scroll">
      <div class="tags-view-list">
        <div
          v-for="tag in tagsViewStore.visitedViews"
          :key="tag.path"
          class="tag-item"
          :class="{
            'is-active': isActive(tag),
            'is-affix': tag.affix
          }"
          @click="handleClick(tag)"
          @contextmenu.prevent="handleContextMenu($event, tag)"
        >
          <!-- Chrome 标签背景几何图形（google 风格下渲染） -->
          <ChromeTabBg v-if="tagsViewStyle === 'google'" />
          <!-- 固定指示器 -->
          <span v-if="tag.affix" class="tag-affix-dot" />
          <Icon
            v-if="tag.icon"
            :icon="`lucide:${tag.icon}`"
            class="tag-item-icon"
            width="14"
            height="14"
          />
          <span class="tag-title">{{ tag.title }}</span>
          <Icon
            v-if="!tag.affix"
            icon="lucide:x"
            class="tag-close-icon"
            width="12"
            height="12"
            @click.stop="handleClose(tag)"
          />
        </div>
      </div>
    </div>

    <!-- 右侧操作区 -->
    <div class="tags-view-actions">
      <!-- 最大化 / 还原 -->
      <span class="action-btn" @click="toggleFullscreen">
        <Icon
          :icon="isFullscreen ? 'lucide:minimize' : 'lucide:maximize'"
          width="14"
          height="14"
        />
      </span>

      <!-- 下拉菜单 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="action-trigger">
          <Icon icon="lucide:chevron-down" width="14" height="14" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">
              <Icon
                icon="lucide:refresh-cw"
                width="14"
                height="14"
                style="margin-right: 6px"
              />
              刷新当前
            </el-dropdown-item>
            <el-dropdown-item command="closeLeft" :disabled="!canCloseLeft">
              <Icon
                icon="lucide:panel-left-close"
                width="14"
                height="14"
                style="margin-right: 6px"
              />
              关闭左侧
            </el-dropdown-item>
            <el-dropdown-item command="closeRight" :disabled="!canCloseRight">
              <Icon
                icon="lucide:panel-right-close"
                width="14"
                height="14"
                style="margin-right: 6px"
              />
              关闭右侧
            </el-dropdown-item>
            <el-dropdown-item command="closeOthers" :disabled="!canCloseOthers">
              <Icon
                icon="lucide:list-x"
                width="14"
                height="14"
                style="margin-right: 6px"
              />
              关闭其他
            </el-dropdown-item>
            <el-dropdown-item command="closeAll" :disabled="!canCloseAll">
              <Icon
                icon="lucide:square-x"
                width="14"
                height="14"
                style="margin-right: 6px"
              />
              关闭全部
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 右键上下文菜单 -->
    <Teleport to="body">
      <Transition name="ctx-menu">
        <div
          v-if="contextMenuVisible"
          class="tags-context-menu"
          :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
          @click.stop
        >
          <div class="ctx-item" @click="handleCtxRefresh">
            <Icon
              icon="lucide:refresh-cw"
              width="14"
              height="14"
              style="margin-right: 6px"
            />
            刷新
          </div>
          <div
            v-if="contextMenuTag && !contextMenuTag.affix"
            class="ctx-item"
            @click="handleCtxClose"
          >
            <Icon
              icon="lucide:x"
              width="14"
              height="14"
              style="margin-right: 6px"
            />
            关闭
          </div>
          <div class="ctx-item" @click="handleCtxTogglePin">
            <Icon
              :icon="contextMenuTag?.affix ? 'lucide:pin-off' : 'lucide:pin'"
              width="14"
              height="14"
              style="margin-right: 6px"
            />
            {{ contextMenuTag?.affix ? '取消固定' : '固定' }}
          </div>
          <div class="ctx-separator" />
          <div
            class="ctx-item"
            :class="{ 'is-disabled': !canCtxCloseLeft }"
            @click="handleCtxCloseLeft"
          >
            <Icon
              icon="lucide:panel-left-close"
              width="14"
              height="14"
              style="margin-right: 6px"
            />
            关闭左侧
          </div>
          <div
            class="ctx-item"
            :class="{ 'is-disabled': !canCtxCloseRight }"
            @click="handleCtxCloseRight"
          >
            <Icon
              icon="lucide:panel-right-close"
              width="14"
              height="14"
              style="margin-right: 6px"
            />
            关闭右侧
          </div>
          <div
            class="ctx-item"
            :class="{ 'is-disabled': !canCtxCloseOthers }"
            @click="handleCtxCloseOthers"
          >
            <Icon
              icon="lucide:list-x"
              width="14"
              height="14"
              style="margin-right: 6px"
            />
            关闭其他
          </div>
          <div
            class="ctx-item"
            :class="{ 'is-disabled': !canCtxCloseAll }"
            @click="handleCtxCloseAll"
          >
            <Icon
              icon="lucide:square-x"
              width="14"
              height="14"
              style="margin-right: 6px"
            />
            关闭全部
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
import { findTopLevelParent } from '@/config/menu'
import ChromeTabBg from './chrome-tab-bg.vue'

const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()
const appStore = useAppStore()

// 多标签导航风格：card | google
const tagsViewStyle = computed(() => appStore.tagsViewStyle || 'card')

// 根据路由解析标签图标：优先取路由自身图标，否则回退到顶级父菜单图标
const resolveTagIcon = (path) => findTopLevelParent(path)?.icon || ''

// 注入布局提供的方法和状态
const reload = inject('reload', () => {})
const toggleFullscreen = inject('toggleFullscreen', () => {})
const isFullscreen = inject('isFullscreen', ref(false))

// ─── 初始化固定标签 ──────────────────────────────────────────
const initAffixTags = () => {
  const affixRoutes = router.getRoutes().filter((r) => r.meta?.affix && r.name)
  affixRoutes.forEach((r) => {
    tagsViewStore.addView({
      path: r.path,
      title: r.meta.title || '未命名',
      name: r.name,
      meta: r.meta,
      icon: r.meta.icon || resolveTagIcon(r.path),
      affix: true
    })
  })
}

// ─── 当前路由变化时添加标签 ────────────────────────────────────
const addCurrentTag = () => {
  const { path, meta, name } = route
  if (!path || path === '/login' || !meta?.title) return
  tagsViewStore.addView({
    path,
    title: meta.title,
    name: name || path,
    meta,
    icon: meta.icon || resolveTagIcon(path),
    affix: !!meta.affix
  })
}

// ─── 交互处理 ──────────────────────────────────────────────
const isActive = (tag) => tag.path === route.path

const handleClick = (tag) => {
  if (tag.path !== route.path) {
    router.push(tag.path)
  }
}

const handleClose = (tag) => {
  const wasActive = isActive(tag)
  tagsViewStore.removeView(tag)
  if (wasActive) {
    const views = tagsViewStore.visitedViews
    if (views.length) {
      const last = views[views.length - 1]
      router.push(last.path)
    } else {
      router.push('/desktop')
    }
  }
}

// 构造当前路由对应的 tag 对象
const currentTag = () => ({
  path: route.path,
  title: route.meta?.title || '',
  name: route.name || route.path,
  affix: !!route.meta?.affix
})

// ─── 关闭操作可用性检测 ──────────────────────────────────
// 固定（affix）标签受保护，不会被批量关闭操作移除，因此各关闭项需依据
// “是否存在可关闭的非固定标签”来动态启用/禁用，避免无意义的空操作。
const closableCountOnLeft = (tag) => {
  const views = tagsViewStore.visitedViews
  const idx = views.findIndex((v) => v.path === tag?.path)
  if (idx <= 0) return 0
  return views.slice(0, idx).filter((v) => !v.affix).length
}
const closableCountOnRight = (tag) => {
  const views = tagsViewStore.visitedViews
  const idx = views.findIndex((v) => v.path === tag?.path)
  if (idx === -1 || idx === views.length - 1) return 0
  return views.slice(idx + 1).filter((v) => !v.affix).length
}
const closableCountOthers = (tag) =>
  tagsViewStore.visitedViews.filter((v) => v.path !== tag?.path && !v.affix)
    .length
const closableCountAll = () =>
  tagsViewStore.visitedViews.filter((v) => !v.affix).length

// 下拉菜单：基于当前激活路由对应的标签进行检测
const canCloseLeft = computed(() => closableCountOnLeft(currentTag()) > 0)
const canCloseRight = computed(() => closableCountOnRight(currentTag()) > 0)
const canCloseOthers = computed(() => closableCountOthers(currentTag()) > 0)
const canCloseAll = computed(() => closableCountAll() > 0)

const handleCommand = (command) => {
  const tag = currentTag()
  switch (command) {
    case 'refresh':
      reload()
      break
    case 'closeLeft':
      tagsViewStore.removeLeftViews(tag)
      break
    case 'closeRight':
      tagsViewStore.removeRightViews(tag)
      if (!tagsViewStore.visitedViews.some((v) => v.path === route.path)) {
        router.push('/desktop')
      }
      break
    case 'closeOthers':
      tagsViewStore.removeOtherViews(tag)
      break
    case 'closeAll':
      tagsViewStore.removeAllViews()
      router.push('/desktop')
      break
    default:
      break
  }
}

// ─── 右键菜单 ──────────────────────────────────────────────
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuTag = ref(null)

// 右键菜单：基于右键目标标签进行检测
const canCtxCloseLeft = computed(
  () => closableCountOnLeft(contextMenuTag.value) > 0
)
const canCtxCloseRight = computed(
  () => closableCountOnRight(contextMenuTag.value) > 0
)
const canCtxCloseOthers = computed(
  () => closableCountOthers(contextMenuTag.value) > 0
)
const canCtxCloseAll = computed(() => closableCountAll() > 0)

const handleContextMenu = (event, tag) => {
  contextMenuTag.value = tag
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
}

const handleCtxRefresh = () => {
  closeContextMenu()
  reload()
}

const handleCtxClose = () => {
  const tag = contextMenuTag.value
  closeContextMenu()
  if (tag) handleClose(tag)
}

const handleCtxTogglePin = () => {
  const tag = contextMenuTag.value
  closeContextMenu()
  if (tag) tagsViewStore.toggleAffix(tag)
}

const handleCtxCloseLeft = () => {
  if (!canCtxCloseLeft.value) return
  const tag = contextMenuTag.value
  closeContextMenu()
  if (tag) {
    tagsViewStore.removeLeftViews(tag)
    if (!tagsViewStore.visitedViews.some((v) => v.path === route.path)) {
      router.push(tag.path)
    }
  }
}

const handleCtxCloseRight = () => {
  if (!canCtxCloseRight.value) return
  const tag = contextMenuTag.value
  closeContextMenu()
  if (tag) {
    tagsViewStore.removeRightViews(tag)
    if (!tagsViewStore.visitedViews.some((v) => v.path === route.path)) {
      router.push(tag.path)
    }
  }
}

const handleCtxCloseOthers = () => {
  if (!canCtxCloseOthers.value) return
  const tag = contextMenuTag.value
  closeContextMenu()
  if (tag) {
    tagsViewStore.removeOtherViews(tag)
    if (tag.path !== route.path) {
      router.push(tag.path)
    }
  }
}

const handleCtxCloseAll = () => {
  if (!canCtxCloseAll.value) return
  closeContextMenu()
  tagsViewStore.removeAllViews()
  router.push('/desktop')
}

// ─── 生命周期 ──────────────────────────────────────────────
onMounted(() => {
  initAffixTags()
  addCurrentTag()
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

watch(
  () => route.path,
  () => {
    addCurrentTag()
  }
)
</script>

<style lang="scss" scoped>
.tags-view-wrapper {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 38px;
  padding: 0 14px;
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);

  /* ── 谷歌（Chrome 标签）风格 ─────────────────────────────── */
  &.is-style-google {
    height: 40px;
    padding: 0 8px;
    background: var(--color-bg-card);
    border-bottom: none;

    .tags-view-scroll {
      height: 100%;
    }

    .tags-view-list {
      gap: 0;
      align-items: flex-end; // Chrome 标签底部对齐
      height: 100%;
      padding-right: 18px; // 补偿最后一个标签的负 margin，避免被裁切
    }

    // 标签 = Chrome 标签按钮：几何形状背景 + 相邻标签重叠
    .tag-item {
      position: relative;
      z-index: 1;
      display: inline-flex;
      gap: 8px;
      align-items: center;
      height: 32px;
      padding: 0 18px;
      margin-right: -18px; // 与下一个标签重叠 18px
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-secondary);
      background: none;
      border: none;
      border-radius: 0;
      transition: color 0.2s ease;

      &:hover {
        z-index: 9;
        color: var(--color-text-primary);
      }

      &.is-active {
        z-index: 10;
        font-weight: 600;
        color: var(--color-primary);
      }

      &.is-active::after,
      &:hover::after {
        opacity: 0;
      }

      // 已用图标表达路由含义，固定小圆点不再需要
      .tag-affix-dot {
        display: none;
      }

      // 关闭按钮：Chrome 风格圆形悬停块
      .tag-close-icon {
        width: 16px;
        height: 16px;
        border-radius: 50%;
      }

      .tag-close-icon:hover {
        color: #fff;
        background: #9ca3af;
      }

      &.is-active .tag-close-icon:hover {
        background: var(--color-primary);
      }
    }

    // Chrome 标签背景状态（独立选择器避免嵌套过深）
    .tag-item:hover .chrome-tab-bg {
      color: #dee1e6;
    }

    .tag-item.is-active .chrome-tab-bg {
      color: color-mix(in srgb, var(--color-primary), #fff 90%);
    }

    // 深色模式适配
    html.dark & .tag-item::after {
      background: rgb(255 255 255 / 90%);
    }

    html.dark & .tag-item:hover .chrome-tab-bg {
      color: #333;
    }

    html.dark & .tag-item.is-active .chrome-tab-bg {
      color: color-mix(in srgb, var(--color-primary), #000 70%);
    }
  }
}

.tags-view-scroll {
  flex: 1;
  min-width: 0;
  overflow: auto hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    height: 0;
  }
}

.tags-view-list {
  display: flex;
  gap: 6px;
  align-items: center;
  height: 28px;
  white-space: nowrap;
}

.tag-item {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  max-width: 200px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: var(--color-bg-input);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  &.is-active {
    font-weight: 600;
    color: var(--color-primary);
    background: var(--brand-accent-soft);
    border-color: color-mix(in srgb, var(--color-primary), transparent 70%);
  }

  .tag-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // 路由图标（颜色跟随文字，随激活态切换）
  .tag-item-icon {
    flex-shrink: 0;
    color: inherit;
  }

  // 固定指示器小圆点
  .tag-affix-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    background: var(--color-primary);
    border-radius: 50%;
    opacity: 0.6;
  }

  &.is-active .tag-affix-dot {
    opacity: 1;
  }

  .tag-close-icon {
    flex-shrink: 0;
    color: var(--color-text-muted);
    border-radius: 3px;
    transition: all 0.15s ease;

    &:hover {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 85%);
    }
  }

  &.is-active .tag-close-icon {
    color: var(--color-primary);

    &:hover {
      color: var(--color-danger);
    }
  }
}

.tags-view-actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  align-items: center;

  .action-btn,
  .action-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
    }
  }
}
</style>

<!-- 右键菜单全局样式（非 scoped） -->
<style lang="scss">
.tags-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 120px;
  padding: 4px;
  background: var(--glass-surface);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);

  .ctx-item {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    font-size: 13px;
    color: var(--color-text-primary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background 0.15s ease;

    &:hover {
      background: var(--color-bg-hover);
    }

    &.is-disabled {
      color: var(--color-text-muted);
      cursor: not-allowed;
      opacity: 0.4;

      &:hover {
        background: transparent;
      }
    }
  }

  .ctx-separator {
    height: 1px;
    margin: 4px 8px;
    background: var(--color-border);
  }
}

.ctx-menu-enter-active,
.ctx-menu-leave-active {
  transition: all 0.15s ease;
}

.ctx-menu-enter-from,
.ctx-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
