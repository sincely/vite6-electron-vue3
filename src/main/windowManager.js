import { app, BrowserWindow, shell, screen, nativeTheme } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { VITE_DEV_SERVER_URL } from './config'
import { initUpdater } from './update' // 更新器
import createNotification from './notification' // 创建通知
import logger from './log'
import { bindMaximizeListener } from './ipc/win-control' // 窗口最大化状态监听

const __dirname = path.dirname(fileURLToPath(import.meta.url)) // 获取当前文件所在目录的绝对路径
const preload = path.join(__dirname, '../preload/index.mjs') // preload 脚本的绝对路径
/**
 * 按平台返回 BrowserWindow 图标路径
 * - macOS  : 应用图标由 .icns bundle 决定，传 undefined 即可
 * - Linux  : 必须使用 PNG，否则部分桌面环境不显示图标
 * - Windows: 使用 .ico 图标文件
 *
 * 路径规则（与 electron-builder extraResources 保持一致）：
 *   开发：<APP_ROOT>/resources/icons/<platform>/...
 *   打包：process.resourcesPath/icons/<platform>/...
 *
 * 同步 fs.existsSync 在文件路径不变的应用生命周期内只需执行一次，
 * 用模块级 lazy + 缓存避免每次 new BrowserWindow 都阻塞一次磁盘 I/O
 */
let iconCache = null
let iconCacheResolved = false
const getWindowIcon = () => {
  if (iconCacheResolved) return iconCache
  iconCacheResolved = true
  if (process.platform === 'darwin') {
    iconCache = undefined // macOS 由 .icns bundle 控制
    return iconCache
  }

  const iconsRoot = app.isPackaged
    ? path.join(process.resourcesPath, 'icons')
    : path.join(process.env.APP_ROOT, 'resources', 'icons')

  if (process.platform === 'linux') {
    // 优先使用 512px，退而用 256px
    const p512 = path.join(iconsRoot, 'linux', '512.png')
    const p256 = path.join(iconsRoot, 'linux', '256.png')
    iconCache = fs.existsSync(p512) ? p512 : p256
    return iconCache
  }

  // Windows
  iconCache = path.join(iconsRoot, 'win', 'app.ico')
  return iconCache
}

/**
 * 窗口初始背景色，与 index.html 启动画面及主题变量保持一致，
 * 避免 ready-to-show 前系统默认白色画布造成的白屏闪烁
 */
const getWindowBackgroundColor = () =>
  nativeTheme.shouldUseDarkColors ? '#0b0c0f' : '#ffffff'

const windows = new Map() // 窗口映射表
let mainWindowId = null // 主窗口 ID
let loginWindowId = null // 登录窗口 ID
let closeAction = 'minimize' // 关闭窗口行为：minimize | quit

export function setCloseAction(action) {
  closeAction = action === 'quit' ? 'quit' : 'minimize'
}

export function getCloseAction() {
  return closeAction
}

// ─── 系统主题监听（模块级，只注册一次）──────────────────────────

nativeTheme.on('updated', () => {
  const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('system-theme-updated', theme)
  })
})

// ─── 通用窗口工具 ─────────────────────────────────────────────────

/**
 * 设置通用窗口事件：
 * - 拦截外部链接，使用系统浏览器打开
 * - 记录页面加载失败日志
 * - 记录渲染进程崩溃日志
 * - ready-to-show 时显示窗口（autoShow=false 时跳过，由调用方控制显示时机）
 */
const setupWindow = (win, { autoShow = true } = {}) => {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' } // 拒绝打开外部链接
  })

  win.webContents.on(
    'did-fail-load',
    (_event, errorCode, errorDescription, validatedURL) => {
      if (win.isDestroyed()) return
      logger.error(
        `页面加载失败: ${errorDescription} (${errorCode}) at ${validatedURL}`
      )
    }
  )

  win.webContents.on('render-process-gone', (_event, details) => {
    if (win.isDestroyed()) return
    logger.error(`渲染进程崩溃: ${details.reason} (${details.exitCode})`)
  })

  if (autoShow) {
    win.once('ready-to-show', () => {
      if (!win.isDestroyed()) win.show()
    })
  }
}

