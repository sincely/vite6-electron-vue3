import { ipcRenderer, contextBridge } from 'electron'
window.ipcRenderer = ipcRenderer
const api = {}
console.log('preload', process.contextIsolated)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('ipcRenderer', {
      on(...args) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
      },
      off(...args) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
      },
      send(...args) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
      },
      invoke(...args) {
        const [channel, ...omit] = args
        return ipcRenderer.invoke(channel, ...omit)
      }

      // You can expose other APTs you need here.
      // ...
    })

    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
