import { app, Menu, Tray } from 'electron'
import path from 'path'
// 创建托盘图标的函数
const createTray = () => {
  const tray = new Tray(path.join(process.env.APP_ROOT, 'resources/icon.png')) // 托盘图标路径
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => win.show() }, // 显示窗口
    { label: '隐藏', click: () => win.hide() }, // 隐藏窗口
    // { type: 'separator' },
    { label: '退出', click: () => app.quit() } // 退出应用
  ])

  // 设置托盘图标的提示文本和右键菜单
  tray.setToolTip('这是托盘图标')
  tray.setContextMenu(contextMenu)
}

export default createTray
