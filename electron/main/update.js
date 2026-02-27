import pkg from 'electron-updater'
import logger from './log'

const { autoUpdater } = pkg

let mainWindow = null

export const initUpdater = (win) => {
  mainWindow = win

  logger.info('初始化更新。。。')

  // 自定义服务器地址
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://192.168.25.194:8000/updates/'
  })

  autoUpdater.logger = logger

  autoUpdater.autoDownload = true

  // 开启本地dev调试
  autoUpdater.forceDevUpdateConfig = true

  // 检查更新
  autoUpdater.checkForUpdates()

  autoUpdater.on('update-not-available', () => {
    logger.info('无新版本')
  })

  autoUpdater.on('update-available', () => {
    logger.info('检测到新版本')
    mainWindow?.webContents.send('update-available')
  })

  autoUpdater.on('error', (error) => {
    logger.error('更新错误：', JSON.stringify(error))
  })

  // 下载进度
  autoUpdater.on('download-progress', (progress) => {
    logger.info(`下载安装包进度: ${progress.percent}%`)
  })

  autoUpdater.on('update-downloaded', () => {
    logger.info('下载完成，是否立即安装更新？')
    mainWindow?.webContents.send('update-downloaded')
  })
}
