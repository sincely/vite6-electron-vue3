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
                <!-- <SvgIcon :icon-class="tab.icon" class="menu-icon" /> -->
                <span>{{ tab.label }}</span>
              </div>
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
                <div
                  v-if="currentTab === 'general'"
                  key="general"
                  class="tab-pane"
                >
                  <div class="setting-section">
                    <h3 class="section-title">外观</h3>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">底部状态栏</span>
                        <span class="item-desc">是否显示底部状态栏</span>
                      </div>
                      <el-switch v-model="footerVisible" />
                    </div>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">多标签导航</span>
                        <span class="item-desc">
                          是否在标题栏显示多标签导航
                        </span>
                      </div>
                      <el-switch v-model="tagsVisible" />
                    </div>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">面包屑</span>
                        <span class="item-desc">是否显示面包屑导航</span>
                      </div>
                      <el-switch v-model="breadCrumbVisible" />
                    </div>
                  </div>
                </div>

                <!-- Profile / Personal Info -->
                <div
                  v-else-if="currentTab === 'profile'"
                  key="profile"
                  class="tab-pane"
                >
                  <!-- Avatar Section -->
                  <div class="profile-avatar-section">
                    <div class="avatar-container">
                      <div class="avatar-wrapper">
                        <img
                          v-if="userAvatar && !avatarLoadFailed"
                          :src="userAvatar"
                          :alt="displayName"
                          class="profile-avatar-img"
                          @error="avatarLoadFailed = true"
                        />
                        <span v-else class="profile-avatar-fallback">
                          {{ userInitial }}
                        </span>
                        <div class="avatar-overlay">
                          <el-upload
                            :show-file-list="false"
                            accept="image/*"
                            :before-upload="handleAvatarUpload"
                          >
                            <button class="avatar-edit-btn" type="button">
                              <SvgIcon icon-class="edit" />
                              <span>更换头像</span>
                            </button>
                          </el-upload>
                        </div>
                      </div>
                      <span class="avatar-status-dot"></span>
                    </div>
                    <div class="avatar-meta">
                      <h3 class="avatar-name">{{ displayName }}</h3>
                      <span class="avatar-badge">{{ userRole }}</span>
                    </div>
                  </div>

                  <!-- Info Cards -->
                  <div class="setting-section">
                    <h3 class="section-title">基本信息</h3>
                    <div class="profile-info-list">
                      <div class="profile-info-item">
                        <div class="info-icon">
                          <SvgIcon icon-class="user" />
                        </div>
                        <div class="info-content">
                          <span class="info-label">姓名</span>
                          <span class="info-value">{{ displayName }}</span>
                        </div>
                        <SvgIcon
                          icon-class="chevron-right"
                          class="info-arrow"
                        />
                      </div>
                      <div class="profile-info-item">
                        <div class="info-icon">
                          <SvgIcon icon-class="phone" />
                        </div>
                        <div class="info-content">
                          <span class="info-label">手机号</span>
                          <span class="info-value">{{ userPhone }}</span>
                        </div>
                        <SvgIcon
                          icon-class="chevron-right"
                          class="info-arrow"
                        />
                      </div>
                      <div class="profile-info-item">
                        <div class="info-icon">
                          <SvgIcon icon-class="email" />
                        </div>
                        <div class="info-content">
                          <span class="info-label">邮箱</span>
                          <span class="info-value">{{ userEmail }}</span>
                        </div>
                        <SvgIcon
                          icon-class="chevron-right"
                          class="info-arrow"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Logout -->
                  <div class="setting-section">
                    <button
                      class="logout-btn"
                      type="button"
                      @click="handleLogout"
                    >
                      <SvgIcon icon-class="exitscreen" />
                      <span>退出登录</span>
                    </button>
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

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">显示底部状态栏</span>
                        <span class="item-desc">控制底部状态栏显示/隐藏</span>
                      </div>
                      <el-switch v-model="footerVisible" />
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">多标签导航</span>
                        <span class="item-desc">显示/隐藏页面标签栏</span>
                      </div>
                      <el-switch v-model="tagsVisible" />
                    </div>

                    <div v-if="tagsVisible" class="setting-item">
                      <div class="item-info">
                        <span class="item-label">标签栏风格</span>
                        <span class="item-desc">选择多标签导航的视觉风格</span>
                      </div>
                      <el-select v-model="tagsViewStyle" style="width: 140px">
                        <el-option label="默认风格" value="default" />
                        <el-option label="卡片风格" value="card" />
                        <el-option label="谷歌风格" value="google" />
                      </el-select>
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">显示全局刷新按钮</span>
                        <span class="item-desc">
                          在标题栏显示刷新当前页面按钮
                        </span>
                      </div>
                      <el-switch v-model="refreshBtnVisible" />
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">显示快速入口</span>
                        <span class="item-desc">
                          在标题栏显示快速入口按钮（九宫格面板）
                        </span>
                      </div>
                      <el-switch v-model="fastEnterVisible" />
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">显示全局面包屑导航</span>
                        <span class="item-desc">
                          在标题栏显示当前页面的层级路径
                        </span>
                      </div>
                      <el-switch v-model="breadCrumbVisible" />
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">顶部进度条</span>
                        <span class="item-desc">
                          页面切换时在顶部显示加载进度条（跟随主题色）
                        </span>
                      </div>
                      <el-switch v-model="showNProgress" />
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">全局水印</span>
                        <span class="item-desc">
                          在界面上显示水印标识，防止截图泄密
                        </span>
                      </div>
                      <el-switch v-model="watermarkVisible" />
                    </div>

                    <div v-if="footerVisible" class="setting-item">
                      <div class="item-info">
                        <span class="item-label">底部高度</span>
                        <span class="item-desc">
                          设置底部状态栏高度（20 - 80px）
                        </span>
                      </div>
                      <el-input-number
                        v-model="footerHeight"
                        :min="20"
                        :max="80"
                        :step="1"
                        :controls="true"
                        style="width: 140px"
                      />
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">页面切换动画</span>
                      </div>
                      <el-switch v-model="appStore.transitionEnabled" />
                    </div>

                    <!-- 页面切换动画类型 -->
                    <div v-if="appStore.transitionEnabled" class="setting-item">
                      <div class="item-info">
                        <span class="item-label">页面切换动画类型</span>
                        <span class="item-desc">
                          选择页面切换时使用的动画效果
                        </span>
                      </div>
                      <el-select
                        v-model="appStore.transitionType"
                        style="width: 140px"
                      >
                        <el-option
                          v-for="item in animates"
                          :key="item.value"
                          :label="item.text"
                          :value="item.value"
                        />
                      </el-select>
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">容器宽度</span>
                        <span class="item-desc">设置内容区域的宽度模式</span>
                      </div>
                      <el-select v-model="contentWidth" style="width: 140px">
                        <el-option label="铺满" value="full" />
                        <el-option label="定宽" value="fixed" />
                      </el-select>
                    </div>

                    <div v-if="contentWidth === 'fixed'" class="setting-item">
                      <div class="item-info">
                        <span class="item-label">定宽宽度</span>
                        <span class="item-desc">
                          设置内容区域的固定宽度（800 - 1920px）
                        </span>
                      </div>
                      <el-input-number
                        v-model="contentWidthValue"
                        :min="800"
                        :max="1920"
                        :step="20"
                        :controls="true"
                        style="width: 140px"
                      />
                    </div>
                  </div>

                  <!-- 布局模式 -->
                  <div class="setting-section">
                    <h3 class="section-title">布局模式</h3>
                    <div class="layout-options">
                      <!-- 左侧菜单模式 -->
                      <div
                        class="layout-card"
                        :class="{ active: appStore.layoutMode === 'left' }"
                        @click="appStore.setLayoutMode('left')"
                      >
                        <div class="layout-preview">
                          <div class="preview-layout-sidebar"></div>
                          <div class="preview-layout-main">
                            <div class="preview-layout-header"></div>
                            <div class="preview-layout-content"></div>
                          </div>
                        </div>
                        <span class="layout-label">左侧菜单模式</span>
                      </div>

                      <!-- 顶部菜单模式 -->
                      <div
                        class="layout-card"
                        :class="{ active: appStore.layoutMode === 'top' }"
                        @click="appStore.setLayoutMode('top')"
                      >
                        <div class="layout-preview is-top">
                          <div class="preview-layout-header"></div>
                          <div class="preview-layout-main">
                            <div class="preview-layout-content"></div>
                          </div>
                        </div>
                        <span class="layout-label">顶部菜单模式</span>
                      </div>

                      <!-- 顶部菜单混合模式 -->
                      <div
                        class="layout-card"
                        :class="{ active: appStore.layoutMode === 'top-mixed' }"
                        @click="appStore.setLayoutMode('top-mixed')"
                      >
                        <div class="layout-preview is-top">
                          <div class="preview-layout-header"></div>
                          <div class="preview-layout-main">
                            <div class="preview-layout-sidebar-sub"></div>
                            <div class="preview-layout-content"></div>
                          </div>
                        </div>
                        <span class="layout-label">顶部菜单混合模式</span>
                      </div>

                      <!-- 双列菜单模式 -->
                      <div
                        class="layout-card"
                        :class="{ active: appStore.layoutMode === 'dual' }"
                        @click="appStore.setLayoutMode('dual')"
                      >
                        <div class="layout-preview">
                          <div class="preview-layout-sidebar-narrow"></div>
                          <div class="preview-layout-sidebar-sub"></div>
                          <div class="preview-layout-main">
                            <div class="preview-layout-header"></div>
                            <div class="preview-layout-content"></div>
                          </div>
                        </div>
                        <span class="layout-label">双列菜单模式</span>
                      </div>
                    </div>
                  </div>

                  <!-- 主题颜色 -->
                  <div class="setting-section">
                    <h3 class="section-title">主题颜色</h3>

                    <!-- 预设主题色（参照 art-design-pro ColorSettings.vue） -->
                    <div class="setting-item preset-color-item">
                      <div class="item-info">
                        <span class="item-label">预设主题色</span>
                        <span class="item-desc">
                          点击下方色块快速切换主色，配套信息色/成功/警告/错误色保持不变
                        </span>
                      </div>
                      <div class="preset-color-list">
                        <button
                          v-for="color in presetColors"
                          :key="color"
                          type="button"
                          class="preset-color-dot"
                          :class="{
                            active:
                              themeColors.primary?.toLowerCase() ===
                              color.toLowerCase()
                          }"
                          :style="{ background: color }"
                          :aria-label="`选择主题色 ${color}`"
                          @click="handleSelectPresetColor(color)"
                        >
                          <SvgIcon
                            v-show="
                              themeColors.primary?.toLowerCase() ===
                              color.toLowerCase()
                            "
                            icon-class="check"
                            class="preset-color-dot__icon"
                          />
                        </button>
                      </div>
                    </div>

                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">应用推荐算法的颜色</span>
                      </div>
                      <el-switch
                        v-model="themeColors.useAlgorithm"
                        @change="updateThemeColor"
                      />
                    </div>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">主色</span>
                      </div>
                      <el-color-picker
                        v-model="themeColors.primary"
                        @change="updateThemeColor"
                      />
                    </div>
                    <div class="setting-item">
                      <div
                        class="item-info"
                        style="
                          flex-direction: row;
                          gap: 8px;
                          align-items: center;
                        "
                      >
                        <span class="item-label">信息色</span>
                        <el-checkbox
                          v-model="themeColors.infoFollowPrimary"
                          @change="updateThemeColor"
                        >
                          跟随主色
                        </el-checkbox>
                      </div>
                      <el-color-picker
                        v-model="themeColors.info"
                        :disabled="themeColors.infoFollowPrimary"
                        @change="updateThemeColor"
                      />
                    </div>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">成功色</span>
                      </div>
                      <el-color-picker
                        v-model="themeColors.success"
                        @change="updateThemeColor"
                      />
                    </div>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">警告色</span>
                      </div>
                      <el-color-picker
                        v-model="themeColors.warning"
                        @change="updateThemeColor"
                      />
                    </div>
                    <div class="setting-item">
                      <div class="item-info">
                        <span class="item-label">错误色</span>
                      </div>
                      <el-color-picker
                        v-model="themeColors.error"
                        @change="updateThemeColor"
                      />
                    </div>
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
import { animates } from '@/settings/animateSetting'
import { appPresetColors } from '@/settings/designSetting'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const visible = computed({
  get: () => appStore.settingsVisible,
  set: (val) => appStore.toggleSettings(val)
})

