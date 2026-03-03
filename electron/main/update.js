import pkg from 'electron-updater'
import logger from './log'

const { autoUpdater } = pkg

let mainWindow = null

/**
 * 获取更新服务器地址
 * 优先读取环境变量 VITE_UPDATE_URL，回退到 package.json 中的配置
 */
const UPDATE_URL = process.env.VITE_UPDATE_URL || 'http://10.10.24.52:8089/electron-update/'

export const initUpdater = (win) => {
  mainWindow = win

  logger.info('[updater] 初始化，服务地址：', UPDATE_URL)

  autoUpdater.setFeedURL({
    provider: 'generic',
    url: UPDATE_URL
  })

  autoUpdater.logger = logger
  // 禁用自动下载，由用户主动触发
  autoUpdater.autoDownload = false
  // 仅在开发环境允许使用本地 dev-app-update.yml 调试
  autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development'

  // ── 事件监听（只负责把事件转发给渲染层，IPC 操作统一在 ipc/update.js 中注册）──

  autoUpdater.on('checking-for-update', () => {
    logger.info('[updater] 正在检查更新...')
    mainWindow?.webContents.send('checking-for-update')
  })

  autoUpdater.on('update-not-available', (info) => {
    logger.info('[updater] 当前已是最新版本', info.version)
    console.log(info)
    mainWindow?.webContents.send('update-not-available', info)
  })

  autoUpdater.on('update-available', (info) => {
    logger.info('[updater] 检测到新版本', info.version)
    mainWindow?.webContents.send('update-available', info)
  })

  autoUpdater.on('download-progress', (progress) => {
    logger.info(`[updater] 下载进度: ${progress.percent.toFixed(1)}%`)
    mainWindow?.webContents.send('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    logger.info('[updater] 下载完成，准备安装', info.version)
    mainWindow?.webContents.send('update-downloaded', info)
  })

  autoUpdater.on('error', (error) => {
    logger.error('[updater] 更新出错：', error.message)
    mainWindow?.webContents.send('update-error', error.message)
  })

  // 窗口销毁时清空引用，防止向已销毁窗口发送消息
  win.on('closed', () => {
    mainWindow = null
  })

  autoUpdater.checkForUpdates()
}
