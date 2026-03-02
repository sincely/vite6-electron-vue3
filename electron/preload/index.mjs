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
    })
    // You can expose other APTs you need here.
    contextBridge.exposeInMainWorld('process', {
      platform: process.platform
    })

    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

// 预加载loadin脚本
function domReady(condition = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent, child) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent, child) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child)
    }
  }
}
