import pkg from 'electron-updater'
import logger from './log'

const { autoUpdater } = pkg
let mainWindow = null
const UPDATE_URL = normalizeUpdateUrl(process.env.VITE_UPDATE_URL)
const UPDATE_CHANNEL = resolveUpdateChannel()
const IS_BATCH_UPDATE_CHANNEL = UPDATE_CHANNEL !== 'latest'

// 规范更新服务地址
function normalizeUpdateUrl(url) {
  if (!url) {
    return ''
  }
  return url.endsWith('/') ? url : `${url}/`
}

// 解析更新通道
function resolveUpdateChannel() {
  const [prereleaseChannel] = autoUpdater.currentVersion?.prerelease ?? []

  if (typeof prereleaseChannel === 'string' && prereleaseChannel) {
    return prereleaseChannel
  }

  return 'latest'
}

// 构建更新负载
function buildUpdatePayload(info) {
  return {
    ...info,
    channel: UPDATE_CHANNEL,
    rolloutMode: typeof info?.stagingPercentage === 'number' ? 'batch' : 'full'
  }
}

// 发送更新负载到渲染进程
function sendToRenderer(channel, payload) {
  mainWindow?.webContents.send(channel, payload)
}

// 初始化更新器
export const initUpdater = async (win) => {
  mainWindow = win
  autoUpdater.logger = logger // 设置日志记录器
  autoUpdater.autoDownload = false // 禁用自动下载
  autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development' // 强制开发环境更新
  autoUpdater.channel = UPDATE_CHANNEL // 设置更新通道
  autoUpdater.allowPrerelease = IS_BATCH_UPDATE_CHANNEL // 允许预发布版本
  autoUpdater.allowDowngrade = false // 禁用降级更新

  if (UPDATE_URL) {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: UPDATE_URL
    })
  }

  logger.info(
    '更新服务地址：',
    UPDATE_URL || '使用 electron-builder 默认 publish 配置'
  )
  logger.info(
    `更新通道：${UPDATE_CHANNEL}，更新策略：${IS_BATCH_UPDATE_CHANNEL ? '分批更新' : '全量更新'}`
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
    logger.info(`正在检查更新，通道：${UPDATE_CHANNEL}`)
    sendToRenderer('checking-for-update')
  })

  autoUpdater.on('update-not-available', (info) => {
    const payload = buildUpdatePayload(info)
    logger.info(
      `当前已是最新版本 ${payload.version || autoUpdater.currentVersion.version}，通道：${payload.channel}`
    )
    sendToRenderer('update-not-available', payload)
  })

  autoUpdater.on('update-available', (info) => {
    const payload = buildUpdatePayload(info)
    const rolloutText =
      typeof payload.stagingPercentage === 'number'
        ? `分批比例：${payload.stagingPercentage}%`
        : '全量发布'
    logger.info(
      `检测到新版本 ${payload.version}，通道：${payload.channel}，${rolloutText}`
    )
    sendToRenderer('update-available', payload)
  })

  autoUpdater.on('download-progress', (progress) => {
    logger.info(`下载进度: ${progress.percent.toFixed(2)}%`)
    sendToRenderer('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    const payload = buildUpdatePayload(info)
    logger.info(
      `下载完成，准备安装 ${payload.version}，通道：${payload.channel}`
    )
    sendToRenderer('update-downloaded', payload)
  })

  autoUpdater.on('quit-and-install', () => {
    logger.info('安装完成，重启应用')
    sendToRenderer('quit-and-install')
  })

  autoUpdater.on('error', (error) => {
    logger.error('更新出错：', error.message)
    sendToRenderer('update-error', error.message)
  })

  win.on('closed', () => {
    mainWindow = null
  })

  win.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdates()
  })
}
