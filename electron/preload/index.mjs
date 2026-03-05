import { ipcRenderer, contextBridge } from 'electron'

// api 暴露的方法
const api = {}

// 如果上下文隔离已启用 ，则使用 contextBridge 暴露 API
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('ipcRenderer', {
      // 添加事件监听器
      on(...args) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
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
    // 可以暴露其他API
    contextBridge.exposeInMainWorld('process', {
      platform: process.platform
    })
    // 暴露 api 方法
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
