import { app, dialog } from 'electron'
import logger from './log'
import { getAutoUpdater } from './autoUpdater'
import createNotification from './notification'
import { setTrayToolTip, setUpdatePendingInstall } from './tray'
import {
  getUpdateConfig,
  refreshUpdateConfig,
  startConfigPolling,
  isVersionDisabled,
  setConfigChangeHandler
} from './updateConfig'

let mainWindow = null
const UPDATE_URL = normalizeUpdateUrl(process.env.VITE_UPDATE_URL)

// 规范更新服务地址
function normalizeUpdateUrl(url) {
  if (!url) {
    return ''
  }
  return url.endsWith('/') ? url : `${url}/`
}

// 构建更新负载
function buildUpdatePayload(info) {
  return {
    ...info,
    rolloutMode: typeof info?.stagingPercentage === 'number' ? 'batch' : 'full'
  }
}

// 发送更新负载到渲染进程
function sendToRenderer(channel, payload) {
  if (
    mainWindow &&
    !mainWindow.isDestroyed() &&
    mainWindow.webContents &&
    !mainWindow.webContents.isDestroyed()
  ) {
    mainWindow.webContents.send(channel, payload)
  }
}

// ─── 后台下载辅助（窗口最小化/隐藏时的进度反馈）─────────────────────

// 清除后台下载的任务栏进度条与托盘进度提示
function clearBackgroundProgress() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setProgressBar(-1)
  }
  setTrayToolTip(app.getName())
}

/**
 * 下载完成时的后台提醒
 * 窗口不可见/最小化/未聚焦时：macOS Dock 弹跳 + 系统原生通知（点击恢复窗口）
 * 窗口正在前台时由应用内弹窗接管，不重复打扰
 */
function notifyUpdateReady(payload) {
  const winInView =
    mainWindow &&
    !mainWindow.isDestroyed() &&
    mainWindow.isVisible() &&
    !mainWindow.isMinimized() &&
    mainWindow.isFocused()
  if (winInView) return

  if (process.platform === 'darwin') app.dock?.bounce('informational')
  createNotification({
    title: '更新下载完成',
    body: `新版本 v${payload.version} 已就绪，点击恢复窗口进行安装`,
    type: 'success',
    noToast: true, // 窗口隐藏时应用内 toast 不可见，仅发系统通知
    onClick: () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })
}

// ─── 检查更新（带门控）─────────────────────────────────────

let manualCheckPending = false // 本次检查是否由用户手动触发（菜单/托盘/设置页）

/**
 * 手动检查更新且已是最新版本时的弹窗提示
 * 自动检查（启动/聚焦触发）保持静默，不打扰用户
 */
function showUpToDateDialog(version) {
  const options = {
    type: 'info',
    title: '检查更新',
    message: `当前版本已是最新版本 (v${version})`,
    buttons: ['确定'],
    defaultId: 0
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    dialog.showMessageBox(mainWindow, options)
  } else {
    dialog.showMessageBox(options)
  }
}

/**
 * 带门控的检查更新
 * - eligible=false 时禁止检查（跳过）
 * - 当前版本被远端禁用时推送强制升级信号（仍继续检查）
 * - manual=true 表示用户手动触发，已是最新版本时弹窗告知
 * 供启动检查、窗口聚焦、手动检查（ipc/update.js）共用
 */
export async function checkForUpdates({ manual = false } = {}) {
  const config = getUpdateConfig()
  const autoUpdater = await getAutoUpdater()

  // 门控 1：更新资格开关（远端 eligible=false 时禁止检查更新）
  if (!config.eligible) {
    logger.warn('[updater] 远端配置禁止更新（eligible=false），跳过检查')
    sendToRenderer('update-config', config)
    return
  }

  // 门控 2：当前版本被远端禁用 → 推送强制升级信号（渲染层弹不可跳过的升级窗）
  const currentVersion = app.getVersion()
  if (isVersionDisabled(currentVersion, config.disabledClientVersions)) {
    logger.warn(`[updater] 当前版本 ${currentVersion} 已被远端禁用，强制升级`)
    sendToRenderer('force-update', { currentVersion })
  }

  manualCheckPending = manual // 标记本次检查来源，决定"已是最新"是否弹窗反馈
  autoUpdater.checkForUpdates()
}

