/**
 * AI 助手流式会话 IPC 频道
 *
 * 生产环境渲染进程经 app:// 自定义协议加载，直连后端 SSE 会被 CORS 白名单拦截，
 * 因此流式请求统一由主进程原生 fetch 发起，再逐帧转发给渲染进程：
 *   - ai:chat-stream (handle)：发起流式会话，响应建立后立即返回 { requestId }
 *   - ai:chat-stream:event   ：逐帧推送 { requestId, evt }，evt.type 为 meta / delta / done / error / cancelled
 *   - ai:chat-cancel (on)    ：按 requestId 中止进行中的会话
 */
import { httpConfig } from '../config/http'
import logger from '../log'

// 进行中的会话：requestId → AbortController
const activeStreams = new Map()

// 从 SSE 缓冲中切出完整帧（以空行分隔），返回 [帧数组, 剩余缓冲]
function extractFrames(buffer) {
  const frames = []
  let rest = buffer
  let sep
  while ((sep = rest.indexOf('\n\n')) !== -1) {
    frames.push(rest.slice(0, sep))
    rest = rest.slice(sep + 2)
  }
  return [frames, rest]
}

// 解析单帧中的 data: 行（本网关只产出 data 帧）
function parseFrame(frame) {
  const line = frame.split('\n').find((l) => l.startsWith('data:'))
  if (!line) return null
  try {
    return JSON.parse(line.slice(5).trim())
  } catch {
    return null
  }
}

/**
 * 发起流式会话：异步消费后端 SSE 并逐帧推送，handle 立即返回
 */
async function startChatStream(event, payload = {}) {
  const { requestId, messages, token } = payload
  if (!requestId) {
    throw new Error('[ai] requestId is required')
  }

  const controller = new AbortController()
  activeStreams.set(requestId, controller)

  const send = (evt) => {
    if (!event.sender.isDestroyed()) {
      event.sender.send('ai:chat-stream:event', { requestId, evt })
    }
  }

  // 流消费异步进行，不阻塞 handle 返回
  ;(async () => {
    let settled = false
    try {
      const res = await fetch(`${httpConfig.baseURL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messages }),
        signal: controller.signal
      })

      if (!res.ok || !res.body) {
        let message = `AI 服务请求失败（HTTP ${res.status}）`
        try {
          const body = await res.json()
          message = body?.msg || message
        } catch {
          // 非 JSON 错误体，保留默认提示
        }
        send({ type: 'error', message })
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      for await (const chunk of res.body) {
        buffer += decoder.decode(chunk, { stream: true })
        const [frames, rest] = extractFrames(buffer)
        buffer = rest
        for (const frame of frames) {
          const evt = parseFrame(frame)
          if (evt) send(evt)
          if (evt?.type === 'done' || evt?.type === 'error') settled = true
        }
      }
      // 兜底：后端异常断流未发终止帧时补发 done，保证渲染端结束 streaming 态
      if (!settled) send({ type: 'done' })
    } catch (err) {
      if (err?.name === 'AbortError') {
        send({ type: 'cancelled' })
      } else {
        logger.error(`[ai] 流式会话请求异常: ${err?.message}`)
        send({ type: 'error', message: err?.message || '网络异常，AI 服务暂不可用' })
      }
    } finally {
      activeStreams.delete(requestId)
    }
  })()

  return { requestId }
}

/**
 * 中止进行中的会话
 */
function cancelChatStream(_event, requestId) {
  activeStreams.get(requestId)?.abort()
  activeStreams.delete(requestId)
}

export default [
  {
    channel: 'ai:chat-stream',
    type: 'handle',
    handler: startChatStream
  },
  {
    channel: 'ai:chat-cancel',
    type: 'on',
    handler: cancelChatStream
  }
]
