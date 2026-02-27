import { BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { VITE_DEV_SERVER_URL, RENDERER_DIST, VITE_PUBLIC } from '../config/index.js'
import { initUpdater } from './update.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

const windows = new Map()
let mainWindowId = null
let loginWindowId = null

function setupWindow(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  win.once('ready-to-show', () => win.show())
}

function loadHash(win, hash) {
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(hash ? `${VITE_DEV_SERVER_URL}#${hash}` : VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(indexHtml, hash ? { hash } : {})
  }
}

export function getMainWindow() {
  return mainWindowId ? windows.get(mainWindowId) : null
}

export function getLoginWindow() {
  return loginWindowId ? windows.get(loginWindowId) : null
}

export function closeLoginWindow() {
  const win = getLoginWindow()
  if (win && !win.isDestroyed()) win.close()
}

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
    transparent: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
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
    transparent: true,
    autoHideMenuBar: true,
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

export function restoreMainWindow() {
  if (mainWindowId) {
    const win = windows.get(mainWindowId)
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      return
    }
  }
  const loginWin = getLoginWindow()
  if (loginWin) {
    if (loginWin.isMinimized()) loginWin.restore()
    loginWin.focus()
  }
}
