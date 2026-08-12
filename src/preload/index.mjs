import { ipcRenderer, contextBridge } from 'electron'
import useLoading from '../main/loading/train'
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
    chrome: process.versions.chrome, // Chromium 引擎版本号
    electron: process.versions.electron // Electron 版本号
  })

  // 可以暴露其他API
  contextBridge.exposeInMainWorld('process', {
    platform: process.platform,
    arch: process.arch
  })
  /**
   * 向渲染进程暴露自定义的 electron API
   * 创建一个安全的 window.electron 对象，包含 setTitle 方法
   * @param {string} title - 要设置的窗口标题
   */
  contextBridge.exposeInMainWorld('electron', {
    setTitle: (title) => ipcRenderer.send('set-title', title)
  })

  /**
   * 向渲染进程暴露系统信息 API
   * 调用 window.systemInfo.getSystemInfo() 获取系统运行环境信息
   */
  contextBridge.exposeInMainWorld('systemInfo', {
    getSystemInfo: () => ipcRenderer.invoke('get-system-info')
  })

  /**
   * 向渲染进程暴露 HTTP 请求 API
   * 调用 window.httpRequest.request(config) 通过主进程发起真实 HTTP 请求
   * 彻底规避跨域问题，统一由主进程管理 token、日志和请求拦截
   */
  contextBridge.exposeInMainWorld('httpRequest', {
    request: (config) => ipcRenderer.invoke('http-request', config)
  })

  /**
   * 向渲染进程暴露通知 API
   * 调用 window.$notification.show(options) 显示原生通知
   *
   * @example
   * window.$notification.show({
   *   title: '新消息',
   *   body: '您有 3 条未读消息',
   *   onClick: () => { console.log('点击了通知') }
   * })
   *
   * @example
   * // macOS 带操作按钮
   * window.$notification.show({
   *   title: '提醒',
   *   body: '会议即将开始',
   *   actions: [{ type: 'button', text: '查看' }],
   *   onAction: (index) => { console.log('点击了按钮', index) }
   * })
   */
  contextBridge.exposeInMainWorld('$notification', {
    /**
     * 显示原生通知
     * @param {Object} options - 通知配置
     * @param {string}  options.title           - 标题
     * @param {string}  options.body            - 正文
     * @param {string}  options.subtitle        - 副标题（macOS）
     * @param {boolean} options.silent          - 是否静默
     * @param {string}  options.urgency         - 紧急程度 'normal'|'critical'|'low'
     * @param {string}  options.timeoutType     - 超时类型 'default'|'never'
     * @param {boolean} options.hasReply        - 是否允许内联回复（macOS）
     * @param {string}  options.closeButtonText - 关闭按钮文字（macOS）
     * @param {Array}   options.actions         - 操作按钮（macOS）
     * @param {Function} options.onClick        - 点击回调
     * @param {Function} options.onClose        - 关闭回调
     * @param {Function} options.onAction       - 操作按钮回调（macOS）
     * @param {Function} options.onReply        - 内联回复回调（macOS）
     * @returns {Promise<Object>} 通知句柄
     */
    show: async (options = {}) => {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

      // 发送 IPC 请求
      const result = await ipcRenderer.invoke('show-native-notification', {
        id: notifId,
        title: options.title || '',
        body: options.body || '',
        subtitle: options.subtitle || '',
        silent: !!options.silent,
        urgency: options.urgency || 'normal',
        timeoutType: options.timeoutType || 'default',
        hasReply: !!options.hasReply,
        closeButtonText: options.closeButtonText || '关闭',
        icon: options.icon || null,
        sound: options.sound || null,
        actions: options.actions || [],
        toastXml: options.toastXml || null
      })

      // 注册事件回调（通过 IPC 事件监听）
      if (options.onClick) {
        const handler = (_event, id) => {
          if (id === notifId) {
            options.onClick()
            ipcRenderer.off('native-notification-clicked', handler)
          }
        }
        ipcRenderer.on('native-notification-clicked', handler)
      }

      if (options.onClose) {
        const handler = (_event, id) => {
          if (id === notifId) {
            options.onClose()
            ipcRenderer.off('native-notification-closed', handler)
          }
        }
        ipcRenderer.on('native-notification-closed', handler)
      }

      if (options.onAction) {
        const handler = (_event, id, actionIndex) => {
          if (id === notifId) {
            options.onAction(actionIndex)
          }
        }
        ipcRenderer.on('native-notification-action', handler)
      }

      if (options.onReply) {
        const handler = (_event, id, reply) => {
          if (id === notifId) {
            options.onReply(reply)
          }
        }
        ipcRenderer.on('native-notification-reply', handler)
      }

      if (options.onShow) {
        const handler = (_event, id) => {
          if (id === notifId) {
            options.onShow()
            ipcRenderer.off('native-notification-show', handler)
          }
        }
        ipcRenderer.on('native-notification-show', handler)
      }

      if (options.onFailed) {
        const handler = (_event, id, error) => {
          if (id === notifId) {
            options.onFailed(error)
            ipcRenderer.off('native-notification-failed', handler)
          }
        }
        ipcRenderer.on('native-notification-failed', handler)
      }

      return {
        id: notifId,
        success: result?.success ?? false,
        /** 关闭通知 */
        close: () => {
          ipcRenderer.send('close-native-notification', notifId)
        }
      }
    }
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

const { appendLoading, removeLoading } = useLoading()

let loadingTimeout = null
let loadingFinishedNotified = false

const clearLoadingTimeout = () => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
}

const notifyLoadingFinished = () => {
  if (loadingFinishedNotified) return
  loadingFinishedNotified = true
  window.postMessage({ payload: 'loadingFinished' }, '*')
}

const hideLoading = () => {
  clearLoadingTimeout()
  removeLoading()
  notifyLoadingFinished()
}

const showLoading = async () => {
  loadingFinishedNotified = false
  await domReady()
  appendLoading()
  clearLoadingTimeout()
  loadingTimeout = setTimeout(hideLoading, 3000)
}

// 监听主进程发来的显示 loading 消息 (只在新开的主窗口生效)
ipcRenderer.on('show-main-loading', () => {
  showLoading()
})

window.addEventListener('message', (ev) => {
  if (ev.data.payload === 'removeLoading') {
    hideLoading()
  }
})