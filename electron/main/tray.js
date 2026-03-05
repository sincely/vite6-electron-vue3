import { app, Menu, Tray, nativeImage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import {
  getMainWindow,
  getLoginWindow,
  restoreMainWindow
} from './windowManager'

let tray = null

/**
 * 获取图标根路径（兼容开发环境与打包后环境）
 * - 开发环境：<APP_ROOT>/resources/icons
 * - 打包后：process.resourcesPath/icons（extraResources 已按平台复制）
 */
const getIconsRoot = () =>
  app.isPackaged
    ? path.join(process.resourcesPath, 'icons')
    : path.join(process.env.APP_ROOT || process.cwd(), 'resources', 'icons')

/**
 * 按平台加载托盘图标
 *
 * macOS  → icons/mac/tray@2x.png（灰度模板图像，系统自动适配深色/浅色）
 * Windows→ icons/win/tray.ico 或 tray.png（16×16）
 * Linux  → icons/linux/tray.png（22×22）
 * 降级   → icons/<platform>/app/<size>.png 动态缩放
 */
const createTrayIcon = () => {
  const iconsRoot = getIconsRoot()

  const tryLoad = (...candidates) => {
    for (const p of candidates) {
      if (fs.existsSync(p)) return p
    }
    return null
  }

  if (process.platform === 'darwin') {
    const iconPath = tryLoad(
      path.join(iconsRoot, 'mac', 'tray@2x.png'),
      path.join(iconsRoot, 'mac', 'tray.png')
    )
    if (iconPath) {
      const image = nativeImage.createFromPath(iconPath)
      // 模板图像：系统自动将黑色渲染为适合当前菜单栏的颜色
      image.setTemplateImage(true)
      return image
    }
  }

  if (process.platform === 'win32') {
    const iconPath = tryLoad(
      path.join(iconsRoot, 'win', 'tray.ico'),
      path.join(iconsRoot, 'win', 'tray.png')
    )
    if (iconPath) return nativeImage.createFromPath(iconPath)
  }

  if (process.platform === 'linux') {
    const iconPath = tryLoad(path.join(iconsRoot, 'linux', 'tray.png'))
    if (iconPath) return nativeImage.createFromPath(iconPath)
  }

  // ── 降级：从各平台 app 目录中选取合适尺寸 ──
  const fallbackSize =
    process.platform === 'darwin' ? 18 : process.platform === 'linux' ? 22 : 16
  const platformDir =
    process.platform === 'darwin'
      ? 'mac'
      : process.platform === 'linux'
        ? 'linux'
        : 'win'
  const fallback = tryLoad(
    path.join(iconsRoot, platformDir, 'app', '256.png'),
    path.join(iconsRoot, platformDir, 'app', '128.png'),
    path.join(iconsRoot, 'linux', 'app', '256.png')
  )
  if (fallback) {
    const base = nativeImage.createFromPath(fallback)
    return base.resize({
      width: fallbackSize,
      height: fallbackSize,
      quality: 'best'
    })
  }

  return nativeImage.createEmpty()
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
