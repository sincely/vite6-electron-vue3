<template>
  <Teleport to="body">
    <Transition name="settings-fade">
      <div v-if="visible" class="settings-overlay" @click.self="handleClose">
        <div class="settings-container">
          <!-- Sidebar -->
          <div class="settings-sidebar">
            <div class="sidebar-header">
              <div class="header-icon">
                <SvgIcon icon-class="settings" />
              </div>
              <span class="header-title">设置</span>
            </div>

            <div class="sidebar-menu">
              <div
                v-for="tab in tabs"
                :key="tab.id"
                class="menu-item"
                :class="{ active: currentTab === tab.id }"
                @click="currentTab = tab.id"
              >
                <SvgIcon :icon-class="tab.icon" class="menu-icon" />
                <span>{{ tab.label }}</span>
              </div>
            </div>

            <div class="sidebar-footer">
              <span class="version-text">v{{ appVersion }}</span>
            </div>
          </div>

          <!-- Content -->
          <div class="settings-content">
            <div class="content-header">
              <h2 class="content-title">{{ currentTabLabel }}</h2>
              <button class="close-btn" @click="handleClose">
                <SvgIcon icon-class="close" />
              </button>
            </div>

            <div class="content-body">
              <Transition name="fade-slide" mode="out-in">
                <!-- General Settings -->
                <div
                  v-if="currentTab === 'general'"
                  key="general"
                  class="tab-pane"
                >
                  <div class="setting-section">
                    <h3 class="section-title">启动</h3>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">开机自启</span>
                        <span class="item-desc">
                          跟随系统启动自动运行应用程序
                        </span>
                      </div>
                      <el-switch v-model="autoLaunch" />
                    </div>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">静默启动</span>
                        <span class="item-desc">启动时最小化到系统托盘</span>
                      </div>
                      <el-switch v-model="form.silentLaunch" />
                    </div>
                  </div>

                  <div class="setting-section">
                    <h3 class="section-title">行为</h3>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">关闭窗口时</span>
                        <span class="item-desc">选择点击关闭按钮时的行为</span>
                      </div>
                      <el-select
                        v-model="form.closeAction"
                        style="width: 140px"
                      >
                        <el-option label="最小化到托盘" value="minimize" />
                        <el-option label="退出程序" value="quit" />
                      </el-select>
                    </div>
                  </div>
                </div>

                <!-- Appearance Settings -->
                <div
                  v-else-if="currentTab === 'appearance'"
                  key="appearance"
                  class="tab-pane"
                >
                  <div class="setting-section">
                    <h3 class="section-title">主题模式</h3>
                    <div class="theme-options">
                      <div
                        class="theme-card"
                        :class="{ active: appStore.theme === 'light' }"
                        @click="
                          appStore.toggleThemeWithTransition($event, 'light')
                        "
                      >
                        <div class="theme-preview light">
                          <div class="preview-sidebar"></div>
                          <div class="preview-content">
                            <div class="preview-line"></div>
                            <div class="preview-line short"></div>
                          </div>
                        </div>
                        <span class="theme-label">浅色</span>
                      </div>
                      <div
                        class="theme-card"
                        :class="{ active: appStore.theme === 'dark' }"
                        @click="
                          appStore.toggleThemeWithTransition($event, 'dark')
                        "
                      >
                        <div class="theme-preview dark">
                          <div class="preview-sidebar"></div>
                          <div class="preview-content">
                            <div class="preview-line"></div>
                            <div class="preview-line short"></div>
                          </div>
                        </div>
                        <span class="theme-label">深色</span>
                      </div>
                      <div
                        class="theme-card"
                        :class="{ active: appStore.theme === 'auto' }"
                        @click="
                          appStore.toggleThemeWithTransition($event, 'auto')
                        "
                      >
                        <div class="theme-preview auto">
                          <div class="preview-split"></div>
                        </div>
                        <span class="theme-label">跟随系统</span>
                      </div>
                    </div>
                  </div>

                  <div class="setting-section">
                    <h3 class="section-title">界面显示</h3>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">侧边栏折叠</span>
                        <span class="item-desc">默认折叠侧边栏菜单</span>
                      </div>
                      <el-switch v-model="appStore.sidebarCollapsed" />
                    </div>
                  </div>
                </div>

                <!-- About Settings -->
                <div
                  v-else-if="currentTab === 'about'"
                  key="about"
                  class="tab-pane"
                >
                  <div class="about-header">
                    <img
                      src="@/assets/bar/icon.png"
                      class="app-logo"
                      alt="Logo"
                    />
                    <h3 class="app-name">Lightning</h3>
                    <p class="app-version">Version {{ appVersion }}</p>
                  </div>

                  <div class="about-links">
                    <a
                      href="https://github.com/your-repo"
                      target="_blank"
                      class="link-item"
                    >
                      <SvgIcon icon-class="github" />
                      <span>GitHub 仓库</span>
                    </a>
                    <a href="#" class="link-item">
                      <SvgIcon icon-class="document" />
                      <span>使用文档</span>
                    </a>
                  </div>

                  <div class="copyright">
                    Copyright © 2024 Lightning Team. All rights reserved.
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import pkg from '../../../package.json'