const footerVisible = computed({
  get: () => appStore.footerVisible,
  set: (val) => appStore.setFooterVisible(val)
})

const tagsVisible = computed({
  get: () => appStore.tagsView,
  set: (val) => appStore.setTagsView(val)
})

const tagsViewStyle = computed({
  get: () => appStore.tagsViewStyle,
  set: (val) => appStore.setTagsViewStyle(val)
})

const breadCrumbVisible = computed({
  get: () => appStore.breadCrumb,
  set: (val) => appStore.setBreadCrumb(val)
})

const showNProgress = computed({
  get: () => appStore.showNProgress,
  set: (val) => appStore.setShowNProgress(val)
})

const watermarkVisible = computed({
  get: () => appStore.watermarkVisible,
  set: (val) => appStore.setWatermarkVisible(val)
})

const fastEnterVisible = computed({
  get: () => appStore.fastEnter,
  set: (val) => appStore.setFastEnter(val)
})

const refreshBtnVisible = computed({
  get: () => appStore.refreshBtn,
  set: (val) => appStore.setRefreshBtn(val)
})

const footerHeight = computed({
  get: () => appStore.footerHeight,
  set: (val) => appStore.setFooterHeight(val)
})

const contentWidth = computed({
  get: () => appStore.contentWidth,
  set: (val) => appStore.setContentWidth(val)
})

