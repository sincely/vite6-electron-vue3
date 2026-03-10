import { ipcRenderer, contextBridge } from 'electron'

// api 暴露的方法
const api = {}
// contextBridge: 安全地向渲染进程暴露 API 的桥梁
// ipcRenderer: 渲染进程与主进程通信的模块
// 如果上下文隔离已启用 ，则使用 contextBridge 暴露 API
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('ipcRenderer', {
    // 添加事件监听器
    on(...args) {
      const [channel, listener] = args
      return ipcRenderer.on(channel, (event, ...args) =>
        listener(event, ...args)
      )
    },
    // 移除事件监听器
    off(...args) {
      const [channel, ...omit] = args
      return ipcRenderer.off(channel, ...omit)
    },
    // 发送事件到主进程
    send(...args) {
      const [channel, ...omit] = args
      return ipcRenderer.send(channel, ...omit)
    },
    // 调用主进程方法
    invoke(...args) {
      const [channel, ...omit] = args
      return ipcRenderer.invoke(channel, ...omit)
    }
  })
  /**
   * 通过 contextBridge 向渲染进程暴露 Node.js 和 Chromium 版本信息
   * 安全地将只读数据暴露给 window.versions 对象
   */
  contextBridge.exposeInMainWorld('versions', {
    node: process.versions.node, // Node.js 运行时版本号
    chrome: process.versions.chrome // Chromium 引擎版本号
  })

  // 可以暴露其他API
  contextBridge.exposeInMainWorld('process', {
    platform: process.platform
  })
  /**
   * 向渲染进程暴露自定义的 electron API
   * 创建一个安全的 window.electron 对象，包含 setTitle 方法
   * @param {string} title - 要设置的窗口标题
   */
  contextBridge.exposeInMainWorld('electron', {
    setTitle: (title) => ipcRenderer.send('set-title', title)
  })
} else {
  window.api = api
}
