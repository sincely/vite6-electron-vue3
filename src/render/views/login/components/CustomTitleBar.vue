<template>
  <div class="custom-title-bar" :style="dragRegionStyle" @mousedown="onBarMouseDown">
    <div class="window-controls">
      <!-- vben 认证页布局切换：图标按钮 + 单选下拉菜单（居左 / 居中 / 居右） -->
      <el-dropdown
        v-if="showLayoutToggle"
        trigger="click"
        popper-class="auth-layout-popper"
        @command="setAuthPanelLayout"
      >
        <button
          type="button"
          class="control-btn layout-icon-btn"
          title="切换登录页布局"
          aria-haspopup="menu"
          aria-label="切换登录页布局"
        >
          <Icon :icon="activeLayoutIcon" width="16" height="16" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in AUTH_PANEL_LAYOUTS"
              :key="item.value"
              :command="item.value"
              :class="{ 'is-active-layout': authPanelLayout === item.value }"
            >
              <span class="layout-menu-item">
                <Icon :icon="item.icon" width="15" height="15" />
                <span>{{ item.label }}</span>
                <svg-icon
                  v-if="authPanelLayout === item.value"
                  icon-class="check"
                  width="14px"
                  height="14px"
                  class="layout-check"
                />
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 主题切换（复刻 vben 登录页右上角工具栏） -->
      <button
        v-if="showThemeToggle"
        type="button"
        class="control-btn"
        title="切换主题"
        @click="appStore.toggleThemeWithTransition($event, appStore.isDark ? 'light' : 'dark')"
      >
        <SvgIcon :icon-class="appStore.isDark ? 'sun' : 'moon'" width="16px" height="16px" />
      </button>
      <button v-if="!isMac()" type="button" class="control-btn" title="最小化" @click="minimizeWindow">
        <SvgIcon icon-class="minus" width="16px" height="16px" />
      </button>
      <button v-if="!isMac()" type="button" class="control-btn close-btn" title="关闭" @click="closeWindow">
        <SvgIcon icon-class="close" width="16px" height="16px" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { isMac } from '@/utils/platform'
import { useAppStore } from '@/store/modules/app'
import { AUTH_PANEL_LAYOUTS, useAuthPanelLayout } from '../composables/useAuthPanelLayout'

defineOptions({ name: 'CustomTitleBar' })

// 找回密码等页面同样悬浮展示，可关闭主题切换或布局切换
defineProps({
  showThemeToggle: { type: Boolean, default: true },
  showLayoutToggle: { type: Boolean, default: true }
})

const appStore = useAppStore()
const { activeLayoutIcon, authPanelLayout, setAuthPanelLayout } = useAuthPanelLayout()

const minimizeWindow = () => {
  window.ipcRenderer.send('minimize-window')
}

const closeWindow = () => {
  window.ipcRenderer.send('close-window')
}

// ─── 标题栏拖拽 ────────────────────────────────────────────────
// macOS 不声明 -webkit-app-region: drag：原生拖拽区上的双击会触发 AppKit
// zoom，把固定尺寸的登录窗甩到屏幕左下角（Electron 的 windowShouldZoom
// 不检查 maximizable/resizable，v42/v43 直至 main 分支均未修复；详见主进程
// windowManager.js 的 guardMacZoomJump 注释），改用手动拖拽后双击不再有任何
// 系统动作，与 maximizable:false 的意图一致。
// Windows/Linux 的双击最大化由 Electron 按 maximizable:false 正确拦截，
// 保留原生拖拽区以获得系统级拖拽手感。
const isMacOS = isMac()
const dragRegionStyle = computed(() => (isMacOS ? {} : { '-webkit-app-region': 'drag' }))

// 手动拖拽：mousedown 通知主进程开始轮询光标并平移窗口（见主进程
// win-control.js 的 window-drag-start），mouseup / 窗口失焦时结束
let stopDrag = null

const onBarMouseDown = (e) => {
  if (!isMacOS || e.button !== 0 || stopDrag) return
  // 按钮区（布局切换/主题/最小化/关闭）上的 mousedown 不启动窗口拖拽
  if (e.target.closest('.window-controls')) return
  e.preventDefault()
  window.ipcRenderer.send('window-drag-start')
  stopDrag = () => {
    window.ipcRenderer.send('window-drag-end')
    window.removeEventListener('mouseup', stopDrag)
    window.removeEventListener('blur', stopDrag)
    stopDrag = null
  }
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('blur', stopDrag)
}

// 组件卸载兜底结束拖拽，避免残留主进程轮询
onBeforeUnmount(() => stopDrag?.())
</script>

<style lang="scss" scoped>
.custom-title-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 40px;

  // macOS 手动拖拽时避免标题栏上的双击/拖动选中文字
  user-select: none;
  background-color: transparent;
}

.window-controls {
  display: flex;
  gap: 4px;
  align-items: center;
  padding-right: 10px;
  -webkit-app-region: no-drag;

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--color-text-primary);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 6px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgb(128 128 128 / 18%);
    }

    &.close-btn:hover {
      color: #fff;
      background-color: #e81123;
    }
  }
}

.layout-icon-btn {
  // 与主题切换、窗口控制按钮一致的图标按钮外观（vben SUIIconButton）
  display: inline-flex;
}

// el-dropdown 弹出层传送到 body，须用 popper-class + 全局选择器
:global(.auth-layout-popper .el-dropdown-menu__item) {
  padding: 6px 16px;
}

:global(.auth-layout-popper .layout-menu-item) {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 96px;
}

:global(.auth-layout-popper .layout-menu-item .layout-check) {
  margin-left: auto;
  color: var(--color-primary);
}

:global(.auth-layout-popper .el-dropdown-menu__item.is-active-layout) {
  font-weight: 600;
  color: var(--color-primary);
  background-color: var(--brand-accent-soft);
}
</style>
