<template>
  <header
    class="title-bar"
    :class="{ 'is-top-mode': isTopMenu, 'is-mac': isMac() }"
  >
    <div class="title-bar__inner">
      <!-- 侧边栏折叠 / 子菜单栏切换 -->
      <button
        v-if="showSidebarToggle"
        class="icon-btn sidebar-toggle"
        :title="toggleButtonTitle"
        @click="handleToggleClick"
      >
        <SvgIcon :icon-class="toggleIcon" width="20px" height="20px" />
      </button>

      <!-- Logo 区域 (顶部菜单模式显示) -->
      <GlobalLogo v-if="isTopMenu" class="top-mode-logo" />
      <!-- 刷新当前页面：翻转 store 的 refresh，内容区销毁重建路由视图（软刷新，保留布局与已打开标签），可在设置中关闭 -->
      <button
        v-if="appStore.refreshBtn"
        class="icon-btn refresh-btn"
        title="刷新当前页面"
        @click="handleRefresh"
      >
        <SvgIcon
          icon-class="refresh"
          :class-name="
            isRefreshing ? 'refresh-icon is-spinning' : 'refresh-icon'
          "
          width="16px"
          height="16px"
        />
      </button>

      <!-- 快速入口（参照 art-design-pro）：九宫格悬停下拉面板，可在设置中关闭 -->
      <FastEnter v-if="appStore.fastEnter" />
      <!-- 顶部菜单 (顶部菜单模式显示) -->
      <GlobalTopMenu v-if="isTopMenu" />

      <!-- 中间操作区 -->
      <div class="title-bar__center" :class="{ 'is-top-mode': isTopMenu }">
        <slot name="center" />
      </div>

      <!-- 右侧操作区 -->
      <div class="title-bar__actions">
        <!-- 右侧插槽（搜索等） -->
        <slot name="right" />

        <!-- 更新提示：下载中实时显示环形进度，下载完成提示安装，点击重新打开更新弹窗 -->
        <button
          v-if="updateAvailable"
          class="icon-btn update-btn"
          :class="{
            'is-downloading': isUpdating,
            'is-downloaded': updateDownloaded
          }"
          :title="updateButtonTitle"
          @click="showUpdateDialog"
        >
          <!-- 下载中：环形进度条 + 下载图标（pathLength 归一化保证进度精确） -->
          <span v-if="isUpdating" class="update-ring-wrap">
            <svg class="update-ring" viewBox="0 0 32 32">
              <circle
                class="update-ring__track"
                cx="16"
                cy="16"
                r="13"
                pathLength="100"
              />
              <circle
                class="update-ring__fill"
                cx="16"
                cy="16"
                r="13"
                pathLength="100"
                transform="rotate(-90 16 16)"
                :style="{ strokeDashoffset: ringDashOffset }"
              />
            </svg>
            <SvgIcon
              icon-class="download"
              class="update-ring-icon"
              width="10px"
              height="10px"
            />
          </span>
          <SvgIcon
            v-else
            :icon-class="updateDownloaded ? 'success' : 'update'"
            class="update-icon"
            width="16px"
            height="16px"
          />
          <span class="update-btn-text">{{ updateButtonText }}</span>
        </button>

        <!-- 聊天窗口入口 -->
        <div class="chat-btn-wrap">
          <button class="icon-btn" title="Lightning Bot" @click="openChat">
            <SvgIcon icon-class="message" width="18px" height="18px" />
            <span class="chat-dot"></span>
          </button>
        </div>

        <!-- 通知铃铛 -->
        <div class="notif-btn-wrap">
          <button ref="bellBtnRef" class="icon-btn" @click="handleNotice">
            <SvgIcon icon-class="notice" width="18px" height="18px" />
            <span v-if="noticeStore.hasUnread" class="notif-badge">
              {{
                noticeStore.unreadCount > 99 ? '99+' : noticeStore.unreadCount
              }}
            </span>
          </button>
          <NotificationPanel :anchor-ref="bellBtnRef" />
        </div>
        <!-- 主题切换 -->
        <button
          class="icon-btn"
          @click="
            appStore.toggleThemeWithTransition(
              $event,
              isDark ? 'light' : 'dark'
            )
          "
        >
          <SvgIcon
            :icon-class="appStore.isDark ? 'sun' : 'moon'"
            width="16px"
            height="16px"
          />
        </button>
        <!-- 用户头像与菜单（所有布局模式统一置于右上角） -->
        <UserDropdown />
        <!-- 窗口控制 -->
        <div v-if="isWindows()" class="window-controls">
          <el-tooltip content="最小化" placement="bottom" :show-after="200">
            <button class="icon-btn" @click="minimize">
              <SvgIcon icon-class="minus" width="16px" height="16px" />
            </button>
          </el-tooltip>
          <el-tooltip
            :content="isMaximized ? '向下还原' : '最大化'"
            placement="bottom"
            :show-after="200"
          >
            <button class="icon-btn" @click="maximize">
              <SvgIcon
                :icon-class="isMaximized ? 'mini' : 'max'"
                width="16px"
                height="16px"
              />
            </button>
          </el-tooltip>
          <el-tooltip content="关闭" placement="bottom" :show-after="200">
            <button class="icon-btn" @click="close">
              <SvgIcon icon-class="close" width="16px" height="16px" />
            </button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useUpdateStore } from '@/store/modules/version'
