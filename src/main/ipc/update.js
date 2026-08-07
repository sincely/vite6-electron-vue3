import pkg from 'electron-updater'
import logger from '../log'
import { getUpdateConfig, refreshUpdateConfig } from '../updateConfig'
import { checkForUpdates } from '../update'

const { autoUpdater } = pkg

/**
 * 更新相关 IPC 频道（集中注册，避免与 main/update.js 重复）
 * 对应渲染层发送：ipcRenderer.send(channel)
 */
export default [
  // 获取当前更新配置（渲染层读取远端配置状态：eligible/禁用版本/autoDownload）
  {
    channel: 'get-update-config',
    type: 'handle',
    handler: () => {
      return getUpdateConfig()
    }
  },
  // 手动触发检查全量更新（应用内"检查更新"按钮使用）
  {
    channel: 'check-for-updates',
    type: 'on',
    handler: async () => {
      logger.info('[ipc] 手动触发检查更新')
      await refreshUpdateConfig() // 检查前先刷新远端配置（同步 eligible/禁用列表）
      checkForUpdates() // 走门控检查（eligible=false 或版本被禁用时按策略处理）
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
