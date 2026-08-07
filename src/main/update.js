import pkg from 'electron-updater'
import logger from './log'

const { autoUpdater } = pkg
let mainWindow = null
const UPDATE_URL = normalizeUpdateUrl(process.env.VITE_UPDATE_URL)

// 规范更新服务地址
function normalizeUpdateUrl(url) {
  if (!url) {
    return ''
  }
  return url.endsWith('/') ? url : `${url}/`
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

// 初始化更新器
export const initUpdater = async (win) => {
  mainWindow = win
  autoUpdater.logger = logger // 设置日志记录器
  autoUpdater.autoDownload = false // 禁用自动下载
  autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development' // 强制开发环境更新
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
    logger.info(
      `当前已是最新版本 ${info?.version || autoUpdater.currentVersion.version}`
    )
    sendToRenderer('update-not-available', info)
  })

  autoUpdater.on('update-available', (info) => {
    logger.info(`检测到新版本 ${info?.version}`)
    sendToRenderer('update-available', info)
  })

  autoUpdater.on('download-progress', (progress) => {
    logger.info(`下载进度: ${progress.percent.toFixed(2)}%`)
    sendToRenderer('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    logger.info(`下载完成，准备安装 ${info?.version}`)
    sendToRenderer('update-downloaded', info)
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

  win.webContents.once('did-finish-load', async () => {
    autoUpdater.checkForUpdates()
  })
}
