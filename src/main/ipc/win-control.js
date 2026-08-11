import { BrowserWindow } from 'electron'

export default [
  {
    channel: 'minimize-window',
    type: 'on',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.minimize()
    }
  },
  {
    channel: 'maximize-window',
    type: 'on',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) {
        if (win.isMaximized()) {
          win.unmaximize()
        } else {
          win.maximize()
        }
      }
    }
  },
  // 查询当前窗口是否已最大化
  {
    channel: 'get-window-maximized',
    type: 'handle',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      return win ? win.isMaximized() : false
    }
  },
  {
    channel: 'close-window',
    type: 'on',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.close()
    }
  }
]

/**
 * 监听窗口最大化状态变化，推送给渲染进程
 * 在窗口创建后调用，渲染进程通过 'window-maximize-change' 事件接收
 */
export function bindMaximizeListener(win) {
  if (!win) return
  const notify = () => {
    if (!win.isDestroyed()) {
      win.webContents.send('window-maximize-change', win.isMaximized())
    }
  }
  win.on('maximize', notify)
  win.on('unmaximize', notify)
}
