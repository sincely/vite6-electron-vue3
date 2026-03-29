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

// --------- Preload scripts loading ---------
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

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaderBar`
  const styleContent = `
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  z-index: 9999;
}

.loader-text {
  margin-top: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #006DFE;
  letter-spacing: 1px;
  // animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.loaderBar {
  width: 226px; /* calc(160px / 0.707) */
  height: 10px;
  background: #F9F9F9;
  border-radius: 10px;
  border: 1px solid #006DFE;
  position: relative;
  overflow: hidden;
}

.loaderBar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 5px;
  background: repeating-linear-gradient(45deg, #0031F2 0 30px, #006DFE 0 40px) right/200% 100%;
  animation: fillProgress 6s cubic-bezier(0.2, 0, 0, 1) forwards, lightEffect 1s infinite linear;
}

.loaderBar.finish::before {
  animation: finishProgress 0.3s ease-out forwards;
}

@keyframes fillProgress {
  0% {
    width: 0;
  }
  100% {
    width: 99.9%;
  }
}

@keyframes finishProgress {
  0% {
    width: 99.9%;
  }
  100% {
    width: 100%;
  }
}

@keyframes lightEffect {
  0%, 20%, 40%, 60%, 80%, 90%, 100% {
    background: repeating-linear-gradient(45deg, #0031F2 0 30px, #006DFE 0 40px) right/200% 100%;
  }

  10%, 30%, 50%, 70%, 80%, 90%, 100% {
    background: repeating-linear-gradient(45deg, #0031F2 0 30px, #006DFE 0 40px, rgba(255, 255, 255, 0.3) 0 40px) right/200% 100%;
  }
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `
    <div class="${className}"><div></div></div>
    <div class="loader-text">正在加载中...</div>
  `

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    }
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()

let loadingTimeout = null

// 监听主进程发来的显示 loading 消息 (只在新开的主窗口生效)
ipcRenderer.on('show-main-loading', () => {
  appendLoading()
  if (loadingTimeout) clearTimeout(loadingTimeout)
  loadingTimeout = setTimeout(removeLoading, 3000) // 3秒后自动移除，防止意外情况导致 loading 无法移除
})

window.onmessage = (ev) => {
  if (ev.data.payload === 'removeLoading') {
    if (loadingTimeout) clearTimeout(loadingTimeout)
    removeLoading()
  }
}
