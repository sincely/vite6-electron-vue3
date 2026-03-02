import { app, Menu, Tray, nativeImage } from 'electron'
import path from 'node:path'
import { getMainWindow, getLoginWindow, restoreMainWindow } from './windowManager.js'

let tray = null

const getTrayIconSize = () => {
  if (process.platform === 'darwin') return { width: 18, height: 18 }
  if (process.platform === 'win32') return { width: 16, height: 16 }
  return { width: 16, height: 16 }
}

const createTrayIcon = () => {
  const iconPath = path.join(process.env.APP_ROOT || process.cwd(), 'resources/icon.png')
  const baseImage = nativeImage.createFromPath(iconPath)
  if (baseImage.isEmpty()) return iconPath

  const { width, height } = getTrayIconSize()
  return baseImage.resize({ width, height, quality: 'best' })
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
  if (win.isVisible()) {
    win.hide()
  } else {
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  }
}

const rebuildTrayMenu = () => {
  if (!tray) return
  const win = getActiveWindow()
  const isVisible = !!win?.isVisible()

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVisible ? '隐藏窗口' : '显示窗口',
      click: () => toggleWindow()
    },
    {
      label: '打开主界面',
      click: () => restoreMainWindow()
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
const createTray = () => {
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

export default createTray
