/**
 * @module AI 网关 Controller
 * @description HTTP 适配层：/ai/status 返回网关状态；/ai/chat 以 SSE 推送流式回复
 */

import { PassThrough } from 'stream'
import * as aiService from './aiService.js'
import { businessCode } from '../../config/businessCode.js'
import { createSuccessResponse } from '../../utils/createResponse.js'
import logger from '../../config/logger.js'

/**
 * 获取网关状态
 */
const status = async (ctx) => {
  ctx.body = createSuccessResponse(businessCode.success, '获取 AI 网关状态成功', aiService.getGatewayStatus())
}

/**
 * 流式会话（SSE）
 *
 * 事件帧统一为 `data: {JSON}\n\n`，type 取值：
 *   - meta  ：网关状态（provider / model），会话开始时推送一次
 *   - delta ：回复文本增量 { text }
 *   - done  ：本轮回复结束
 *   - error ：网关或上游异常 { message }
 */
const chat = async (ctx) => {
  const { messages } = ctx.request.body

  ctx.status = 200
  ctx.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // 禁用反向代理缓冲，保证流式帧即时下发
    'X-Accel-Buffering': 'no'
  })

  const stream = new PassThrough()
  ctx.body = stream

  const write = (evt) => {
    if (!stream.writableEnded) {
      stream.write(`data: ${JSON.stringify(evt)}\n\n`)
    }
  }

  // 客户端断开时中止上游请求，避免无效代理
  const abortController = new AbortController()
  ctx.res.on('close', () => abortController.abort())

  write({ type: 'meta', ...aiService.getGatewayStatus() })

  try {
    for await (const delta of aiService.streamChat({ messages, signal: abortController.signal })) {
      write({ type: 'delta', text: delta })
    }
    write({ type: 'done' })
  } catch (err) {
    logger.error({ err }, '[ai] 流式会话异常')
    write({ type: 'error', message: err?.message || 'AI 服务暂时不可用' })
  } finally {
    stream.end()
  }
}

export default { status, chat }
