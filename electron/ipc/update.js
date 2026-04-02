import pkg from 'electron-updater'
import logger from '../main/log'
import { checkHotUpdate, applyHotUpdate } from '../main/hot-update'
import { BrowserWindow } from 'electron'

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
  // 手动触发检查热更新
  {
    channel: 'check-for-hot-update',
    type: 'on',
    handler: () => {
      logger.info('[ipc] 手动触发检查热更新')
      checkHotUpdate().catch((err) =>
        logger.error('[ipc] 热更新检查失败:', err.message)
      )
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
  },
  // 用户确认应用热更新（重载窗口）
  {
    channel: 'apply-hot-update',
    type: 'on',
    handler: () => {
      logger.info('[ipc] 应用热更新，重载窗口')
      const win =
        BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
      if (win) {
        applyHotUpdate(win)
      } else {
        logger.warn('[ipc] 找不到可用窗口，无法应用热更新')
      }
    }
  }
]