// 初始化更新器
export const initUpdater = async (win) => {
  mainWindow = win

  // 窗口事件同步注册，避免 await 加载 electron-updater 期间错过事件
  win.on('closed', () => {
    mainWindow = null
  })
  // 启动即检查更新（受门控控制）
  win.webContents.once('did-finish-load', () => {
    checkForUpdates()
  })
  // 窗口聚焦时检查更新（对齐 QoderWork，由 checkOnFocus 控制）
  win.on('focus', () => {
    if (getUpdateConfig().checkOnFocus) {
      checkForUpdates()
    }
  })

  const autoUpdater = await getAutoUpdater() // 首次使用才加载 electron-updater
  autoUpdater.logger = logger // 设置日志记录器
  autoUpdater.autoDownload = getUpdateConfig().autoDownload // 默认按兜底配置
  autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development' // 强制开发环境更新
  autoUpdater.allowDowngrade = false // 禁用降级更新

  if (UPDATE_URL) {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: UPDATE_URL
    })
  }

  // 配置变化回调：推送渲染层 + 同步 autoDownload 到更新器
  setConfigChangeHandler((config) => {
    autoUpdater.autoDownload = config.autoDownload
    sendToRenderer('update-config', config)
  })

  logger.info(
    '更新服务地址：',
    UPDATE_URL || '使用 electron-builder 默认 publish 配置'
  )
  const eventNames = [
    'checking-for-update',
    'update-not-available',
    'update-available',
    'download-progress',
    'update-downloaded',
    'quit-and-install',
    'error'
  ]
  eventNames.forEach((eventName) => {
    autoUpdater.removeAllListeners(eventName)
  })

  autoUpdater.on('checking-for-update', () => {
    logger.info('正在检查更新')
    sendToRenderer('checking-for-update')
  })

  autoUpdater.on('update-not-available', (info) => {
    const version = info?.version || autoUpdater.currentVersion.version
    logger.info(`当前已是最新版本 ${version}`)
    sendToRenderer('update-not-available', info)
    // 手动检查（菜单/托盘/设置页）：弹窗告知已是最新版本；自动检查保持静默
    if (manualCheckPending) {
      manualCheckPending = false
      showUpToDateDialog(version)
    }
  })

  autoUpdater.on('update-available', (info) => {
    manualCheckPending = false // 发现新版本时由更新弹窗接管反馈
    const payload = buildUpdatePayload(info)
    const rolloutText =
      typeof payload.stagingPercentage === 'number'
        ? `（灰度 ${payload.stagingPercentage}%）`
        : ''
    logger.info(`检测到新版本 ${payload.version}${rolloutText}`)
    sendToRenderer('update-available', payload)
  })

  autoUpdater.on('download-progress', (progress) => {
    logger.info(`下载进度: ${progress.percent.toFixed(2)}%`)
    sendToRenderer('download-progress', progress)
    // 后台下载反馈：任务栏/Dock 进度条 + 托盘 tooltip，窗口最小化时仍可见进度
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setProgressBar(progress.percent / 100)
    }
    setTrayToolTip(
      `${app.getName()} - 正在下载更新 ${Math.floor(progress.percent)}%`
    )
  })

  autoUpdater.on('update-downloaded', (info) => {
    const payload = buildUpdatePayload(info)
    logger.info(`下载完成，准备安装 ${payload.version}`)
    sendToRenderer('update-downloaded', payload)
    clearBackgroundProgress()
    setUpdatePendingInstall(payload.version) // 托盘菜单展示"重启安装更新"入口
    notifyUpdateReady(payload) // 窗口在后台时系统通知提醒
  })

  autoUpdater.on('quit-and-install', () => {
    logger.info('安装完成，重启应用')
    sendToRenderer('quit-and-install')
  })

  autoUpdater.on('error', (error) => {
    manualCheckPending = false // 检查失败不再弹"已是最新"提示
    logger.error('更新出错：', error.message)
    sendToRenderer('update-error', error.message)
    clearBackgroundProgress() // 出错时清理任务栏进度与托盘提示
  })

  // 启动时拉取远端配置（eligible/禁用版本/autoDownload），并启动轮询
  await refreshUpdateConfig()
  autoUpdater.autoDownload = getUpdateConfig().autoDownload
  startConfigPolling()
}
