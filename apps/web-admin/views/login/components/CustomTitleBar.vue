<template>
  <div class="custom-title-bar">
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
        @click="appStore.toggleThemeWithTransition($event)"
      >
        <SvgIcon
          :icon-class="appStore.isDark ? 'sun' : 'moon'"
          width="16px"
          height="16px"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/store/modules/app'
import {
  AUTH_PANEL_LAYOUTS,
  useAuthPanelLayout
} from '../composables/useAuthPanelLayout'

defineOptions({ name: 'CustomTitleBar' })

// 找回密码等页面同样悬浮展示，可关闭主题切换或布局切换
defineProps({
  showThemeToggle: { type: Boolean, default: true },
  showLayoutToggle: { type: Boolean, default: true }
})

const appStore = useAppStore()
const { activeLayoutIcon, authPanelLayout, setAuthPanelLayout } =
  useAuthPanelLayout()
</script>

<style lang="scss" scoped>
.custom-title-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 40px;
  background-color: transparent;
}

.window-controls {
  display: flex;
  gap: 4px;
  align-items: center;
  padding-right: 10px;

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
  }
}

.layout-icon-btn {
  // 与主题切换按钮一致的图标按钮外观（vben SUIIconButton）
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