const contentWidthValue = computed({
  get: () => appStore.contentWidthValue,
  set: (val) => appStore.setContentWidthValue(val)
})

console.log(visible.value)

const tabs = [
  { id: 'general', label: '常规设置', icon: 'settings' },
  { id: 'profile', label: '个人资料', icon: 'user' },
  { id: 'appearance', label: '外观显示', icon: 'appearance' }
]

const currentTab = ref('general')
const currentTabLabel = computed(
  () => tabs.find((t) => t.id === currentTab.value)?.label
)

const themeColors = ref({
  ...appStore.themeColors
})

const presetColors = appPresetColors

const updateThemeColor = () => {
  appStore.setThemeColors(themeColors.value)
}

// 预设主题色快速选择：同步到本地 ref 后调用 store，
// 保证 el-color-picker 的 v-model 也能立即反映变更。
const handleSelectPresetColor = (color) => {
  themeColors.value.primary = color
  if (themeColors.value.infoFollowPrimary) {
    themeColors.value.info = color
  }
  appStore.setPresetThemeColor(color)
}

const form = ref({})

// Profile tab data
const displayName = computed(
  () =>
    userStore.userInfo?.nickname ||
    userStore.userInfo?.name ||
    userStore.userInfo?.username ||
    'Admin'
)

