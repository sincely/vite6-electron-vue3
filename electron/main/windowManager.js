import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { VITE_DEV_SERVER_URL, RENDERER_DIST } from '../config'
import { initUpdater } from './update' // 更新器
import createNotification from './notification' // 创建通知

const __dirname = path.dirname(fileURLToPath(import.meta.url)) // 获取当前文件所在目录的绝对路径
const preload = path.join(__dirname, '../preload/index.mjs') // preload 脚本的绝对路径
const indexHtml = path.join(RENDERER_DIST, 'index.html') // index.html 的绝对路径

console.log('__dirname:', __dirname)
console.log('preload:', preload)
console.log('indexHtml:', indexHtml)

/**
 * 按平台返回 BrowserWindow 图标路径
 * - macOS  : 应用图标由 .icns bundle 决定，传 undefined 即可
 * - Linux  : 必须使用 PNG，否则部分桌面环境不显示图标
 * - Windows: 使用 .ico 图标文件
 *
 * 路径规则（与 electron-builder extraResources 保持一致）：
 *   开发：<APP_ROOT>/resources/icons/<platform>/...
 *   打包：process.resourcesPath/icons/<platform>/...
 */
const getWindowIcon = () => {
  if (process.platform === 'darwin') return undefined // macOS 由 .icns bundle 控制

  const iconsRoot = app.isPackaged
    ? path.join(process.resourcesPath, 'icons')
    : path.join(process.env.APP_ROOT, 'resources', 'icons')

  if (process.platform === 'linux') {
    // 优先使用 512px，退而用 256px
    const p512 = path.join(iconsRoot, 'linux', 'app', '512.png')
    const p256 = path.join(iconsRoot, 'linux', 'app', '256.png')
    return fs.existsSync(p512) ? p512 : p256
  }

  // Windows
  return path.join(iconsRoot, 'win', 'app.ico')
}

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
  win.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(
        `Page failed to load: ${errorDescription} (${errorCode}) at ${validatedURL}`
      )
    }
  )

  // 监听崩溃
  win.webContents.on('render-process-gone', (event, details) => {
    console.error(
      `Render process gone: ${details.reason} (${details.exitCode})`
    )
  })

  win.once('ready-to-show', () => win.show())
}

/**
 * @description 加载哈希路由
 * @param {*} win
 * @param {*} hash
 */
const loadHash = (win, hash) => {
  // 开发环境使用 loadURL 加载 Vite 开发服务器
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(hash ? `${VITE_DEV_SERVER_URL}#${hash}` : VITE_DEV_SERVER_URL)
  } else {
    // 生产环境使用 loadFile 加载本地文件
    // hash 直接通过 options 传递，Electron 会自动处理
    win.loadFile(indexHtml, hash ? { hash } : {})
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
    width: 600,
    height: 660,
    icon: getWindowIcon(),
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    resizable: false,
    center: true,
    webPreferences: {
      preload, // 预加载脚本
      nodeIntegration: true, // 允许 Node.js 集成
      contextIsolation: true // 启用上下文隔离
    }
  })

  const windowId = win.id
  loginWindowId = windowId
  windows.set(windowId, win)
  // 加载登录页面
  loadHash(win, 'login')

  // 设置窗口事件
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
    width: 1280,
    height: 880,
    minWidth: 800,
    minHeight: 600,
    icon: getWindowIcon(),
    show: false,
    autoHideMenuBar: true,
    // 1. 隐藏原生标题栏
    titleBarStyle: 'hidden',
    resizable: true,
    center: true,
    webPreferences: {
      preload, // 预加载脚本
      nodeIntegration: true, // 允许 Node.js 集成
      contextIsolation: true // 启用上下文隔离
    }
  })

  const windowId = win.id
  mainWindowId = windowId
  windows.set(windowId, win)

  // 初始化更新器
  initUpdater(win)

  // 监听Electron窗口完成首次加载（或刷新后加载完成）完成
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
    // 在主窗口加载完成后发送一个测试通知
    createNotification({
      title: '欢迎',
      body: '应用已成功启动！',
      type: 'celebrate'
    })
  })

  loadHash(win, 'desktop')
  setupWindow(win)

  // 开发环境自动打开开发者工具
  if (VITE_DEV_SERVER_URL) win.webContents.openDevTools()

  // 点击关闭按钮时默认最小化到托盘，避免直接退出
  win.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()
      win.hide()
    }
  })

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
    icon: getWindowIcon(),
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
