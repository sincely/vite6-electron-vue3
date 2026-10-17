import { Menu, app, shell, screen, BrowserWindow } from 'electron'

// 取菜单触发窗口，兜底为当前聚焦窗口
const resolveWindow = (win) => {
  const target = win || BrowserWindow.getFocusedWindow()
  return target && !target.isDestroyed() ? target : null
}

// 将窗口平铺到所在屏幕工作区的左/右半屏
const tileWindow = (win, side) => {
  const target = resolveWindow(win)
  if (!target) return
  if (target.isFullScreen()) target.setFullScreen(false)
  if (target.isMaximized()) target.unmaximize()
  const { x, y, width, height } = screen.getDisplayMatching(target.getBounds()).workArea
  const half = Math.floor(width / 2)
  target.setBounds({ x: side === 'left' ? x : x + half, y, width: half, height })
}

// 窗口在所在屏幕工作区居中
const centerWindow = (win) => {
  const target = resolveWindow(win)
  if (!target || target.isFullScreen()) return
  if (target.isMaximized()) target.unmaximize()
  target.center()
}

// 最大化/还原切换（非 macOS 无 zoom role）
const toggleMaximize = (win) => {
  const target = resolveWindow(win)
  if (!target) return
  if (target.isMaximized()) target.unmaximize()
  else target.maximize()
}

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

// 通知渲染进程打开「关于」弹窗（弹框内展示版本/提交/日期，两端对齐）
const notifyAbout = () => {
  const win = BrowserWindow.getAllWindows()[0]
  if (win && !win.isDestroyed()) {
    if (win.isMinimized()) win.restore()
    win.focus()
    win.webContents.send('menu-about')
  }
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
              { label: '关于', click: notifyAbout },
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
      submenu: [{ role: 'close', label: '关闭窗口' }]
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
      label: '显示',
      submenu: [
        { role: 'reload', label: '重新加载', accelerator: 'CmdOrCtrl+R' },
        {
          role: 'forceReload',
          label: '强制重新加载',
          accelerator: 'CmdOrCtrl+Shift+R'
        },
        // 仅开发环境显示开发者工具菜单项
        ...(app.isPackaged
          ? []
          : [
              {
                role: 'toggleDevTools',
                label: '切换开发者工具',
                accelerator: 'F12'
              }
            ]),
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放', accelerator: 'CmdOrCtrl+0' },
        { role: 'zoomIn', label: '放大', accelerator: 'CmdOrCtrl+Plus' },
        { role: 'zoomOut', label: '缩小', accelerator: 'CmdOrCtrl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '进入全屏幕', accelerator: 'F11' }
      ]
    },
    {
      label: '窗口',
      // macOS：role 'window' 使系统自动追加 填充/居中/移动与调整大小/全屏幕拼贴/排在前面/窗口列表
      ...(isMac ? { role: 'window' } : {}),
      submenu: isMac
        ? [
            { role: 'minimize', label: '最小化', accelerator: 'CmdOrCtrl+M' },
            { role: 'zoom', label: '缩放' },
            { type: 'separator' },
            { role: 'front', label: '全部置于最前' }
          ]
        : [
            { role: 'minimize', label: '最小化', accelerator: 'CmdOrCtrl+M' },
            { label: '最大化/还原', click: (_, win) => toggleMaximize(win) },
            { type: 'separator' },
            { label: '平铺到屏幕左侧', click: (_, win) => tileWindow(win, 'left') },
            { label: '平铺到屏幕右侧', click: (_, win) => tileWindow(win, 'right') },
            { label: '居中窗口', click: (_, win) => centerWindow(win) },
            { type: 'separator' },
            { role: 'close', label: '关闭窗口' }
          ]
    }
    // {
    //   label: '帮助',
    //   submenu: [
    //     {
    //       label: '文档',
    //       click: async () => {
    //         await shell.openExternal('https://github.com/sincely/vite6-electron-vue3')
    //       }
    //     },
    //     {
    //       label: '报告问题',
    //       click: notifyReportIssue
    //     },
    //     { type: 'separator' },
    //     {
    //       label: '检查更新',
    //       accelerator: 'CmdOrCtrl+U',
    //       click: notifyCheckUpdate
    //     },
    //     { type: 'separator' },
    //     {
    //       label: '关于',
    //       click: notifyAbout
    //     }
    //   ]
    // }
  ]

  // 构建菜单并设置为应用菜单
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

export default createMenu
