<template>
  <!-- Teleport 将弹窗渲染到 body，避免被父组件 overflow 裁剪 -->
  <Teleport to="body">
    <Transition name="update-dialog">
      <!-- visible 控制弹窗显隐，点击遮罩层触发 handleLater（下载中时不关闭） -->
      <div v-if="visible" class="update-overlay" @click.self="handleLater">
        <!-- dialogRef 用于拖拽定位，:style="style" 接收 useDraggable 计算的位置 -->
        <div class="update-dialog">
          <!-- 顶部装饰光晕，纯视觉效果，aria-hidden 对屏幕阅读器隐藏 -->
          <div class="update-dialog__glow" aria-hidden="true" />

          <!-- 头部：火箭图标 + 标题 + 关闭按钮（下载中隐藏关闭按钮，防止中断） -->
          <div class="update-dialog__header">
            <div class="update-icon-wrap">
              <SvgIcon
                icon-class="rocket"
                width="28px"
                height="28px"
                class="update-rocket"
              />
            </div>
            <div class="update-dialog__title-group">
              <h3 class="update-dialog__title">
                {{ isForce ? '当前版本已停止支持' : '发现新版本' }}
              </h3>
              <p class="update-dialog__subtitle">
                {{
                  isForce
                    ? '请升级到最新版本以继续使用'
                    : '新版本已就绪，立即更新体验最新功能'
                }}
              </p>
            </div>
            <!-- 仅初始态和下载完成态显示关闭按钮（强制升级时隐藏，防止跳过） -->
            <button
              v-if="!isUpdating && !isForce"
              class="update-close-btn"
              title="稍后提醒"
              @click="handleLater"
            >
              <SvgIcon icon-class="close" width="16px" height="16px" />
            </button>
          </div>

          <!-- 版本号对比区域：当前版本 → 最新版本，始终显示 -->
          <div class="update-dialog__versions">
            <div class="version-item version-item--current">
              <span class="version-label">当前版本</span>
              <span class="version-num">v{{ currentVersion || '—' }}</span>
            </div>
            <div class="version-arrow">
              <SvgIcon icon-class="arrow-right" width="16px" height="16px" />
            </div>
            <div class="version-item version-item--latest">
              <span class="version-label">最新版本</span>
              <span class="version-num">v{{ latestVersion || '—' }}</span>
            </div>
          </div>
          <!-- 灰度发布徽标：stagingPercentage 存在时展示分批比例 -->
          <div v-if="rolloutPercent > 0" class="update-dialog__rollout">
            <SvgIcon icon-class="shield-check" width="12px" height="12px" />
            灰度发布 {{ rolloutPercent }}%
          </div>
          <!-- 状态 1：下载中视图 -->
          <template v-if="isUpdating">
            <div class="update-dialog__progress">
              <!-- 进度条头部：下载图标（带呼吸动画）+ 标签 + 百分比 -->
              <div class="progress-header">
                <SvgIcon
                  icon-class="download"
                  width="15px"
                  height="15px"
                  class="progress-icon"
                />
                <span class="progress-label">正在下载更新...</span>
                <!-- downloadProgress 是平滑显示值，非主进程直接上报值 -->
                <span class="progress-percent">
                  {{ downloadProgress.toFixed(1) }}%
                </span>
              </div>
              <!-- 进度条轨道：width 由 downloadProgress 控制 -->
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: downloadProgress + '%' }"
                />
              </div>
              <!-- 进度条底部元信息：左侧下载速度，右侧已下载/总大小 -->
              <div class="progress-meta">
                <span class="progress-speed">{{ formattedDownloadSpeed }}</span>
                <span class="progress-volume">
                  {{ formattedDownloadVolume }}
                </span>
              </div>
              <p class="progress-tip">下载完成后将提示安装，请勿关闭应用</p>
            </div>
          </template>

          <!-- 状态 2：下载完成视图 -->
          <template v-else-if="updateDownloaded">
            <div class="update-dialog__downloaded">
              <div class="downloaded-icon-wrap">
                <SvgIcon
                  icon-class="success"
                  width="24px"
                  height="24px"
                  class="downloaded-icon"
                />
              </div>
              <p class="downloaded-title">更新下载完成</p>
              <p class="downloaded-desc">
                重启应用后将自动完成安装，建议立即重启
              </p>
            </div>
            <!-- 操作按钮：稍后重启 / 立即重启安装（强制升级时隐藏稍后按钮） -->
            <div class="update-dialog__actions">
              <button
                v-if="!isForce"
                class="update-btn update-btn--later"
                @click="handleLater"
              >
                稍后重启
              </button>
              <button
                class="update-btn update-btn--confirm"
                @click="handleInstall"
              >
                <SvgIcon icon-class="rotate-ccw" width="15px" height="15px" />
                立即重启安装
              </button>
            </div>
          </template>

          <!-- 状态 3：初始态 / 发现更新视图 -->
          <template v-else>
            <!-- 操作按钮：稍后更新 / 立即更新（强制升级时隐藏稍后按钮） -->
            <div class="update-dialog__actions">
              <button
                v-if="!isForce"
                class="update-btn update-btn--later"
                @click="handleLater"
              >
                稍后更新
              </button>
              <button
                class="update-btn update-btn--confirm"
                @click="handleConfirm"
              >
                <SvgIcon icon-class="download" width="15px" height="15px" />
                {{ isForce ? '立即升级' : '立即更新' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * 更新弹窗组件 (UpdateDialog)
 *
 * 整体架构：
 * ┌─────────────────────────────────────────────────────────────┐
 * │  主进程 (electron-updater)                                   │
 * │    ↓ IPC 事件                                                │
 * │  update.js (useUpdater hook)                                │
 * │    ↓ 转换为 CustomEvent (update:available 等)               │
 * │  本组件 (UpdateDialog)                                       │
 * │    ↓ 监听事件 → 切换三种视图状态                              │
 * │  [发现更新] → [下载中] → [下载完成]                          │
 * └─────────────────────────────────────────────────────────────┘
 *
 * 三种视图状态说明：由 isUpdating / updateDownloaded 控制
 *           状态 1: 下载中 (isUpdating = true)
 *             显示：进度条、百分比、下载速度、已下载/总大小
 *             隐藏：关闭按钮（防止用户中途关闭中断下载）
 *
 *           状态 2: 下载完成 (isUpdating = false, updateDownloaded = true)
 *             显示：成功图标 + "立即重启安装"/"稍后重启"按钮
 *             用户点击重启后主进程执行安装并重启应用
 *
 *           状态 3: 初始态 / 发现更新 (isUpdating = false, updateDownloaded = false)
 *             显示："立即更新"/"稍后更新"按钮
 *             用户点击后立即开始下载，进入状态 1
 * 三种视图状态：
 *   1. 发现更新（初始态）：显示版本对比 + "立即更新"/"稍后更新"按钮
 *   2. 下载中（isUpdating=true）：显示进度条、速度、已下载/总大小
 *   3. 下载完成（updateDownloaded=true）：显示成功提示 + "立即重启"/"稍后重启"按钮
 *
 * 平滑进度动画机制：
 *   - targetDownloadProgress：主进程上报的真实进度（可能跳变）
 *   - downloadProgress：UI 显示的平滑进度（通过定时器逐帧追赶 target）
 *   - syncProgressDisplay() 启动动画定时器，以 80ms 间隔插值追赶
 */
import { useUpdateStore } from '@/store/modules/version'
import { formatFileSize } from '@/utils/common'

const updateStore = useUpdateStore()

// ─── 弹窗与版本状态 ────────────────────────────────────────────────────
const visible = ref(false) // 弹窗是否可见
const latestVersion = computed(() => updateStore.latestVersion) // 最新版本号（从 Store 读取）
const currentVersion = computed(() => updateStore.currentVersion) // 当前版本号（从 Store 读取）

// ─── 强制升级模式与灰度发布状态 ────────────────────────────────────────
// 强制升级：当前版本被远端禁用，弹窗不可跳过、不可关闭
const isForce = computed(() => updateStore.forceUpdate)
// 灰度发布信息（来自 update-available payload 的 stagingPercentage）
const rolloutInfo = ref(null)
const rolloutPercent = computed(() => rolloutInfo.value?.stagingPercentage ?? 0)

// ─── 下载状态机 ────────────────────────────────────────────────────────
// 三种状态由 isUpdating 和 updateDownloaded 组合表达：
//   初始态:    isUpdating=false, updateDownloaded=false  → 显示"立即更新"按钮
//   下载中:    isUpdating=true,  updateDownloaded=false  → 显示进度条
//   下载完成:  isUpdating=false, updateDownloaded=true   → 显示"立即重启"按钮
const isUpdating = ref(false) // 是否正在下载中
const updateDownloaded = ref(false) // 下载是否已完成

// ─── 进度相关（双缓冲机制：target 是真实值，display 是平滑显示值）─────
const downloadProgress = ref(0) // 显示进度（平滑值，0-100）
const targetDownloadProgress = ref(0) // 目标进度（真实值，主进程上报）
const downloadSpeed = ref(0) // 下载速度（bytes/s）
const transferredBytes = ref(0) // 已下载字节数
const totalBytes = ref(0) // 总文件大小（字节）

/**
 * 格式化下载速度
 * 速度为 0 时显示"测速中…"，否则显示如 "2.3 MB/s"
 */
const formattedDownloadSpeed = computed(() => {
  if (downloadSpeed.value <= 0) {
    return '下载中…'
  }

  return `${formatFileSize(Math.round(downloadSpeed.value))}/s`
})

/**
 * 格式化已下载/总大小
 * 优先显示 "已下载 / 总大小"，仅有已下载时只显示已下载
 */
const formattedDownloadVolume = computed(() => {
  if (totalBytes.value > 0) {
    return `${formatFileSize(Math.round(transferredBytes.value))} / ${formatFileSize(Math.round(totalBytes.value))}`
  }

  if (transferredBytes.value > 0) {
    return formatFileSize(Math.round(transferredBytes.value))
  }

  return '等待下载数据…'
})

// ─── 定时器管理 ────────────────────────────────────────────────────────
// mockTimer:      开发环境模拟下载的定时器
// progressTimer:  平滑进度动画的定时器（每 80ms 执行一次）
// completeTimer:  下载完成后的延迟切换定时器（等进度动画走完再切换视图）
let mockTimer = null
let progressTimer = null
let completeTimer = null

/** 清理平滑进度动画定时器 */
const clearProgressTimer = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

/** 清理下载完成延迟定时器 */
const clearCompleteTimer = () => {
  if (completeTimer) {
    clearTimeout(completeTimer)
    completeTimer = null
  }
}

/**
 * 启动平滑进度动画
 *
 * 原理：每 80ms 将 downloadProgress 向 targetDownloadProgress 逼近一步
 * 步长计算公式：
 *   - 接近 99% 时步长缩小（0.08~0.9），避免进度"假死"在 99%
 *   - 远离目标时步长较大（0.18~1.6），快速追赶
 *   - 当差距 < 0.05% 时直接跳到目标值并停止定时器
 *
 * 防重入：如果 progressTimer 已存在则不重复创建
 */
const syncProgressDisplay = () => {
  if (progressTimer) return

  progressTimer = setInterval(() => {
    const gap = targetDownloadProgress.value - downloadProgress.value

    // 差距极小，直接同步并停止动画
    if (gap <= 0.05) {
      downloadProgress.value = targetDownloadProgress.value
      clearProgressTimer()
      return
    }

    // 动态计算步长：接近完成时减速，远离目标时加速
    const step = Math.min(
      targetDownloadProgress.value >= 99 ? 0.9 : 1.6, // 最大步长上限
      Math.max(targetDownloadProgress.value >= 99 ? 0.08 : 0.18, gap * 0.16) // 最小步长下限
    )

    downloadProgress.value = Math.min(
      downloadProgress.value + step,
      targetDownloadProgress.value // 不超过目标值
    )
  }, 80) // 80ms 间隔 ≈ 12.5fps，足够平滑且不消耗性能
}

/**
 * 重置所有进度指标为初始值
 * 清理动画定时器，归零所有进度相关 ref
 */
const resetProgressMetrics = () => {
  clearProgressTimer()
  clearCompleteTimer()
  downloadProgress.value = 0
  targetDownloadProgress.value = 0
  downloadSpeed.value = 0
  transferredBytes.value = 0
  totalBytes.value = 0
}

/**
 * 重置整个下载状态到初始态
 * 同时清理 mock 定时器（开发环境专用）
 */
const resetDownloadState = () => {
  if (mockTimer) {
    clearInterval(mockTimer)
    mockTimer = null
  }
  isUpdating.value = false
  updateDownloaded.value = false
  resetProgressMetrics()
}

/**
 * 下载完成处理
 *
 * 流程：
 *   1. 将目标进度设为 100%，触发平滑动画跑完剩余进度
 *   2. 等待 360ms（让进度动画走完）
 *   3. 强制设置进度为 100%，切换视图到"下载完成"态
 *   4. 更新 Store 中的最新版本号
 *
 * @param {Object} info - 下载完成信息，包含 version 字段
 */
const completeDownload = (info) => {
  clearCompleteTimer()
  targetDownloadProgress.value = 100
  downloadSpeed.value = 0 // 下载完成，速度归零

  if (totalBytes.value > 0) {
    transferredBytes.value = totalBytes.value // 确保显示 100%
  }

  syncProgressDisplay() // 启动平滑动画跑向 100%

  // 延迟 360ms 后切换到"下载完成"视图（等待进度动画走完）
  completeTimer = setTimeout(() => {
    clearProgressTimer()
    downloadProgress.value = 100
    targetDownloadProgress.value = 100
    isUpdating.value = false
    updateDownloaded.value = true

    if (info?.version) {
      updateStore.setLatestVersion(info.version)
    }
  }, 360)
}

// ─── 开发环境：模拟下载 ────────────────────────────────────────────────

/**
 * 模拟下载过程（仅 DEV 环境使用）
 *
 * 模拟真实的下载行为：
 *   - 随机生成 110~180 MB 的文件大小
 *   - 每 240ms 产生一个随机大小的数据块
 *   - 下载速度随进度递减（模拟真实网络波动）：
 *     > 82% 进度时降速到 48%
 *     > 58% 进度时降速到 72%
 *     其他阶段为全速
 *   - 进度上限 99.2%（避免提前到 100%，由 completeDownload 统一处理）
 */
const startMockDownload = () => {
  if (mockTimer) {
    clearInterval(mockTimer)
    mockTimer = null
  }

  resetProgressMetrics()
  isUpdating.value = true
  updateDownloaded.value = false

  // 随机生成 110~180 MB 的模拟文件大小
  const total = (110 + Math.random() * 70) * 1024 * 1024
  let transferred = 0

  totalBytes.value = total

  mockTimer = setInterval(() => {
    const ratio = transferred / total
    // 模拟真实网络：后期降速
    const slowdown = ratio > 0.82 ? 0.48 : ratio > 0.58 ? 0.72 : 1
    // 每次推送的数据块大小（基于 240ms 间隔计算速度）
    const chunk = (0.9 + Math.random() * 1.8) * 1024 * 1024 * slowdown * 0.24

    transferred = Math.min(transferred + chunk, total)
    transferredBytes.value = transferred
    downloadSpeed.value = chunk / 0.24 // 换算为 bytes/s
    targetDownloadProgress.value = Math.min((transferred / total) * 100, 99.2) // 上限 99.2%
    syncProgressDisplay()

    // 下载完成，停止模拟
    if (transferred >= total) {
      clearInterval(mockTimer)
      mockTimer = null
      completeDownload({ version: latestVersion.value })
    }
  }, 240)
}

// ─── 用户操作处理 ──────────────────────────────────────────────────────

/**
 * 点击"立即更新"按钮
 * - DEV 环境：启动模拟下载
 * - PROD 环境：通知主进程开始下载更新包
 */
const handleConfirm = () => {
  if (import.meta.env.DEV) {
    startMockDownload()
    return
  }

  resetProgressMetrics()
  isUpdating.value = true
  updateDownloaded.value = false
  ipcRenderer.send('start-download') // 通知主进程开始下载
}

/**
 * 点击"立即重启安装"按钮
 * 更新 Store 中的当前版本号为最新版本，通知主进程执行安装并重启
 */
const handleInstall = () => {
  if (latestVersion.value) {
    updateStore.setCurrentVersion(latestVersion.value)
  }
  visible.value = false
  ipcRenderer.send('install-update') // 通知主进程安装更新（会重启应用）
}

/**
 * 点击"稍后更新"/"稍后重启"或关闭按钮
 * 下载进行中或强制升级时禁止关闭，防止中断下载/跳过强制升级
 */
const handleLater = () => {
  if (isUpdating.value) return // 下载中不允许关闭
  if (isForce.value) return // 强制升级不允许跳过
  visible.value = false
}

// ─── 事件监听器引用（用于 onUnmounted 清理）──────────────────────────
let onProgress = null
let onDownloaded = null
let onError = null
let onNotAvailable = null
let onAvailable = null
let onOpenDialog = null
let onConfig = null
let onForce = null
let onRemoveLoading = null

// ─── 组件挂载：注册所有事件监听 ────────────────────────────────────────

onMounted(() => {
  // 标志 loading 页面是否已经结束（防止更新弹窗与 loading 页面同时出现）
  let loadingFinished = false

  // 如果 loading 已经结束，检查是否需要显示更新弹窗
  const checkAndShowDialog = () => {
    if (
      loadingFinished &&
      latestVersion.value &&
      latestVersion.value !== currentVersion.value
    ) {
      visible.value = true
    }
  }

  /**
   * 监听 loading 结束消息
   * 通过 window.postMessage 接收来自 preload 脚本的消息
   * 确保更新弹窗不会在 loading 动画显示时弹出
   */
  onRemoveLoading = (event) => {
    if (event.data?.payload === 'loadingFinished') {
      loadingFinished = true
      // checkAndShowDialog()
    }
  }
  window.addEventListener('message', onRemoveLoading)

  // 兜底机制：如果 5 秒内仍未收到 loadingFinished 消息，也认为 loading 结束
  // 对应 preload 脚本中的 setTimeout 兜底逻辑
  setTimeout(() => {
    if (!loadingFinished) {
      loadingFinished = true
      // checkAndShowDialog()
    }
  }, 4500)

  /**
   * IPC 事件：下载进度更新
   * 主进程通过 electron-updater 实时推送下载进度
   * 将进度值写入 target，由 syncProgressDisplay 平滑动画追赶
   * 注意：进度上限 99.2%，避免在 completeDownload 之前显示 100%
   */
  onProgress = (_, progress) => {
    isUpdating.value = true
    updateDownloaded.value = false
    downloadSpeed.value = progress?.bytesPerSecond ?? 0
    transferredBytes.value = progress?.transferred ?? 0
    totalBytes.value = progress?.total ?? totalBytes.value
    targetDownloadProgress.value = Math.min(progress?.percent ?? 0, 99.2)
    syncProgressDisplay()
  }

  /**
   * IPC 事件：更新包下载完成
   * 触发 completeDownload 流程：平滑跑完进度 → 延迟切换视图
   */
  onDownloaded = (_event, info) => {
    completeDownload(info)
  }

  /**
   * IPC 事件：更新过程出错
   * 重置下载状态，输出错误日志
   * 用户可再次点击"立即更新"重试
   */
  onError = (_, message) => {
    isUpdating.value = false
    downloadSpeed.value = 0
    clearProgressTimer()
    clearCompleteTimer()
  }

  /**
   * IPC 事件：没有可用更新
   * 仅在非下载状态下关闭弹窗并重置状态
   * 下载中收到此事件不做处理（防止误关）
   */
  onNotAvailable = () => {
    if (!isUpdating.value) {
      visible.value = false
      resetDownloadState()
    }
  }

  /**
   * CustomEvent：发现新版本（由 useUpdater hook 派发）
   * 流程：更新 Store 版本号 → 记录灰度信息 → 重置下载状态 → 检查是否可弹窗
   * 自动下载模式（远端配置 autoDownload=true）：直接进入下载态（主进程已开始下载）
   */
  onAvailable = (event) => {
    const info = event.detail || {}
    if (info.version) {
      updateStore.setLatestVersion(info.version)
    }
    rolloutInfo.value = info // 记录灰度信息（stagingPercentage / rolloutMode）
    resetDownloadState()
    if (updateStore.autoDownload) {
      visible.value = true
      isUpdating.value = true
      return
    }
    // checkAndShowDialog()
  }

  /**
   * CustomEvent：用户手动触发检查更新（从应用菜单）
   * 由 useUpdater hook 监听 menu-check-update IPC 后派发
   *
   * 处理逻辑：
   *   - 如果已有新版本信息且与当前版本不同：直接弹窗
   *   - 否则：通知主进程执行检查更新（会触发 update-available 或 update-not-available）
   */
  onOpenDialog = () => {
    if (latestVersion.value && latestVersion.value !== currentVersion.value) {
      resetDownloadState()
      visible.value = true
      return
    }
    ipcRenderer.send('check-for-updates') // 通知主进程检查更新
  }

  /**
   * CustomEvent：远端更新配置变化（由 useUpdater hook 转发 update-config）
   * 同步 eligible（更新资格开关）与 autoDownload（自动下载策略）到 Store
   */
  onConfig = (event) => {
    const config = event.detail || {}
    if (typeof config.eligible === 'boolean') {
      updateStore.setUpdateEligible(config.eligible)
    }
    if (typeof config.autoDownload === 'boolean') {
      updateStore.setAutoDownload(config.autoDownload)
    }
  }

  /**
   * CustomEvent：强制升级信号（当前版本被远端禁用，由 useUpdater hook 转发 force-update）
   * 立即弹窗且不可跳过，用户只能升级到最新版本
   */
  onForce = (event) => {
    const payload = event.detail || {}
    if (payload?.currentVersion) {
      updateStore.setCurrentVersion(payload.currentVersion)
    }
    updateStore.setForceUpdate(true)
    resetDownloadState()
    visible.value = true
  }

  // 注册 IPC 事件监听（直接来自主进程）
  ipcRenderer.on('download-progress', onProgress)
  ipcRenderer.on('update-downloaded', onDownloaded)
  ipcRenderer.on('update-error', onError)
  ipcRenderer.on('update-not-available', onNotAvailable)
  // 注册 CustomEvent 监听（由 useUpdater hook 转发）
  window.addEventListener('update:available', onAvailable)
  window.addEventListener('update:open-dialog', onOpenDialog)
  window.addEventListener('update:config', onConfig)
  window.addEventListener('update:force', onForce)
})

// ─── 组件卸载：清理所有监听和定时器 ───────────────────────────────────

onUnmounted(() => {
  // 重置下载状态，清理所有定时器
  resetDownloadState()
  // 移除 IPC 事件监听
  ipcRenderer.off('download-progress', onProgress)
  ipcRenderer.off('update-downloaded', onDownloaded)
  ipcRenderer.off('update-error', onError)
  ipcRenderer.off('update-not-available', onNotAvailable)
  // 移除 CustomEvent 监听
  window.removeEventListener('update:available', onAvailable)
  window.removeEventListener('update:open-dialog', onOpenDialog)
  window.removeEventListener('update:config', onConfig)
  window.removeEventListener('update:force', onForce)
  // 移除 loading 消息监听
  window.removeEventListener('message', onRemoveLoading)
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
  width: 440px;
  overflow: hidden;
  background: var(--glass-surface);
  backdrop-filter: blur(5px);
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
    background: radial-gradient(
      circle,
      color-mix(in srgb, var(--color-primary), transparent 68%) 0%,
      transparent 70%
    );
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
  color: var(--color-text-secondary);
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
  color: var(--color-text-secondary);
}

// 灰度发布徽标
.update-dialog__rollout {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 3px 10px;
  margin: 10px auto 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--brand-accent-alt);
  background: color-mix(in srgb, var(--brand-accent-alt), transparent 88%);
  border: 1px solid color-mix(in srgb, var(--brand-accent-alt), transparent 70%);
  border-radius: 999px;
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
  gap: 6px;
  padding-left: 0;
  margin: 0;
  list-style: none; // emoji 前缀作为视觉标识，不需要默认圆点

  li {
    display: flex;
    gap: 6px;
    align-items: baseline;
    font-size: 13px;
    line-height: 1.55;
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
    font-size: 13px;
    font-weight: 700;
    color: var(--color-primary);
    text-align: right;
  }
}

.progress-track {
  height: 6px;
  margin-bottom: 12px;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-primary), transparent 84%);
  border-radius: 999px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-primary) 0%,
    var(--brand-accent-alt) 100%
  );
  border-radius: 999px;
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-primary), transparent 40%);
  transition: width 0.16s linear;
}

.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  line-height: 1.4;
}

.progress-speed {
  font-weight: 600;
  color: var(--color-primary);
}

.progress-volume {
  color: var(--color-text-secondary);
}

.progress-tip {
  margin: 8px 0 0;
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
    background: linear-gradient(
      100deg,
      var(--color-primary) 0%,
      var(--brand-accent-alt) 100%
    );
    box-shadow: 0 4px 12px -4px
      color-mix(in srgb, var(--color-primary), transparent 40%);

    &:hover {
      filter: brightness(1.08);
      box-shadow: 0 6px 16px -4px
        color-mix(in srgb, var(--color-primary), transparent 30%);
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
