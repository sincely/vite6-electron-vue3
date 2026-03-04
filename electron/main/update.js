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

  logger.info('初始化，服务地址：', UPDATE_URL)

  autoUpdater.setFeedURL({
    provider: 'generic',
    url: UPDATE_URL
  })

  autoUpdater.logger = logger
  // 禁用自动下载，由用户主动触发
  autoUpdater.autoDownload = false
  // 仅在开发环境允许使用本地 dev-app-update.yml 调试
  autoUpdater.forceDevUpdateConfig = process.env.NODE_ENV === 'development'

  // 事件监听（只负责把事件转发给渲染层，IPC 操作统一在 ipc/update.js 中注册）──

  autoUpdater.on('checking-for-update', () => {
    logger.info('正在检查更新...')
    mainWindow?.webContents.send('checking-for-update')
  })

  autoUpdater.on('update-not-available', (info) => {
    logger.info('当前已是最新版本', info.version)
    console.log(info)
    mainWindow?.webContents.send('update-not-available', info)
  })

  autoUpdater.on('update-available', (info) => {
    logger.info('检测到新版本', info.version)
    mainWindow?.webContents.send('update-available', info)
  })

  autoUpdater.on('download-progress', (progress) => {
    logger.info(`下载进度: ${progress.percent.toFixed(2)}%`)
    mainWindow?.webContents.send('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    logger.info('下载完成，准备安装', info.version)
    mainWindow?.webContents.send('update-downloaded', info)
  })

  autoUpdater.on('error', (error) => {
    logger.error('更新出错：', error.message)
    mainWindow?.webContents.send('update-error', error.message)
  })

  // 窗口销毁时清空引用，防止向已销毁窗口发送消息
  win.on('closed', () => {
    mainWindow = null
  })

  // 必须等待渲染进程加载完毕（Vue onMounted 已执行、IPC 监听已注册）后
  // 再发起检查，否则 update-available 消息在监听器注册前就发出会直接丢失
  win.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdates()
  })
}
