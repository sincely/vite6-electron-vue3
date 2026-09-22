/**
 * @module AI 网关 Service
 * @description 服务端统一 AI 代理：对上游暴露 OpenAI 兼容协议的流式接口，
 *   对客户端只暴露 SSE 流（delta / done / error），便于后续无感切换模型。
 *   未配置上游模型时回退到内置模拟流，保证功能开箱可用。
 */

import logger from '../../config/logger.js'

// 上游模型配置（OpenAI 兼容协议）；留空则使用内置模拟流
const provider = {
  baseUrl: (process.env.AI_BASE_URL || '').trim(),
  apiKey: (process.env.AI_API_KEY || '').trim(),
  model: (process.env.AI_MODEL || '').trim()
}

// 内置模拟流的输出节奏（ms / 块）
const BUILTIN_CHUNK_DELAY = 40
const BUILTIN_CHUNK_SIZE = 6

/**
 * 网关状态（供前端状态栏展示）
 */
export function getGatewayStatus() {
  const configured = Boolean(provider.baseUrl && provider.apiKey)
  return {
    ready: true,
    streaming: true,
    provider: configured ? 'openai-compatible' : 'builtin',
    model: configured ? provider.model || 'default' : 'builtin'
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 内置模拟回复：围绕用户问题生成一段结构化答复
 */
function buildBuiltinReply(messages) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const question = (lastUser?.content || '').trim()
  const preview = question.length > 60 ? `${question.slice(0, 60)}…` : question

  return [
    `已收到你的问题：「${preview || '（空消息）'}」。`,
    '当前回复由服务端 AI 网关统一代理：网关负责鉴权、限流与模型路由，客户端只需消费流式事件。',
    '在服务器 .env 中配置 AI_BASE_URL / AI_API_KEY / AI_MODEL 后，本会话将自动切换到真实模型的流式输出，客户端无需改动。',
    '你可以继续追问，例如：「介绍一下系统的权限模型」或「如何配置开机自启」。'
  ].join('\n')
}

// 按固定长度切分文本，模拟逐字输出
function splitToChunks(text, size) {
  const chunks = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

/**
 * 代理上游 OpenAI 兼容 /chat/completions 流，逐块产出 delta 文本
 * @param {Array<{role: string, content: string}>} messages 会话历史
 * @param {AbortSignal} signal 客户端断开时中止上游请求
 */
async function* streamFromUpstream(messages, signal) {
  const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({ model: provider.model || 'gpt-4o-mini', messages, stream: true }),
    signal
  })

  if (!res.ok || !res.body) {
    throw new Error(`上游模型服务响应异常（HTTP ${res.status}）`)
  }

  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk, { stream: true })
    let sep
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      const line = frame.split('\n').find((l) => l.startsWith('data:'))
      if (!line) {
        continue
      }
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') {
        return
      }
      try {
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content
        if (delta) {
          yield delta
        }
      } catch {
        // 忽略畸形帧
      }
    }
  }
}

/**
 * 内置模拟流：按节奏逐块产出回复文本
 */
async function* streamBuiltin(messages, signal) {
  const chunks = splitToChunks(buildBuiltinReply(messages), BUILTIN_CHUNK_SIZE)
  for (const piece of chunks) {
    if (signal?.aborted) {
      return
    }
    await sleep(BUILTIN_CHUNK_DELAY)
    yield piece
  }
}

/**
 * 流式会话入口：按网关配置选择上游代理或内置模拟流
 * @returns {AsyncGenerator<string>} 回复文本增量
 */
export function streamChat({ messages, signal }) {
  const configured = Boolean(provider.baseUrl && provider.apiKey)
  if (configured) {
    logger.info(`[ai] 流式会话代理到上游模型：${provider.model || 'default'}`)
    return streamFromUpstream(messages, signal)
  }
  return streamBuiltin(messages, signal)
}

export default { getGatewayStatus, streamChat }
