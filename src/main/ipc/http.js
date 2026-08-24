/**
 * HTTP 代理 IPC 频道（简单版）
 *
 * 渲染进程 → 主进程发起真实 HTTP 请求的统一入口：
 *   - http:request (handle) — 发起请求，返回 { status, headers, data }
 *
 * 渲染进程只传「普通对象」，由主进程负责真实 HTTP 调用。
 */
import { handleHttpRequest } from '../http'

export default [
  {
    channel: 'http:request',
    type: 'handle',
    handler: handleHttpRequest
  }
]
