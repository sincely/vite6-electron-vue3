import { app, Menu, Tray, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { getMainWindow, getLoginWindow, restoreMainWindow } from './windowManager.js'

let tray = null

/**
 * 获取资源根路径（兼容开发环境与打包后环境）
 * 打包后 process.resourcesPath 指向 app.asar 同级的 resources 目录
 */
const getResourcesRoot = () => (app.isPackaged ? process.resourcesPath : process.env.APP_ROOT || process.cwd())

/**
 * 按平台加载托盘图标
 *
 * macOS  → resources/tray/tray-mac@2x.png（灰度模板图像，系统自动适配深色/浅色）
 * Windows→ resources/tray/tray-win.png（16×16）
 * Linux  → resources/tray/tray-linux.png（22×22）
 * 降级   → resources/icon.png 动态缩放
 */
const createTrayIcon = () => {
  const root = getResourcesRoot()
  const trayDir = path.join(root, 'resources', 'tray')

  const tryLoad = (...candidates) => {
    for (const p of candidates) {
      if (fs.existsSync(p)) return p
    }
    return null
  }

  if (process.platform === 'darwin') {
    const iconPath = tryLoad(path.join(trayDir, 'tray-mac@2x.png'), path.join(trayDir, 'tray-mac.png'))
    if (iconPath) {
      const image = nativeImage.createFromPath(iconPath)
      // 模板图像：系统自动将黑色渲染为适合当前菜单栏的颜色
      image.setTemplateImage(true)
      return image
    }
  }

  if (process.platform === 'win32') {
    const iconPath = tryLoad(path.join(trayDir, 'tray-win.ico'), path.join(trayDir, 'tray-win.png'))
    if (iconPath) return nativeImage.createFromPath(iconPath)
  }

  if (process.platform === 'linux') {
    const iconPath = tryLoad(path.join(trayDir, 'tray-linux.png'))
    if (iconPath) return nativeImage.createFromPath(iconPath)
  }

  // ── 降级：从 icon.png 动态缩放 ──
  const fallback = path.join(root, 'resources', 'icon.png')
  const base = nativeImage.createFromPath(fallback)
  if (!base.isEmpty()) {
    const size = process.platform === 'darwin' ? 18 : process.platform === 'linux' ? 22 : 16
    return base.resize({ width: size, height: size, quality: 'best' })
  }

  return fallback
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