const userAvatar = computed(() => userStore.userInfo?.avatar || '')
const userPhone = computed(
  () => userStore.userInfo?.phone || userStore.userInfo?.mobile || '138****8888'
)
const userEmail = computed(
  () => userStore.userInfo?.email || 'admin@lightning.app'
)
const userRole = computed(() =>
  userStore.roles?.length ? userStore.roles[0].toUpperCase() : 'ADMIN'
)

const avatarLoadFailed = ref(false)
const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())

const handleAvatarUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    // 更新用户头像
    if (userStore.userInfo) {
      userStore.setUserInfo({
        ...userStore.userInfo,
        avatar: e.target.result
      })
    }
  }
  reader.readAsDataURL(file.raw || file)
  return false // 阻止自动上传
}

const handleLogout = async () => {
  await userStore.logoutAction().catch(() => {})
}

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
  height: 600px;
  overflow: hidden;
  background: var(--color-bg-window);

  // border: 1px solid var(--color-border);
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
  padding: 0 26px;
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
  padding: 24px 26px;
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
  padding: 8px;
  margin-bottom: 8px;
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

/* Preset Theme Colors（参照 art-design-pro ColorSettings.vue） */
.preset-color-item {
  flex-direction: column;
  gap: 12px;
  align-items: stretch;

  .item-info {
    width: 100%;
  }
}

