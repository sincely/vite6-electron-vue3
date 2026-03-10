export const createModalWindow = (options) => {
  const defaultOptions = {
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true, // 允许在渲染进程中使用 Node.js 功能
      contextIsolation: false // 禁用上下文隔离
    }
  }
  const winOptions = Object.assign(defaultOptions, options)
  const win = new BrowserWindow(winOptions)
  win.loadURL(options.url)
  win.show()
  return win
}
