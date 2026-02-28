import { BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { VITE_DEV_SERVER_URL, RENDERER_DIST, VITE_PUBLIC } from '../config/index.js'
import { initUpdater } from './update.js'
import createNotification from './notification.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

const windows = new Map() // 窗口映射表
let mainWindowId = null // 主窗口 ID
let loginWindowId = null // 登录窗口 ID

// 设置窗口事件
const setupWindow = (win) => {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return {
      action: 'deny' // 拒绝打开外部链接
    }
  })

  // 监听加载失败
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`Page failed to load: ${errorDescription} (${errorCode}) at ${validatedURL}`)
  })

  // 监听崩溃
  win.webContents.on('render-process-gone', (event, details) => {
    console.error(`Render process gone: ${details.reason} (${details.exitCode})`)
  })

  win.once('ready-to-show', () => win.show())
}

// 加载哈希路由
const loadHash = (win, hash) => {
  const url = VITE_DEV_SERVER_URL ? (hash ? `${VITE_DEV_SERVER_URL}#${hash}` : VITE_DEV_SERVER_URL) : indexHtml
  if (VITE_DEV_SERVER_URL) {
    // 开发环境加载 URL
    win.loadURL(url)
  } else {
    // 生产环境加载文件
    win.loadFile(url, hash ? { hash } : {})
  }
}

// 获取主窗口
export function getMainWindow() {
  return mainWindowId ? windows.get(mainWindowId) : null
}

// 获取登录窗口
export function getLoginWindow() {
  return loginWindowId ? windows.get(loginWindowId) : null
}

// 关闭登录窗口
export function closeLoginWindow() {
  const win = getLoginWindow()
  if (win && !win.isDestroyed()) win.close()
}

// 创建登录窗口
export function createLoginWindow() {
  if (loginWindowId) {
    const win = windows.get(loginWindowId)
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      return win
    }
  }

  const win = new BrowserWindow({
    width: 510,
    height: 680,
    icon: path.join(VITE_PUBLIC, 'favicon.ico'),
    show: false,
    autoHideMenuBar: true,
    // 1. 隐藏原生标题栏
    // titleBarStyle: 'hidden',
    // 用系统控件叠加层
    // ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),

    resizable: false,
    frame: true,
    center: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  const windowId = win.id
  loginWindowId = windowId
  windows.set(windowId, win)

  loadHash(win, '/login')
  setupWindow(win)

  win.on('closed', () => {
    windows.delete(windowId)
    if (windowId === loginWindowId) loginWindowId = null
  })

  return win
}

// 创建主窗口
export function createMainWindow() {
  if (mainWindowId) {
    const win = windows.get(mainWindowId)
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      return win
    }
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 550,
    icon: path.join(VITE_PUBLIC, 'favicon.ico'),
    show: false,
    autoHideMenuBar: true,
    // 1. 隐藏原生标题栏
    titleBarStyle: 'hidden',
    resizable: true,
    frame: true,
    center: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  const windowId = win.id
  mainWindowId = windowId
  windows.set(windowId, win)

  initUpdater(win)

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
    // 在主窗口加载完成后发送一个测试通知
    createNotification({ title: '欢迎', body: '应用已成功启动！' })
  })

  loadHash(win, '/desktop')
  setupWindow(win)

  if (VITE_DEV_SERVER_URL) win.webContents.openDevTools()

  win.on('closed', () => {
    windows.delete(windowId)
    if (windowId === mainWindowId) mainWindowId = null
  })

  return win
}

// 创建普通窗口
export function createWindow(options = {}) {
  const { isMain = false, hash = '', ...browserWindowOptions } = options

  if (isMain) return createMainWindow()

  const defaultOptions = {
    width: 800,
    height: 550,
    icon: path.join(VITE_PUBLIC, 'favicon.ico'),
    show: false,
    transparent: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    resizable: false,
    frame: true,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true
    }
  }

  const win = new BrowserWindow({
    ...defaultOptions,
    ...browserWindowOptions,
    webPreferences: {
      ...defaultOptions.webPreferences,
      ...(browserWindowOptions.webPreferences || {})
    }
  })

  const windowId = win.id
  windows.set(windowId, win)

  loadHash(win, hash)
  setupWindow(win)

  win.on('closed', () => windows.delete(windowId))

  return win
}

// 恢复主窗口
export function restoreMainWindow() {
  if (mainWindowId) {
    // 恢复主窗口
    const win = windows.get(mainWindowId)
    if (win) {
      // 恢复窗口
      if (win.isMinimized()) win.restore()
      win.focus()
      return
    }
  }
  const loginWin = getLoginWindow()
  if (loginWin) {
    if (loginWin.isMinimized()) loginWin.restore()
    // 恢复登录窗口
    loginWin.focus()
  }
}
