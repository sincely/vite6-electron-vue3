import pkg from 'electron-updater'
import logger from '../log'

const { autoUpdater } = pkg

/**
 * 更新相关 IPC 频道（集中注册，避免与 main/update.js 重复）
 * 对应渲染层发送：ipcRenderer.send(channel)
 */
export default [
  // 手动触发检查全量更新（应用内"检查更新"按钮使用）
  {
    channel: 'check-for-updates',
    type: 'on',
    handler: () => {
      logger.info('[ipc] 手动触发检查全量更新')
      autoUpdater.checkForUpdates()
    }
  },
  // 用户确认后开始下载全量包
  {
    channel: 'start-download',
    type: 'on',
    handler: () => {
      logger.info('[ipc] 开始下载全量更新')
      autoUpdater.downloadUpdate()
    }
  },
  // 下载完成后退出并安装（全量）
  {
    channel: 'install-update',
    type: 'on',
    handler: () => {
      logger.info('[ipc] 退出并安装全量更新')
      // isSilent=false 显示安装进度，isForceRunAfter=true 安装后自动启动
      autoUpdater.quitAndInstall(false, true)
    }
  }
]
