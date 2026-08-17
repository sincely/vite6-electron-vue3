import { defineWebSocketHandler } from 'h3'

/**
 * WebSocket 演示路由（配合 nitro.config.mjs 的 experimental.websocket: true）
 *
 * h3 内置 crossws：defineWebSocketHandler 创建的 handler 携带 websocket hooks，
 * dev/node 运行时在 upgrade 请求时按路径解析对应 hooks 完成协议升级。
 */
const peers = new Set()

const broadcast = (payload) => {
  for (const peer of peers) {
    peer.send(payload)
  }
}

export default defineWebSocketHandler({
  open(peer) {
    peers.add(peer)
    // 欢迎消息 + 广播在线人数变化
    peer.send(
      JSON.stringify({
        type: 'system',
        text: '连接成功，欢迎使用 Lightning mock WebSocket 服务！',
        time: Date.now()
      })
    )
    broadcast(
      JSON.stringify({ type: 'online', count: peers.size, time: Date.now() })
    )
  },
  message(peer, message) {
    const raw = message.text()
    // 客户端心跳：ping → pong
    if (raw === 'ping') {
      peer.send(JSON.stringify({ type: 'pong', time: Date.now() }))
      return
    }
    // 聊天消息广播给所有连接（含发送者自身，便于前端直接入列展示）
    broadcast(JSON.stringify({ type: 'message', text: raw, time: Date.now() }))
  },
  close(peer) {
    peers.delete(peer)
    broadcast(
      JSON.stringify({ type: 'offline', count: peers.size, time: Date.now() })
    )
  },
  error(peer) {
    peers.delete(peer)
  }
})