/**
 * 加载哈希路由页面
 * - 开发环境：loadURL (Vite 开发服务器)
 * - 生产环境：loadURL (app:// 自定义协议，满足应用商店安全审核要求)
 * - 注册 DevTools 快捷键：开发模式 F12，生产环境 Ctrl+F12
 */
const loadHash = (win, hash) => {
  // 开发环境使用 loadURL 加载 Vite 开发服务器
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(hash ? `${VITE_DEV_SERVER_URL}#${hash}` : VITE_DEV_SERVER_URL)
    // win.webContents.openDevTools()
  } else {
    // 生产环境使用 app:// 自定义协议加载页面
    // 替代 file://，统一跨平台路径、规避安全策略限制，满足应用商店审核要求
    win.loadURL(`app://renderer/index.html${hash ? '#' + hash : ''}`)
  }

  // 监听键盘事件
  // - 开发模式：F12 直接切换 DevTools
  // - 生产环境：Ctrl+F12 作为受控的"暗门"切换 DevTools，便于线上问题排查
  win.webContents.on('before-input-event', (_event, input) => {
    if (input.type !== 'keyDown' || input.key !== 'F12') return
    const isDev = !app.isPackaged
    const isCtrlF12 = input.modifiers?.includes('control')
    if (isDev || isCtrlF12) {
      win?.webContents.toggleDevTools()
    }
  })
}

// 获取主窗口
export function getMainWindow() {
  return mainWindowId ? windows.get(mainWindowId) : null
}

// 获取登录窗口
export function getLoginWindow() {
  return loginWindowId ? windows.get(loginWindowId) : null
}

// 移除窗口事件
const removeWindowListeners = (win) => {
  win.removeAllListeners()
  win.webContents.removeAllListeners()
}

// 关闭登录窗口
export function closeLoginWindow() {
  const win = getLoginWindow()
  if (win && !win.isDestroyed()) {
    // 不调用 removeWindowListeners，保留 closed 事件处理以清理 loginWindowId
    win.close()
  }
}

// 关闭主窗口（退出登录时使用）
export function closeMainWindow() {
  const win = getMainWindow()
  if (win && !win.isDestroyed()) {
    // 标记为退出登录，绕过 close 事件中的最小化拦截
    win._isLoggingOut = true
    win.close()
  }
}

