import { BrowserWindow, screen } from 'electron'

// ─── 手动窗口拖拽（macOS 固定尺寸无边框窗口专用）───────────────────
// 背景：macOS 上双击 `-webkit-app-region: drag` 区域会触发 AppKit zoom，把
// 固定尺寸窗口甩到屏幕左下角（Electron 未修复，详见 windowManager.js 的
// guardMacZoomJump 注释），因此登录窗标题栏在 macOS 上不声明 drag 区域，
// 改由此处实现手动拖拽：渲染进程 mousedown 时发送 'window-drag-start'，
// 这里以 ~60fps 轮询全局光标位置并平移窗口，mouseup/失焦时发送
// 'window-drag-end' 结束。Windows/Linux 继续使用原生 drag 区域。
let dragState = null // { win, timer, cleanup }

const stopWindowDrag = () => {
  if (!dragState) return
  const { win, timer, cleanup } = dragState
  dragState = null
  clearInterval(timer)
  cleanup(win)
}

const startWindowDrag = (win) => {
  if (!win || win.isDestroyed()) return
  stopWindowDrag() // 防御：清理可能残留的上一次拖拽

  // 记录光标与窗口左上角的偏移，拖拽期间保持该偏移不变
  const cursorStart = screen.getCursorScreenPoint()
  const [winX, winY] = win.getPosition()
  const offsetX = cursorStart.x - winX
  const offsetY = cursorStart.y - winY

  const onBlur = () => stopWindowDrag()
  const onClosed = () => stopWindowDrag()
  win.on('blur', onBlur)
  win.on('closed', onClosed)
  // 看门狗：渲染进程崩溃等异常导致收不到 drag-end 时自动结束
  const watchdog = setTimeout(stopWindowDrag, 30_000)

  const timer = setInterval(() => {
    if (!dragState || win.isDestroyed()) {
      stopWindowDrag()
      return
    }
    const p = screen.getCursorScreenPoint()
    win.setPosition(p.x - offsetX, p.y - offsetY)
  }, 16)

  dragState = {
    win,
    timer,
    cleanup: (w) => {
      clearTimeout(watchdog)
      if (!w.isDestroyed()) {
        w.removeListener('blur', onBlur)
        w.removeListener('closed', onClosed)
      }
    }
  }
}

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
  // 查询当前窗口是否已最大化
  {
    channel: 'get-window-maximized',
    type: 'handle',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      return win ? win.isMaximized() : false
    }
  },
  {
    channel: 'close-window',
    type: 'on',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.close()
    }
  },
  // 手动拖拽窗口（macOS 登录窗标题栏，见文件头注释）
  {
    channel: 'window-drag-start',
    type: 'on',
    handler: (event) => {
      startWindowDrag(BrowserWindow.fromWebContents(event.sender))
    }
  },
  {
    channel: 'window-drag-end',
    type: 'on',
    handler: () => {
      stopWindowDrag()
    }
  },
  // 恢复并聚焦窗口（系统通知点击回调等场景把窗口带回前台）
  {
    channel: 'focus-window',
    type: 'on',
    handler: (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) {
        if (win.isMinimized()) win.restore()
        win.show()
        win.focus()
      }
    }
  }
]

/**
 * 监听窗口最大化状态变化，推送给渲染进程
 * 在窗口创建后调用，渲染进程通过 'window-maximize-change' 事件接收
 */
export function bindMaximizeListener(win) {
  if (!win) return
  const notify = () => {
    if (!win.isDestroyed()) {
      win.webContents.send('window-maximize-change', win.isMaximized())
    }
  }
  win.on('maximize', notify)
  win.on('unmaximize', notify)
}
