/**
 * HTTP 代理 IPC 频道
 *
 * 渲染进程 → 主进程发起真实 HTTP 请求的统一入口：
 *   - http:request (handle) — 发起请求，返回规范化结果
 *   - http:cancel   (on)    — 取消正在进行的请求
 *
 * 渲染进程只传「普通对象」，由主进程负责：
 *   - 构造表单体（URLSearchParams）/ JSON body
 *   - 注入 Bearer Token
 *   - 二进制响应回传 ArrayBuffer
 *   - 统一错误归一化（status / code / data）
 */
import { handleHttpRequest, handleHttpCancel } from '../http'

export default [
  {
    channel: 'http:request',
    type: 'handle',
    handler: handleHttpRequest
  },
  {
    channel: 'http:cancel',
    type: 'on',
    handler: handleHttpCancel
  }
]
