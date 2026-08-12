import { BrowserWindow } from 'electron'
import store from '../store'
import logger from '../log'

/**
 * Store IPC 频道
 * 供渲染进程通过 window.store 操作持久化数据
 */
export default [
  {
    channel: 'store-get',
    type: 'handle',
    handler: (event, key, defaultValue) => {
      return store.get(key, defaultValue)
    }
  },
  {
    channel: 'store-set',
    type: 'handle',
    handler: (event, key, value) => {
      store.set(key, value)
      // 通知所有窗口 store 已变更
      notifyStoreChange(key, value)
      return true
    }
  },
  {
    channel: 'store-delete',
    type: 'handle',
    handler: (event, key) => {
      store.delete(key)
      notifyStoreChange(key, undefined)
      return true
    }
  },
  {
    channel: 'store-has',
    type: 'handle',
    handler: (event, key) => {
      return store.has(key)
    }
  },
  {
    channel: 'store-clear',
    type: 'handle',
    handler: () => {
      store.clear()
      notifyStoreChange(null, null)
      return true
    }
  },
  {
    channel: 'store-get-all',
    type: 'handle',
    handler: () => {
      return store.store
    }
  }
]

/**
 * 通知所有窗口 store 数据已变更
 */
function notifyStoreChange(key, value) {
  try {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send('store-changed', { key, value })
      }
    })
  } catch (err) {
    logger.warn('[Store] 通知 store 变更失败:', err.message)
  }
}