const appStore = useAppStore()
const visible = computed({
  get: () => appStore.settingsVisible,
  set: (val) => appStore.toggleSettings(val)
})

const autoLaunch = computed({
  get: () => appStore.isAutoLaunch,
  set: (val) => appStore.toggleAutoLaunch(val)
})

console.log(visible.value)

const appVersion = pkg.version

const tabs = [
  { id: 'general', label: '常规设置', icon: 'settings' },
  { id: 'appearance', label: '外观显示', icon: 'appearance' },
  { id: 'about', label: '关于软件', icon: 'info' }
]

const currentTab = ref('general')
const currentTabLabel = computed(
  () => tabs.find((t) => t.id === currentTab.value)?.label
)

const form = ref({
  autoLaunch: false,
  silentLaunch: false,
  closeAction: 'minimize'
})

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  background-color: rgb(0 0 0 / 40%);
  backdrop-filter: blur(4px);
}

.settings-container {
  display: flex;
  width: 800px;
  height: 560px;
  overflow: hidden;
  background: var(--color-bg-window);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 10%),
    0 10px 10px -5px rgb(0 0 0 / 4%),
    0 0 0 1px rgb(255 255 255 / 10%);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Sidebar */
.settings-sidebar {
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: 24px 16px;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
}

.header-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--brand-accent)
  );
  border-radius: 8px;
}

.sidebar-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-left: 8px;
  margin-bottom: 24px;

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.menu-item {
  display: flex;
  gap: 10px;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  margin-bottom: 4px;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  &.active {
    font-weight: 500;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
  }

  .menu-icon {
    font-size: 16px;
  }
}

.sidebar-footer {
  padding-left: 8px;
  margin-top: auto;

  .version-text {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

/* Content */
.settings-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  background: var(--color-bg-window);
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
  border-bottom: 1px solid var(--color-border);

  .content-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
}

.close-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }
}

.content-body {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

.setting-section {
  margin-bottom: 32px;

  .section-title {
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-primary);
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--color-bg-card);
  border-radius: 12px;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-border-hover);
  }

  .item-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .item-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .item-desc {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

/* Theme Cards */
.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.theme-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .theme-preview {
    position: relative;
    height: 100px;
    overflow: hidden;
    border: 2px solid var(--color-border);
    border-radius: 12px;
    transition: all 0.2s;

    &.light {
      background: #f5f7fa;

      .preview-sidebar {
        background: #fff;
        border-right: 1px solid #e5e7eb;
      }

      .preview-content {
        background: #f5f7fa;
      }
    }

    &.dark {
      background: #1a1a1a;

      .preview-sidebar {
        background: #262626;
        border-right: 1px solid #333;
      }

      .preview-content {
        background: #1a1a1a;
      }
    }

    &.auto {
      background: linear-gradient(135deg, #f5f7fa 50%, #1a1a1a 50%);
    }

    .preview-sidebar {
      position: absolute;
      top: 0;
      left: 0;
      width: 30%;
      height: 100%;
    }
  }

  .theme-label {
    font-size: 13px;
    color: var(--color-text-secondary);
    text-align: center;
  }

  &:hover .theme-preview {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  &.active {
    .theme-preview {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-primary), transparent 80%);
    }

    .theme-label {
      font-weight: 500;
      color: var(--color-primary);
    }
  }
}

/* About Page */
.about-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;

  .app-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
  }

  .app-name {
    margin-bottom: 4px;
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .app-version {
    padding: 2px 8px;
    font-size: 14px;
    color: var(--color-text-secondary);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }
}

.about-links {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 48px;

  .link-item {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 16px;
    font-size: 14px;
    color: var(--color-text-primary);
    text-decoration: none;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      color: var(--color-primary);
      border-color: var(--color-primary);
      transform: translateY(-1px);
    }
  }
}

.copyright {
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}

/* Transitions */
.settings-fade-enter-active,
.settings-fade-leave-active {
  transition: all 0.3s ease;
}

.settings-fade-enter-from,
.settings-fade-leave-to {
  opacity: 0;

  .settings-container {
    transform: scale(0.95) translateY(10px);
  }
}

.settings-fade-enter-to,
.settings-fade-leave-from {
  opacity: 1;

  .settings-container {
    transform: scale(1) translateY(0);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