// 创建登录窗口
export function createLoginWindow() {
  if (loginWindowId) {
    const win = windows.get(loginWindowId)
    if (win && !win.isDestroyed()) {
      // 防御：若窗口处于 hide 状态（toMain 时被 hide 但 close 事件尚未派发完成，
      // 或 ready-to-show 还没触发就被登出），focus() 无法让 hide 窗口可见，
      // 复用旧窗口会导致登录窗口永不显示。直接销毁后创建全新可见窗口。
      if (!win.isVisible()) {
        // 同步清理 loginWindowId，避免 win.close() 后 closed 事件异步派发时
        // 仍被下面的 if 分支判断为有旧窗口可复用
        const oldId = loginWindowId
        loginWindowId = null
        windows.delete(oldId)
        win.close()
      } else {
        if (win.isMinimized()) win.restore()
        win.focus()
        return win
      }
    } else {
      // 窗口已销毁，清理残留引用
      loginWindowId = null
    }
  }

  const win = new BrowserWindow({
    width: 480,
    height: 640,
    icon: getWindowIcon(),
    show: false,
    backgroundColor: getWindowBackgroundColor(),
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    resizable: false,
    center: true,
    maximizable: false, // 禁止最大化，从而禁止双击标题栏扩大
    webPreferences: {
      preload, // 预加载脚本
      // 关闭 Node 集成：渲染进程通过 contextBridge 暴露的 window.ipcRenderer 调用主进程，
      // 避免 V8 context 初始化时再启 Node 绑定拖慢 ready-to-show
      nodeIntegration: false,
      contextIsolation: true // 启用上下文隔离
    }
  })

  const windowId = win.id
  loginWindowId = windowId
  windows.set(windowId, win)
  // 加载登录页面
  loadHash(win, 'login')

  // 设置窗口事件（登录窗口不自动显示，由 ready-to-show 决定显示；
  // 已登录场景由 'toMain' IPC 在主进程里设置 _skipShow 并隐藏）
  setupWindow(win, { autoShow: false })

  // 显示时机改为 ready-to-show：等待登录页首次绘制完成后再 show 窗口，
  // 避免 dom-ready 阶段触发 executeJavaScript IPC 往返、把窗口卡在 backgroundColor 白屏。
  // 已登录场景由渲染进程路由守卫发送 'toMain' IPC，主进程会在 'toMain'
  // 处理里设置 _skipShow=true 并隐藏登录窗口，从而跳过这里的显示。
  win.once('ready-to-show', () => {
    if (win.isDestroyed() || win._skipShow) return
    if (!win.isVisible()) win.show()
  })

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
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore()
      win.focus()
      return win
    }
    // 窗口已销毁，清理残留引用
    mainWindowId = null
  }
  // 获取屏幕尺寸
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize
  // 计算窗口大小，默认为屏幕的 80%
  const windowWidth = Math.floor(screenWidth * 0.8)
  const windowHeight = Math.floor(screenHeight * 0.8)
  const isMacOS = process.platform === 'darwin'
  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    icon: getWindowIcon(),
    show: false,
    backgroundColor: getWindowBackgroundColor(),
    autoHideMenuBar: true,
    titleBarStyle: isMacOS ? 'hiddenInset' : 'hidden',
    // macOS: 精确控制红绿灯位置，避免与 UI 内容重叠
    ...(isMacOS && { trafficLightPosition: { x: 10, y: 10 } }),
    resizable: true,
    center: true,
    webPreferences: {
      // sandbox / nodeIntegration 关闭：preload 是 ESM，sandbox=true 需要
      // preload 为 CJS，超出 P0 范围。nodeIntegration 关闭避免 V8 context
      // 启动时再启 Node 绑定，所有 Node 能力通过 contextBridge 暴露
      preload, // 预加载脚本,桥接主进程和渲染进程
      nodeIntegration: false,
      contextIsolation: true, // 启用上下文隔离
      // 恢复 backgroundThrottling 默认值 true：仅在窗口被最小化/隐藏时
      // 对渲染进程做定时器与 IPC 节流，让出 CPU；之前显式 false 会让窗口
      // 隐藏期间渲染进程仍跑满，造成多窗口切换时的卡顿感
      backgroundThrottling: true
    }
  })

  const windowId = win.id
  mainWindowId = windowId
  windows.set(windowId, win)

  // 渲染完成并准备好显示时，给它发个消息，告诉它需要展示 loading
  win.once('ready-to-show', () => {
    win.webContents.send('show-main-loading')
    win.show()
  })

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
    win.focus() // 聚焦窗口，提升用户体验
  })

  // 加载主页面
  loadHash(win, 'desktop')
  // 设置窗口事件
  setupWindow(win)
  // 监听窗口最大化状态变化，推送给渲染进程
  bindMaximizeListener(win)

  // 点击关闭按钮时默认最小化到托盘，避免直接退出应用
  win.on('close', (event) => {
    // 退出登录时允许关闭
    if (win._isLoggingOut) return

    if (app.isQuiting) return

    if (getCloseAction() === 'quit') {
      app.isQuiting = true
      app.quit()
      return
    }

    event.preventDefault()
    win.hide()
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
      nodeIntegration: false, // 通过 contextBridge 暴露 API，无需 Node 集成
      contextIsolation: true // 启用上下文隔离
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
    if (win && !win.isDestroyed()) {
      // 恢复窗口（可能被最小化或隐藏到托盘）
      if (win.isMinimized()) win.restore()
      if (!win.isVisible()) win.show()
      win.focus()
      return
    }
  }
  const loginWin = getLoginWindow()
  if (loginWin) {
    if (loginWin.isMinimized()) loginWin.restore()
    // 恢复登录窗口
    if (!loginWin.isVisible()) loginWin.show()
    loginWin.focus()
  }
}