import { useNotificationStore } from '@/store/modules/notification'
import { useChatStore } from '@/store/modules/chat'
import { isWindows, isMac } from '@/utils/platform'
import GlobalLogo from '../global-logo/index.vue'
import GlobalTopMenu from '../global-topMenu/index.vue'
import UserDropdown from './modules/UserDropdown.vue'
import FastEnter from './modules/FastEnter.vue'
import NotificationPanel from '@/components/NotificationPanel/index.vue'

const appStore = useAppStore()
const updateStore = useUpdateStore()
const noticeStore = useNotificationStore()
const chatStore = useChatStore()

const latestVersion = computed(() => updateStore.latestVersion)
const updateAvailable = computed(
  () =>
    !!latestVersion.value && latestVersion.value !== updateStore.currentVersion
)

// ─── 更新下载进度（标题栏实时展示）───────────────────────────────────
const isUpdating = computed(() => updateStore.isUpdating) // 是否下载中
const downloadProgress = computed(() => updateStore.downloadProgress) // 下载进度（0-100）
const updateDownloaded = computed(() => updateStore.updateDownloaded) // 是否已下载完成

// 环形进度：circle 用 pathLength="100" 归一化，dashoffset = 100 - 进度，
// 与几何周长解耦，任何半径/缩放下进度都与百分比文本严格一致
const ringDashOffset = computed(() => 100 - downloadProgress.value)

// 按钮文案：下载中显示百分比，下载完成显示"安装"，否则显示"更新"
const updateButtonText = computed(() => {
  if (isUpdating.value) return `${Math.floor(downloadProgress.value)}%`
  if (updateDownloaded.value) return '安装'
  return '更新'
})

const updateButtonTitle = computed(() => {
  if (isUpdating.value) return '正在后台下载更新，点击查看详情'
  if (updateDownloaded.value) return '更新已就绪，点击重启安装'
  return '发现新版本，点击查看'
})

const bellBtnRef = ref(null)

const showUpdateDialog = () => {
  window.dispatchEvent(new Event('update:open-dialog'))
}

const handleNotice = () => {
  noticeStore.togglePanel()
}

// 打开聊天窗口
const openChat = () => {
  chatStore.toggleChat(true)
}

// ─── 刷新当前页面（全局软刷新）─────────────────────────────────────
// 翻转 store 的 refresh 状态，由内容区监听后销毁重建路由视图；
// 图标旋转一圈作为点击反馈，期间拦截重复点击
const isRefreshing = ref(false)
let refreshTimer = null

const handleRefresh = () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  appStore.reloadPage()
  refreshTimer = setTimeout(() => {
    isRefreshing.value = false
  }, 600)
}

const isTopMenu = computed(
  () => appStore.layoutMode === 'top' || appStore.layoutMode === 'top-mixed'
)
const isDark = computed(() => appStore.isDark)

// 是否显示侧边栏切换按钮（仅 left 模式，控制侧边栏折叠；
// top 用悬停下拉、top-mixed 子菜单列固定显示、dual 第二列固定展开，均无需此按钮）
const showSidebarToggle = computed(() => appStore.layoutMode === 'left')

const toggleButtonTitle = computed(() =>
  appStore.sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'
)

const toggleIcon = computed(() =>
  appStore.sidebarCollapsed ? 'panel-left-open' : 'panel-left-close'
)

const handleToggleClick = () => {
  appStore.toggleSidebar()
}

const minimize = () => ipcRenderer.send('minimize-window')
const maximize = () => ipcRenderer.send('maximize-window')
const close = () => ipcRenderer.send('close-window')

// 窗口最大化状态跟踪
const isMaximized = ref(false)

const onMaximizeChange = (_event, maximized) => {
  isMaximized.value = maximized
}

onMounted(async () => {
  // 初始化时查询当前最大化状态
  try {
    isMaximized.value = await ipcRenderer.invoke('get-window-maximized')
  } catch {
    // 登录窗口无此 handler，忽略
  }
  ipcRenderer.on('window-maximize-change', onMaximizeChange)
})

