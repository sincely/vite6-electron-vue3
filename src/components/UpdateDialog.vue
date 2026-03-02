<template>
  <Teleport to="body">
    <Transition name="update-dialog">
      <div v-if="visible" class="update-overlay" @click.self="handleLater">
        <div class="update-dialog">
          <!-- 顶部装饰光晕 -->
          <div class="update-dialog__glow" aria-hidden="true" />

          <!-- 头部 -->
          <div class="update-dialog__header">
            <div class="update-icon-wrap">
              <SvgIcon icon-class="lucide-rocket" width="28px" height="28px" class="update-rocket" />
            </div>
            <div class="update-dialog__title-group">
              <h3 class="update-dialog__title">发现新版本</h3>
              <p class="update-dialog__subtitle">新版本已就绪，立即更新体验最新功能</p>
            </div>
            <button v-if="!isUpdating" class="update-close-btn" title="稍后提醒" @click="handleLater">
              <SvgIcon icon-class="lucide-x" width="16px" height="16px" />
            </button>
          </div>

          <!-- 版本号对比 -->
          <div class="update-dialog__versions">
            <div class="version-item version-item--current">
              <span class="version-label">当前版本</span>
              <span class="version-num">v{{ currentVersion || '—' }}</span>
            </div>
            <div class="version-arrow">
              <SvgIcon icon-class="lucide-arrow-right" width="16px" height="16px" />
            </div>
            <div class="version-item version-item--latest">
              <span class="version-label">最新版本</span>
              <span class="version-num">v{{ latestVersion || '—' }}</span>
            </div>
          </div>

          <!-- 更新说明占位 -->
          <!-- <div class="update-dialog__notes">
            <p class="notes-title">
              <SvgIcon icon-class="lucide-list" width="13px" height="13px" />
              更新内容
            </p>
            <ul class="notes-list">
              <li>修复已知问题，提升运行稳定性</li>
              <li>优化性能与用户体验</li>
              <li>新增功能与界面改进</li>
            </ul>
          </div> -->

          <!-- 下载进度视图 -->
          <template v-if="isUpdating">
            <div class="update-dialog__progress">
              <div class="progress-header">
                <SvgIcon icon-class="lucide-download" width="15px" height="15px" class="progress-icon" />
                <span class="progress-label">正在下载更新...</span>
                <span class="progress-percent">{{ downloadProgress.toFixed(1) }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: downloadProgress + '%' }" />
              </div>
              <p class="progress-tip">下载完成后将提示安装，请勿关闭应用</p>
            </div>
          </template>

          <!-- 下载完成视图 -->
          <template v-else-if="updateDownloaded">
            <div class="update-dialog__downloaded">
              <div class="downloaded-icon-wrap">
                <SvgIcon icon-class="lucide-success" width="24px" height="24px" class="downloaded-icon" />
              </div>
              <p class="downloaded-title">更新下载完成</p>
              <p class="downloaded-desc">重启应用后将自动完成安装，建议立即重启</p>
            </div>
            <div class="update-dialog__actions">
              <button class="update-btn update-btn--later" @click="handleLater">稍后重启</button>
              <button class="update-btn update-btn--confirm" @click="handleInstall">
                <SvgIcon icon-class="lucide-rotate-ccw" width="15px" height="15px" />
                立即重启安装
              </button>
            </div>
          </template>

          <!-- 默认操作按钮 -->
          <template v-else>
            <div class="update-dialog__actions">
              <button class="update-btn update-btn--later" @click="handleLater">稍后提醒</button>
              <button class="update-btn update-btn--confirm" @click="handleConfirm">
                <SvgIcon icon-class="lucide-download" width="15px" height="15px" />
                立即更新
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onUnmounted } from 'vue'
import { useUpdateStore } from '@/store/modules/update'

const updateStore = useUpdateStore()

const visible = computed(() => updateStore.dialogVisible)
const latestVersion = computed(() => updateStore.latestVersion)
const currentVersion = computed(() => updateStore.currentVersion)
const isUpdating = computed(() => updateStore.isUpdating)
const updateDownloaded = computed(() => updateStore.updateDownloaded)
const downloadProgress = computed(() => updateStore.downloadProgress)
let mockTimer = null

const startMockDownload = () => {
  if (mockTimer) {
    clearInterval(mockTimer)
    mockTimer = null
  }
  updateStore.setUpdating(true)
  updateStore.setUpdateDownloaded(false)
  updateStore.setDownloadProgress(0)

  let progress = 0
  mockTimer = setInterval(() => {
    progress += Math.random() * 8 + 4
    if (progress >= 100) {
      progress = 100
      updateStore.setDownloadProgress(100)
      clearInterval(mockTimer)
      mockTimer = null
      setTimeout(() => {
        updateStore.setUpdating(false)
        updateStore.setUpdateDownloaded(true)
      }, 350)
      return
    }
    updateStore.setDownloadProgress(progress)
  }, 260)
}

