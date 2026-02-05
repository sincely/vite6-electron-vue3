import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import icon from '../../resources/icon.png?asset'
import checkUpdate from '../../src/utils/checkUpdate'
const login_width = 530
const register_height = 635
// 屏蔽浏览器控制台警告

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron') // 主进程
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist') // 渲染进程
export const { VITE_DEV_SERVER_URL } = process.env // Vite开发服务器
console.log('VITE_DEV_SERVER_URL:', VITE_DEV_SERVER_URL)

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    icon: icon,
    width: login_width,
    height: register_height,
    show: false, // 隐藏窗口
    transparent: true, // 透明窗口
    autoHideMenuBar: true, // 隐藏菜单栏
    titleBarStyle: 'hidden', // 隐藏标题栏
    resizable: false, // 禁止调整窗口大小
    frame: true, // 隐藏窗口边框
    mediaAccess: true, // 允许访问媒体设备
    webPreferences: {
      preload,
      // 解决 Not allowed to load local resource
      webSecurity: false
      // sandbox: false
      // contextIsolation: false,
      // webSecurity: false
      // 警告:在生产环境中启用nodeIntegration并禁用contextIsolation是不安全的
      // 考虑使用contextBridge.exposeInMainWorld
      // 阅读更多 https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // nodeIntegration: true,  // 设置true
      // contextIsolation: false  // 设置false
    }
  })

  ipcMain.on('toMain', (event, args) => {
    win.setResizable(true)
    win.setSize((args.screenWidth / 5) * 3 + 150, 600)
    win.setMinimumSize((args.screenWidth / 5) * 3 + 150, 600)
    win.center()
    win.setMaximizable(true)
    win.setMaximumSize((args.screenWidth / 5) * 3 + 200, 700)
  })

  ipcMain.on('minimizing', (event, args) => {
    event.preventDefault() // 阻止默认最小化行为
    win.minimize() // 最小化到任务栏
  })

  ipcMain.on('expandWindow', (event, args) => {
    const defaultSize = win.getSize()
    const maxSize = win.getMaximumSize()
    if (defaultSize[0] === (args.screenWidth / 5) * 3 + 150 && defaultSize[1] === 600) {
      win.setResizable(true)
      win.setSize((args.screenWidth / 5) * 3 + 200, 700)
    } else if (maxSize[0] === (args.screenWidth / 5) * 3 + 200 && maxSize[1] === 700) {
      win.setResizable(true)
      win.setSize((args.screenWidth / 5) * 3 + 150, 600)
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // 如果是开发环境，加载Vite开发服务器
  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    // 加载文件，`dist/index.html`是Vite构建的默认输出目录
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
    checkUpdate(win)
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
      allWindows[0].focus()
    } else {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
