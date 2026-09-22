/**
 * AI 流式会话传输层
 *
 * Electron 环境走主进程 IPC 代理（生产环境 app:// 协议直连会被后端 CORS 白名单拦截）；
 * 纯 Web 环境（无 ipcRenderer）回退为渲染进程直连 fetch SSE。
 * 两种传输对上层暴露一致的事件回调：onEvent({ type: 'meta' | 'delta' | 'done' | 'error' | 'cancelled', ... })
 */

// 终止类事件：收到后自动解除监听
const TERMINAL_TYPES = new Set(['done', 'error', 'cancelled'])

/**
 * 发起一次流式会话
 * @param {Object} options
 * @param {Array<{role: string, content: string}>} options.messages 会话历史
 * @param {string} options.token 访问令牌（Bearer）
 * @param {string} options.requestId 会话标识（用于事件路由与取消）
 * @param {(evt: Object) => void} options.onEvent 流事件回调
 * @returns {{ cancel: () => void }} 取消句柄
 */
export function startAiStream({ messages, token, requestId, onEvent }) {
  if (window.ipcRenderer) {
    return startViaIpc({ messages, token, requestId, onEvent })
  }
  return startViaFetch({ messages, token, requestId, onEvent })
}

// Electron：主进程代理流，事件经 ai:chat-stream:event 频道回推
function startViaIpc({ messages, token, requestId, onEvent }) {
  const handler = (_event, payload) => {
    if (payload?.requestId !== requestId) return
    const evt = payload.evt
    onEvent(evt)
    if (TERMINAL_TYPES.has(evt?.type)) {
      window.ipcRenderer.off('ai:chat-stream:event', handler)
    }
  }
  window.ipcRenderer.on('ai:chat-stream:event', handler)
  window.ipcRenderer.invoke('ai:chat-stream', { requestId, messages, token })

  return {
    cancel: () => {
      window.ipcRenderer.off('ai:chat-stream:event', handler)
      window.ipcRenderer.send('ai:chat-cancel', requestId)
    }
  }
}

// 纯 Web：直连后端 SSE（开发环境 CORS 全放行）
function startViaFetch({ messages, token, requestId, onEvent }) {
  const controller = new AbortController()
  const decoder = new TextDecoder()
  let buffer = ''
  let settled = false

  const finish = (evt) => {
    if (settled) return
    settled = true
    onEvent(evt)
  }

  fetch(`${import.meta.env.VITE_SERVER_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ messages }),
    signal: controller.signal
  })
    .then(async (res) => {
      if (!res.ok || !res.body) {
        let message = `AI 服务请求失败（HTTP ${res.status}）`
        try {
          const body = await res.json()
          message = body?.msg || message
        } catch {
          // 非 JSON 错误体，保留默认提示
        }
        finish({ type: 'error', message })
        return
      }
      for await (const chunk of res.body) {
        buffer += decoder.decode(chunk, { stream: true })
        let sep
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sep)
          buffer = buffer.slice(sep + 2)
          const line = frame.split('\n').find((l) => l.startsWith('data:'))
          if (!line) continue
          try {
            const evt = JSON.parse(line.slice(5).trim())
            onEvent(evt)
            if (TERMINAL_TYPES.has(evt?.type)) settled = true
          } catch {
            // 忽略畸形帧
          }
        }
      }
      finish({ type: 'done' })
    })
    .catch((err) => {
      if (err?.name === 'AbortError') {
        finish({ type: 'cancelled' })
      } else {
        finish({ type: 'error', message: err?.message || '网络异常，AI 服务暂不可用' })
      }
    })

  return {
    cancel: () => controller.abort()
  }
}

export default { startAiStream }
