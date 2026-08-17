import { Menu, app, shell, dialog, BrowserWindow, nativeImage } from 'electron'
import path from 'node:path'
import os from 'os'
import logger from './log'

// 通知渲染进程打开检查更新弹窗（与顶栏按钮走同一流程）
const notifyCheckUpdate = () => {
  const win = BrowserWindow.getAllWindows()[0]
  if (win && !win.isDestroyed()) {
    win.webContents.send('menu-check-update')
  }
}

// 通知渲染进程打开问题反馈弹窗（由渲染进程收集后跳转 GitHub Issues）
const notifyReportIssue = () => {
  const win = BrowserWindow.getAllWindows()[0]
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) win.restore()
    win.focus()
    win.webContents.send('menu-report-issue')
  }
}

// 计算相对时间（如 "2 个月前"）
const getRelativeTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffYear > 0) return `${diffYear} 年前`
  if (diffMonth > 0) return `${diffMonth} 个月前`
  if (diffDay > 0) return `${diffDay} 天前`
  if (diffHour > 0) return `${diffHour} 小时前`
  if (diffMin > 0) return `${diffMin} 分钟前`
  return '刚刚'
}

// 获取应用图标路径（macOS 用于 dialog 显示）
const getAppIcon = () => {
  const iconsRoot = app.isPackaged
    ? path.join(process.resourcesPath, 'icons', 'mac')
    : path.join(process.env.APP_ROOT || process.cwd(), 'resources')
  return nativeImage.createFromPath(path.join(iconsRoot, 'app.png'))
}

// 显示关于对话框
const showAboutDialog = () => {
  const mainWindow = BrowserWindow.getAllWindows()[0]
  const commitHash =
    typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'unknown'
  const buildDate =
    typeof __BUILD_DATE__ !== 'undefined'
      ? __BUILD_DATE__
      : new Date().toISOString()
  const osInfo = `${os.type()} ${os.arch()} ${os.release()}`

  const detail = [
    `版本: ${app.getVersion()}`,
    `提交: ${commitHash}`,
    `日期: ${buildDate} (${getRelativeTime(buildDate)})`,
    `Electron: ${process.versions.electron}`,
    `Chromium: ${process.versions.chrome}`,
    `Node.js: ${process.versions.node}`,
    `V8: ${process.versions.v8}`,
    `OS: ${osInfo}`
  ].join('\n')

  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '关于',
    message: `${app.name}`,
    detail,
    icon: getAppIcon()
  })
}

// 创建菜单栏的函数
const createMenu = () => {
  const isMac = process.platform === 'darwin'

  const template = [
    // macOS 应用菜单
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { label: '关于', click: showAboutDialog },
              { type: 'separator' },
              {
                label: '检查更新',
                click: notifyCheckUpdate
              },
              { type: 'separator' },
              { role: 'services', label: '服务' },
              { type: 'separator' },
              { role: 'hide', label: '隐藏' },
              { role: 'hideOthers', label: '隐藏其他' },
              { role: 'unhide', label: '显示全部' },
              { type: 'separator' },
              { role: 'quit', label: '退出' }
            ]
          }
        ]
      : []),
    {
      label: '文件',
      submenu: [
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => logger.info('打开文件')
        },
        {
          label: '保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => logger.info('保存文件')
        },
        {
          label: '另存为',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => logger.info('另存为')
        },
        { type: 'separator' },
        {
          label: '打印',
          accelerator: 'CmdOrCtrl+P',
          click: () => logger.info('打印')
        },
        { type: 'separator' },
        isMac
          ? { role: 'close', label: '关闭' }
          : { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销', accelerator: 'CmdOrCtrl+Z' },
        { role: 'redo', label: '重做', accelerator: 'CmdOrCtrl+Shift+Z' },
        { type: 'separator' },
        { role: 'cut', label: '剪切', accelerator: 'CmdOrCtrl+X' },
        { role: 'copy', label: '复制', accelerator: 'CmdOrCtrl+C' },
        { role: 'paste', label: '粘贴', accelerator: 'CmdOrCtrl+V' },
        { role: 'delete', label: '删除' },
        { type: 'separator' },
        { role: 'selectAll', label: '全选', accelerator: 'CmdOrCtrl+A' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载', accelerator: 'CmdOrCtrl+R' },
        {
          role: 'forceReload',
          label: '强制重新加载',
          accelerator: 'CmdOrCtrl+Shift+R'
        },
        // 开发模式下才显示开发者工具菜单项
        ...(!app.isPackaged
          ? [
              {
                role: 'toggleDevTools',
                label: '切换开发者工具',
                accelerator: 'F12'
              }
            ]
          : []),
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放', accelerator: 'CmdOrCtrl+0' },
        { role: 'zoomIn', label: '放大', accelerator: 'CmdOrCtrl+Plus' },
        { role: 'zoomOut', label: '缩小', accelerator: 'CmdOrCtrl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '切换全屏', accelerator: 'F11' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化', accelerator: 'CmdOrCtrl+M' },
        { role: 'zoom', label: '缩放' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front', label: '全部置于最前' }]
          : [{ role: 'close', label: '关闭' }])
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '文档',
          click: async () => {
            await shell.openExternal(
              'https://github.com/sincely/vite6-electron-vue3'
            )
          }
        },
        {
          label: '报告问题',
          click: notifyReportIssue
        },
        { type: 'separator' },
        {
          label: '检查更新',
          accelerator: 'CmdOrCtrl+U',
          click: notifyCheckUpdate
        },
        { type: 'separator' },
        {
          label: '关于',
          click: showAboutDialog
        }
      ]
    }
  ]

  // 构建菜单并设置为应用菜单
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

export default createMenu