const handleConfirm = () => {
  // 不关闭弹框，切换为进度视图
  if (import.meta.env.DEV) {
    startMockDownload()
    return
  }
  updateStore.setUpdating(true)
  window.ipcRenderer.send('start-download')
}

const handleInstall = () => {
  updateStore.setDialogVisible(false)
  window.ipcRenderer.send('install-update')
}

const handleLater = () => {
  // 下载中不允许关闭
  if (isUpdating.value) return
  updateStore.setDialogVisible(false)
}

onUnmounted(() => {
  if (mockTimer) clearInterval(mockTimer)
})
</script>

<style lang="scss" scoped>
.update-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 38%);
  backdrop-filter: blur(6px);
}

.update-dialog {
  position: relative;
  width: 420px;
  overflow: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-surface-border);
  border-radius: var(--radius-xl);
  box-shadow:
    var(--glass-shadow-soft),
    0 0 0 1px color-mix(in srgb, var(--color-primary), transparent 80%);

  &__glow {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 200px;
    height: 200px;
    pointer-events: none;
    background: radial-gradient(circle, color-mix(in srgb, var(--color-primary), transparent 68%) 0%, transparent 70%);
    border-radius: 999px;
  }

  &__header {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 24px 24px 0;
  }

  &__title-group {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-family: Montserrat, sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: 0.2px;
  }

  &__subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--color-text-muted);
  }

  &__versions {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    padding: 16px;
    margin: 20px 24px 0;
    background: color-mix(in srgb, var(--color-bg-hover), transparent 20%);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
  }

  &__notes {
    padding: 14px 16px;
    margin: 16px 24px 0;
    background: color-mix(in srgb, var(--color-bg-hover), transparent 30%);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
  }

  &__actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 20px 24px 24px;
  }
}

// 图标包裹
.update-icon-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary), transparent 72%) 0%,
    color-mix(in srgb, var(--brand-accent-alt), transparent 76%) 100%
  );
  border: 1px solid color-mix(in srgb, var(--color-primary), transparent 60%);
  border-radius: var(--radius-md);

  .update-rocket {
    color: var(--color-primary);
  }
}

// 关闭按钮
.update-close-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--color-text-muted);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }
}

// 版本对比
.version-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  align-items: center;

  .version-label {
    font-size: 11px;
    color: var(--color-text-muted);
    letter-spacing: 0.3px;
  }

  .version-num {
    font-family: Montserrat, sans-serif;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  &--current .version-num {
    color: var(--color-text-secondary);
  }

  &--latest .version-num {
    color: var(--color-primary);
  }
}

.version-arrow {
  color: var(--color-text-muted);
  opacity: 0.6;
}

// 更新说明
.notes-title {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 16px;
  margin: 0;

  li {
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
}

// 下载进度
.update-dialog__progress {
  padding: 18px 20px;
  margin: 20px 24px;
  background: color-mix(in srgb, var(--color-bg-hover), transparent 20%);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
}

.progress-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;

  .progress-icon {
    flex-shrink: 0;
    color: var(--color-primary);
    animation: progress-pulse 1.4s ease-in-out infinite;
  }

  .progress-label {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .progress-percent {
    min-width: 44px;
    font-family: Montserrat, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--color-primary);
    text-align: right;
  }
}

.progress-track {
  height: 6px;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-primary), transparent 84%);
  border-radius: 999px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--brand-accent-alt) 100%);
  border-radius: 999px;
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-primary), transparent 40%);
  transition: width 0.4s ease;
}

.progress-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}

// 下载完成
.update-dialog__downloaded {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 8px;
  text-align: center;
}

.downloaded-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 14px;
  background: color-mix(in srgb, var(--color-success), transparent 84%);
  border: 1px solid color-mix(in srgb, var(--color-success), transparent 60%);
  border-radius: 999px;

  .downloaded-icon {
    color: var(--color-success);
  }
}

.downloaded-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.downloaded-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-muted);
}

@keyframes progress-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

// 操作按钮
.update-btn {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  -webkit-app-region: no-drag;

  &--later {
    color: var(--color-text-secondary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 20%);
    border-color: var(--color-border);

    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
    }
  }

  &--confirm {
    color: #fff;
    background: linear-gradient(100deg, var(--color-primary) 0%, var(--brand-accent-alt) 100%);
    box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--color-primary), transparent 40%);

    &:hover {
      filter: brightness(1.08);
      box-shadow: 0 6px 16px -4px color-mix(in srgb, var(--color-primary), transparent 30%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

// 弹出动画
.update-dialog-enter-active {
  transition: all 0.28s cubic-bezier(0.34, 1.36, 0.64, 1);
}

.update-dialog-leave-active {
  transition: all 0.2s ease;
}

.update-dialog-enter-from {
  opacity: 0;

  .update-dialog {
    transform: scale(0.88) translateY(12px);
  }
}

.update-dialog-leave-to {
  opacity: 0;

  .update-dialog {
    transform: scale(0.94) translateY(6px);
  }
}
</style>