.preset-color-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 4px;
}

.preset-color-dot {
  position: relative;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 50%;
  box-shadow: 0 2px 6px -2px rgb(0 0 0 / 35%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    box-shadow: 0 6px 12px -4px rgb(0 0 0 / 45%);
    transform: translateY(-2px);
  }

  &.active {
    border-color: var(--color-primary);
    box-shadow:
      0 0 0 2px var(--color-bg-window),
      0 0 0 4px var(--color-primary),
      0 4px 10px -4px rgb(0 0 0 / 40%);
  }

  &__icon {
    font-size: 14px;
    color: #fff;
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

/* Layout Cards */
.layout-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  // 居中显示
  justify-items: center;
  padding: 8px 0;
}

.layout-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 180px;
  cursor: pointer;
  border-radius: 12px;

  .layout-preview {
    display: flex;
    gap: 8px;
    height: 90px;
    padding: 8px;
    background: transparent;
    border: 2px solid var(--color-border);
    border-radius: 12px;
    transition: all 0.2s;

    &.is-top {
      flex-direction: column;

      .preview-layout-header {
        height: 20px;
        border-radius: 6px;
      }

      .preview-layout-main {
        display: flex;
        flex: 1;
        gap: 8px;
      }
    }

    &:not(.is-top) {
      .preview-layout-main {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 8px;
      }

      .preview-layout-header {
        height: 20px;
        border-radius: 6px;
      }

      .preview-layout-content {
        flex: 1;
        border-radius: 6px;
      }
    }

    .preview-layout-sidebar {
      width: 24px;
      background: #a5b4fc;
      border-radius: 6px;
    }

    .preview-layout-sidebar-narrow {
      width: 12px;
      background: #a5b4fc;
      border-radius: 6px;
    }

    .preview-layout-sidebar-sub {
      width: 24px;
      background: #a5b4fc;
      border-radius: 6px;
    }

    .preview-layout-header {
      background: #6366f1;
      border-radius: 6px;
    }

    .preview-layout-content {
      flex: 1;
      background: #e0e7ff;
      border-radius: 6px;
    }
  }

  .layout-label {
    font-size: 13px;
    color: var(--color-text-secondary);
    text-align: center;
  }

  &:hover .layout-preview {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  &.active {
    .layout-preview {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px
        color-mix(in srgb, var(--color-primary), transparent 80%);
    }

    .layout-label {
      font-weight: 500;
      color: var(--color-primary);
    }
  }
}

/* Profile Page */
.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 32px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;

  .avatar-status-dot {
    position: absolute;
    right: 4px;
    bottom: 4px;
    z-index: 2;
    width: 14px;
    height: 14px;
    background: #10b981;
    border: 3px solid var(--color-bg-window);
    border-radius: 50%;
  }
}

.avatar-wrapper {
  position: relative;
  width: 88px;
  height: 88px;
  overflow: hidden;
  border: 3px solid var(--color-border);
  border-radius: 50%;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-primary);

    .avatar-overlay {
      opacity: 1;
    }
  }
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--brand-accent)
  );
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(2px);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.avatar-edit-btn {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 6px 12px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: rgb(255 255 255 / 20%);
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    background: rgb(255 255 255 / 30%);
  }
}

.avatar-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.avatar-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--brand-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-primary), transparent 40%);
  border-radius: 10px;
}

.profile-info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-info-item {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  background: var(--color-bg-card);
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-border);
    box-shadow: var(--shadow-sm);

    .info-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .info-icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 36px;
    height: 36px;
    color: var(--color-primary);
    background: var(--brand-accent-soft);
    border-radius: 10px;

    :deep(.svg-icon) {
      font-size: 18px;
    }
  }

  .info-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .info-label {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .info-value {
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .info-arrow {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    color: var(--color-text-muted);
    opacity: 0;
    transition: all 0.2s;
    transform: translateX(-4px);
  }
}

.logout-btn {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 44px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-danger);
  cursor: pointer;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--color-danger), transparent 70%);
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: var(--color-danger);
    border-color: var(--color-danger);
    box-shadow: var(--shadow-glow-rose);
  }
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
