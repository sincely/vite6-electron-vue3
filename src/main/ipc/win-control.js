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
  {
    channel: 'close-window',
    type: 'on',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.close()
    }
  }
]
