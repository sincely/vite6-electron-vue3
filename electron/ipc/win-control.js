import { BrowserWindow } from 'electron'

export default [
  {
    channel: 'window-minimize',
    type: 'on',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.minimize()
    }
  },
  {
    channel: 'window-maximize',
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
  {
    channel: 'window-close',
    type: 'on',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.close()
    }
  }
]