onBeforeUnmount(() => {
  ipcRenderer.off('window-maximize-change', onMaximizeChange)
  if (refreshTimer) clearTimeout(refreshTimer)
})
</script>

<style lang="scss" scoped>
.title-bar {
  position: relative;
  z-index: 1000;
  display: flex;
  align-items: stretch;
  width: 100%;
  height: var(--titlebar-height);
  overflow: visible;
  user-select: none;
  background: var(--color-bg-titlebar);
  border-bottom: 1px solid var(--color-border);
  -webkit-app-region: drag;

  // Mac 平台顶部菜单模式：为红绿灯预留左侧空间（配合 trafficLightPosition）
  &.is-mac.is-top-mode &__inner {
    padding-left: 70px;
  }

  &__inner {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
    padding: 0 12px;
  }

  &__center {
    display: flex;
    flex: 1;
    align-items: flex-end;

    &.is-top-mode {
      flex: none;
    }
  }

  &__actions {
    display: flex;
    gap: 6px;
    align-items: center;
    height: 100%;
    margin-left: auto;
  }
}

.window-controls {
  display: flex;
  gap: 6px;
  align-items: center;
  height: 100%;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: var(--color-text-primary);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-hover);
    border-color: var(--color-border-light);
  }

  &:active {
    background-color: var(--color-bg-active);
    transform: scale(0.94);
  }

  &.update-btn {
    gap: 6px;
    width: auto;
    height: 30px;
    padding: 0 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-primary);
    background: var(--brand-accent-soft);
    border-color: color-mix(in srgb, var(--color-primary), transparent 40%);

    &:hover {
      background: var(--color-bg-active);
      box-shadow: var(--shadow-glow-primary);
    }

    .update-icon {
      color: var(--color-primary);
    }

    // 下载中：百分比文本保持等宽，避免数字跳动
    &.is-downloading .update-btn-text {
      min-width: 34px;
      font-variant-numeric: tabular-nums;
      text-align: left;
    }

    // 下载完成：切换为成功色并呼吸提示，引导用户点击安装
    &.is-downloaded {
      color: var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 90%);
      border-color: color-mix(in srgb, var(--color-success), transparent 40%);
      animation: downloaded-pulse 2s ease-in-out infinite;

      .update-icon {
        color: var(--color-success);
      }
    }
  }
}

.sidebar-toggle {
  width: 34px;
  height: 34px;
  margin-right: 8px;
}

// 刷新按钮：图标旋转一圈作为点击反馈（仅 transform，ease-out）
.refresh-btn {
  margin-left: 2px;

  .refresh-icon.is-spinning {
    animation: refresh-spin 0.6s ease-out;
  }
}

@keyframes refresh-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 更新按钮：环形实时进度
.update-ring-wrap {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.update-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;

  // 进度起点通过 fill 圆上的 SVG 属性 transform="rotate(-90 16 16)" 转到正上方，
  // 不依赖 CSS transform，避免浏览器对 SVG 元素 transform-origin 推断差异

  circle {
    fill: none;
    stroke-width: 3;
  }

  &__track {
    stroke: color-mix(in srgb, var(--color-primary), transparent 78%);
  }

  &__fill {
    stroke: var(--color-primary);
    stroke-dasharray: 100; // 与 pathLength="100" 对应，满环即 100
    stroke-linecap: round;
    transition: stroke-dashoffset 0.2s linear;
  }
}

.update-ring-icon {
  color: var(--color-primary);
}

@keyframes downloaded-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0
      color-mix(in srgb, var(--color-success), transparent 70%);
  }

  50% {
    box-shadow: 0 0 0 4px
      color-mix(in srgb, var(--color-success), transparent 90%);
  }
}

// 聊天入口包装
.chat-btn-wrap {
  position: relative;
  -webkit-app-region: no-drag;
}

// 在线呼吸点
.chat-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  pointer-events: none;
  background: var(--color-success);
  border-radius: 50%;
  box-shadow: 0 0 6px color-mix(in srgb, var(--color-success), transparent 40%);
  animation: chat-dot-breathing 2.4s ease-in-out infinite;
}

@keyframes chat-dot-breathing {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.35;
    transform: scale(0.75);
  }
}

// 通知按鈕包裃
.notif-btn-wrap {
  position: relative;
  -webkit-app-region: no-drag;
}

// 未读徽章
.notif-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  color: #fff;
  text-align: center;
  pointer-events: none;
  background: linear-gradient(135deg, var(--color-rose), var(--color-danger));
  border-radius: 999px;
  box-shadow: 0 2px 8px -2px
    color-mix(in srgb, var(--color-danger), transparent 50%);
  transform: translate(40%, -40%);
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
</style>
