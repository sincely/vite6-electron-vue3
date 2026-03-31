import pkg from 'electron-updater'
import logger from './log'

const { autoUpdater } = pkg
console.log(process.env.NODE_ENV)
// 主窗口引用，用于发送更新事件
let mainWindow = null

/**
 * 获取更新服务器地址
 * 优先读取环境变量 VITE_UPDATE_URL，回退到默认地址
 * （VITE_UPDATE_URL 由 vite.config.js define 在构建期注入主进程）
 */
const UPDATE_URL = process.env.VITE_UPDATE_URL
console.log('UPDATE_URL:', process.env.VITE_UPDATE_URL)
export const initUpdater = async (win) => {
  mainWindow = win
  // 等待 3 秒再检查更新，确保窗口准备完成，用户进入系统
  // await sleep(3000);
  logger.info('更新服务地址：', UPDATE_URL)

  // 设置更新服务器地址
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: UPDATE_URL
  })

  // 设置日志记录器
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

  // 无可用更新
  autoUpdater.on('update-not-available', (info) => {
    logger.info('当前已是最新版本', info.version)
    console.log(info)
    mainWindow?.webContents.send('update-not-available', info)
  })
  // 有可用更新
  autoUpdater.on('update-available', (info) => {
    logger.info('检测到新版本', info.version)
    mainWindow?.webContents.send('update-available', info)
  })
  // 下载进度更新
  autoUpdater.on('download-progress', (progress) => {
    logger.info(`下载进度: ${progress.percent.toFixed(2)}%`)
    mainWindow?.webContents.send('download-progress', downloadPercent)
  })
  // 下载完成，准备安装
  autoUpdater.on('update-downloaded', (info) => {
    logger.info('下载完成，准备安装', info.version)
    mainWindow?.webContents.send('update-downloaded', info)
  })
  // 安装完成，重启应用
  autoUpdater.on('quit-and-install', () => {
    logger.info('安装完成，重启应用')
    // 退出应用并安装更新
    mainWindow?.webContents.send('quit-and-install')
  })
  // 更新出错
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
  // 窗口加载完成时，自动触发一次版本更新检查，以保持应用为最新版本
  win.webContents.once('did-finish-load', () => {
    autoUpdater.checkForUpdates()
  })
}
