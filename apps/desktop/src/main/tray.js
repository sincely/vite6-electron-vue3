import { app, Menu, Tray, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { getAutoUpdater } from './autoUpdater'
import { getMainWindow, getLoginWindow, restoreMainWindow } from './windowManager'
import logger from './log'

let tray = null
let pendingInstallVersion = '' // 已下载待安装的版本号（托盘菜单显示"重启安装更新"）

/**
 * 更新托盘 tooltip 文本
 * 后台下载更新时用于展示下载进度，默认显示应用名
 */
export function setTrayToolTip(text) {
  if (tray) tray.setToolTip(text || app.getName())
}

/**
 * 标记更新已下载待安装，托盘菜单动态展示"重启安装更新"入口
 * 供后台下载完成后调用（main/update.js），重启应用后自动重置
 */
export function setUpdatePendingInstall(version) {
  pendingInstallVersion = version || ''
  rebuildTrayMenu()
}

/**
 * 获取图标根路径（兼容开发环境与打包后环境）
 * - 开发环境：<APP_ROOT>/resources/icons
 * - 打包后：process.resourcesPath/icons（extraResources 已按平台复制）
 */
const getIconsRoot = () =>
  app.isPackaged
    ? path.join(process.resourcesPath, 'icons')
    : path.join(process.env.APP_ROOT || process.cwd(), 'resources', 'icons')

// 每个平台固定使用一张托盘图标（开发/打包一致）；mac 的 tray@2x.png 由 nativeImage 自动匹配
const TRAY_ICON_FILES = {
  darwin: path.join('mac', 'tray.png'), // 22×22 + @2x
  win32: path.join('win', 'tray.ico'), // 16×16
  linux: path.join('linux', 'tray.png') // 22×22
}

const createTrayIcon = () => {
  const relPath = TRAY_ICON_FILES[process.platform] || TRAY_ICON_FILES.linux
  const iconPath = path.join(getIconsRoot(), relPath)

  if (!fs.existsSync(iconPath)) {
    logger.warn(`[Tray] Icon not found: ${iconPath}`)
    return nativeImage.createEmpty()
  }

  logger.info(`[Tray] Using icon: ${iconPath}`)
  return nativeImage.createFromPath(iconPath)
}

const getActiveWindow = () => {
  const mainWin = getMainWindow()
  if (mainWin && !mainWin.isDestroyed()) return mainWin
  const loginWin = getLoginWindow()
  if (loginWin && !loginWin.isDestroyed()) return loginWin
  return null
}

const toggleWindow = () => {
  const win = getActiveWindow()
  if (!win) return
  win.show()
  win.focus()
}

/**
 * 通知渲染进程打开检查更新弹窗（与菜单栏"检查更新"走同一流程）
 * 主进程发送 menu-check-update → useUpdater 转为 update:open-dialog → UpdateDialog 弹窗
 */
const notifyCheckUpdate = () => {
  const win = getActiveWindow()
  if (!win || win.isDestroyed()) return
  // 确保窗口可见，以便用户看到更新弹窗
  if (!win.isVisible()) {
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  }
  win.webContents.send('menu-check-update')
}

const rebuildTrayMenu = () => {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    // 更新已下载待安装时置顶显示安装入口（后台更新场景）
    ...(pendingInstallVersion
      ? [
          {
            label: `重启安装更新 v${pendingInstallVersion}`,
            click: async () => {
              // isSilent=false 显示安装进度，isForceRunAfter=true 安装后自动启动
              const autoUpdater = await getAutoUpdater()
              autoUpdater.quitAndInstall(false, true)
            }
          },
          { type: 'separator' }
        ]
      : []),
    {
      label: '显示窗口',
      click: () => toggleWindow()
    },
    { type: 'separator' },
    {
      label: '检查更新',
      click: () => notifyCheckUpdate()
    },
    { type: 'separator' },
    {
      label: '退出应用',
      click: () => {
        app.isQuiting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

// 创建托盘图标
const initTray = () => {
  if (tray) return tray

  tray = new Tray(createTrayIcon())
  tray.setToolTip(app.getName())

  // 左键点击：显示/隐藏
  tray.on('click', () => {
    toggleWindow()
    rebuildTrayMenu()
  })

  // 双击：恢复主窗口
  tray.on('double-click', () => {
    restoreMainWindow()
    rebuildTrayMenu()
  })

  // 右键前刷新菜单状态
  tray.on('right-click', () => {
    rebuildTrayMenu()
    tray.popUpContextMenu()
  })

  rebuildTrayMenu()
  return tray
}

export default initTray
