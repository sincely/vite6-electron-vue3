import { ipcMain } from 'electron'
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
    url: 'http://10.10.24.52:8089/electron-update/'
  })

  autoUpdater.logger = logger

  autoUpdater.autoDownload = false

  // 开启本地dev调试
  autoUpdater.forceDevUpdateConfig = true

  // 检查更新
  autoUpdater.checkForUpdates()

  autoUpdater.on('update-not-available', () => {
    logger.info('无新版本')
    mainWindow?.webContents.send('update-not-available')
  })

  autoUpdater.on('update-available', (info) => {
    logger.info('检测到新版本', info.version)
    mainWindow?.webContents.send('update-available', info)
  })

  ipcMain.on('start-download', () => {
    logger.info('开始下载更新')
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('error', (error) => {
    logger.error('更新错误：', JSON.stringify(error))
    mainWindow?.webContents.send('update-error', error)
  })

  // 下载进度
  autoUpdater.on('download-progress', (progress) => {
    logger.info(`下载安装包进度: ${progress.percent}%`)
    mainWindow?.webContents.send('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', () => {
    logger.info('下载完成，是否立即安装更新？')
    mainWindow?.webContents.send('update-downloaded')
  })

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })
}
