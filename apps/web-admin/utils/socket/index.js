import { computed, reactive } from 'vue'

/**
 * WebSocket 客户端封装（单例模式，移植自 art-design-pro）
 *
 * 能力：
 *  - 连接建立超时检测
 *  - 心跳检测（收到消息重置计时）
 *  - 定时发送 ping 保活
 *  - 断线重连（指数退避 + 随机抖动，限最大次数）
 *  - 未连接时消息入队缓存，连接成功后自动补发
 *  - Vue 响应式状态（state / statusText），页面可直接绑定
 *
 * 用法：
 *   const client = WebSocketClient.getInstance({
 *     url: 'ws://localhost:5320/ws/chat',
 *     messageHandler: (event) => {}
 *   })
 *   client.init()          // 建立连接
 *   client.send('hello')   // 发送消息（未连接时自动入队）
 *   client.close()         // 正常关闭（不再重连）
 *   WebSocketClient.destroyInstance() // 销毁单例
 */

// 默认 WebSocket 服务地址（本地 Nitro mock 后端）
export const DEFAULT_WS_URL = 'ws://localhost:5320/ws/chat'

class WebSocketClient {
  static instance = null

  constructor(options) {
    this.url = options.url || DEFAULT_WS_URL
    this.messageHandler = options.messageHandler
    this.reconnectInterval = options.reconnectInterval ?? 20 * 1000 // 重连基础间隔
    this.heartbeatInterval = options.heartbeatInterval ?? 5 * 1000 // 心跳检测间隔
    this.pingInterval = options.pingInterval ?? 10 * 1000 // 发送 ping 间隔
    this.reconnectTimeout = options.reconnectTimeout ?? 30 * 1000 // 重连超时时间
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10
    this.connectionTimeout = options.connectionTimeout ?? 10 * 1000
    this.enableHeartbeat = options.enableHeartbeat ?? true // 心跳开关
    this.autoReconnect = options.autoReconnect ?? true // 自动重连开关

    this.ws = null
    this.stopReconnect = false

    // 消息队列 - 缓存连接建立前的消息
    this.messageQueue = []

    // 定时器
    this.detectionTimer = null
    this.timeoutTimer = null
    this.reconnectTimer = null
    this.pingTimer = null
    this.connectionTimer = null

    // 响应式连接状态
    this.state = reactive({
      connected: false,
      connecting: false,
      reconnecting: false,
      reconnectAttempts: 0
    })

    this.statusText = computed(() => {
      if (this.state.connecting) return '正在连接'
      if (this.state.connected) return '已连接'
      if (this.state.reconnecting && this.state.reconnectAttempts > 0) {
        return `重连中（${this.state.reconnectAttempts}/${this.maxReconnectAttempts}）`
      }
      return '已断开'
    })
  }

  // 单例模式获取实例
  static getInstance(options) {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient(options)
    } else {
      // 更新消息处理器
      WebSocketClient.instance.messageHandler = options.messageHandler
      // 如果提供了新的URL，则更新并重新连接
      if (options.url && WebSocketClient.instance.url !== options.url) {
        WebSocketClient.instance.url = options.url
        WebSocketClient.instance.state.reconnectAttempts = 0
        WebSocketClient.instance.init()
      }
    }
    return WebSocketClient.instance
  }

  static hasInstance() {
    return !!WebSocketClient.instance
  }

  // 销毁实例
  static destroyInstance() {
    if (WebSocketClient.instance) {
      WebSocketClient.instance.close()
      WebSocketClient.instance = null
    }
  }

  // 初始化连接
  init() {
    this.connect(true)
  }

  connect(resetReconnectAttempts = false) {
    // 如果正在连接中，不重复连接
    if (this.state.connecting) {
      console.log('正在建立WebSocket连接中...')
      return
    }

    // 如果已连接，不重复连接
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket连接已存在')
      this.flushMessageQueue() // 确保队列中的消息被发送
      return
    }

    try {
      this.state.connecting = true
      this.stopReconnect = false
      if (resetReconnectAttempts) {
        this.state.reconnectAttempts = 0
        this.state.reconnecting = false
        this.clearTimer('reconnectTimer')
      }
      this.ws = new WebSocket(this.url)

      // 设置连接超时检测
      this.clearTimer('connectionTimer')
      this.connectionTimer = setTimeout(() => {
        console.error(
          `WebSocket连接超时 (${this.connectionTimeout}ms)：${this.url}`
        )
        this.handleConnectionTimeout()
      }, this.connectionTimeout)

      this.ws.onopen = (event) => this.handleOpen(event)
      this.ws.onmessage = (event) => this.handleMessage(event)
      this.ws.onclose = (event) => this.handleClose(event)
      this.ws.onerror = (event) => this.handleError(event)
    } catch (error) {
      console.error('WebSocket初始化失败:', error)
      this.state.connecting = false
      this.reconnect()
    }
  }

  // 处理连接超时
  handleConnectionTimeout() {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket连接超时，强制关闭连接')
      this.ws?.close(1000, 'Connection timeout')
      this.state.connecting = false
      this.reconnect()
    }
  }

  /**
   * 关闭连接
   * @param {boolean} force 强制关闭（1001），默认正常关闭（1000，不触发重连）
   */
  close(force) {
    this.clearAllTimers()
    this.stopReconnect = true
    this.state.reconnecting = false
    this.state.connecting = false

    if (this.ws) {
      this.ws.close(
        force ? 1001 : 1000,
        force ? 'Force closed' : 'Normal close'
      )
      this.ws = null
    }

    this.state.connected = false
  }

  /**
   * 发送消息 - 增加消息队列
   * @param {string|ArrayBuffer|Blob|ArrayBufferView} data
   * @param {boolean} immediate 要求立即发送（未连接时直接失败而不入队）
   */
  send(data, immediate = false) {
    // 如果要求立即发送且未连接，则直接报错
    if (immediate && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
      console.error('WebSocket未连接，无法立即发送消息')
      return false
    }

    // 如果未连接且不要求立即发送，则加入消息队列
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket未连接，消息已加入队列等待发送')
      this.messageQueue.push(data)
      // 如果未在重连中，则尝试重连
      if (!this.state.connecting && !this.stopReconnect) {
        this.init()
      }
      return false
    }

    try {
      this.ws.send(data)
      return true
    } catch (error) {
      console.error('WebSocket发送消息失败:', error)
      // 发送失败时将消息加入队列，等待重连后重试
      this.messageQueue.push(data)
      this.reconnect()
      return false
    }
  }

  // 发送队列中的消息
  flushMessageQueue() {
    if (
      this.messageQueue.length > 0 &&
      this.ws?.readyState === WebSocket.OPEN
    ) {
      console.log(`发送队列中的${this.messageQueue.length}条消息`)
      while (this.messageQueue.length > 0) {
        const data = this.messageQueue.shift()
        if (data) {
          try {
            this.ws?.send(data)
          } catch (error) {
            console.error('发送队列消息失败:', error)
            // 如果发送失败，将消息放回队列头部
            if (data) this.messageQueue.unshift(data)
            break
          }
        }
      }
    }
  }

  // 处理连接打开
  handleOpen(event) {
    console.log('WebSocket连接成功', event)
    this.clearTimer('connectionTimer') // 清除连接超时定时器
    this.state.connected = true
    this.state.connecting = false
    this.state.reconnecting = false
    this.stopReconnect = false
    this.state.reconnectAttempts = 0 // 重置重连次数
    this.startHeartbeat()
    this.startPing()
    this.flushMessageQueue() // 发送队列中的消息
  }

  // 处理收到的消息
  handleMessage(event) {
    this.resetHeartbeat()
    this.messageHandler?.(event)
  }

  // 处理连接关闭
  handleClose(event) {
    console.log(
      `WebSocket断开: 代码=${event.code}, 原因=${event.reason}, 干净关闭=${event.wasClean}`
    )

    // 1000 是正常关闭代码
    const isNormalClose = event.code === 1000

    this.state.connected = false
    this.state.connecting = false
    this.clearConnectionTimers()
    this.ws = null

    if (!this.stopReconnect && !isNormalClose) {
      this.reconnect()
    }
  }

  // 处理错误
  handleError(event) {
    console.error('WebSocket连接错误:', event)

    this.state.connected = false
    this.state.connecting = false

    // 只有在未停止重连的情况下才尝试重连
    if (!this.stopReconnect) {
      this.reconnect()
    }
  }

  closeCurrentSocketForReconnect() {
    this.clearConnectionTimers()
    this.state.connected = false
    this.state.connecting = false

    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onclose = null
      this.ws.onerror = null

      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close(1001, 'Reconnect')
      }

      this.ws = null
    }
  }

  // 开始心跳检测
  startHeartbeat() {
    this.clearTimer('detectionTimer')
    this.clearTimer('timeoutTimer')
    if (!this.enableHeartbeat) return

    this.detectionTimer = setTimeout(() => {
      this.state.connected = this.ws?.readyState === WebSocket.OPEN

      if (!this.state.connected) {
        console.warn('WebSocket心跳检测失败，尝试重连')
        this.reconnect()

        this.timeoutTimer = setTimeout(() => {
          console.warn('WebSocket重连超时')
          this.close()
        }, this.reconnectTimeout)
      }
    }, this.heartbeatInterval)
  }

  // 重置心跳检测（收到任意消息时调用）
  resetHeartbeat() {
    this.clearTimer('detectionTimer')
    this.clearTimer('timeoutTimer')
    this.startHeartbeat()
  }

  // 开始发送 ping 消息
  startPing() {
    this.clearTimer('pingTimer')

    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket未连接，停止发送ping')
        this.clearTimer('pingTimer')
        this.reconnect()
        return
      }

      try {
        this.ws.send('ping')
      } catch (error) {
        console.error('发送ping消息失败:', error)
        this.clearTimer('pingTimer')
        this.reconnect()
      }
    }, this.pingInterval)
  }

  // 重连 - 指数退避 + 次数限制
  reconnect() {
    if (
      !this.autoReconnect ||
      this.stopReconnect ||
      this.state.connecting ||
      this.reconnectInterval <= 0
    ) {
      return
    }

    // 检查是否超过最大重连次数
    if (this.state.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `已达到最大重连次数(${this.maxReconnectAttempts})，停止重连`
      )
      this.close(true)
      return
    }

    this.state.reconnectAttempts++
    this.state.reconnecting = true
    this.closeCurrentSocketForReconnect()

    const delay = this.calculateReconnectDelay()
    console.log(
      `将在${(delay / 1000).toFixed(1)}秒后尝试重新连接（第${this.state.reconnectAttempts}/${this.maxReconnectAttempts}次）`
    )

    this.clearTimer('reconnectTimer')
    this.reconnectTimer = setTimeout(() => {
      console.log(
        `尝试重新连接WebSocket（第${this.state.reconnectAttempts}次）`
      )
      this.connect(false)
    }, delay)
  }

  // 计算重连延迟 - 指数退避策略
  calculateReconnectDelay() {
    // 基础延迟 + 随机值，避免多个客户端同时重连
    const jitter = Math.random() * 1000 // 0-1秒的随机延迟
    const baseDelay = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.state.reconnectAttempts - 1),
      this.reconnectInterval * 5
    )
    return baseDelay + jitter
  }

  // 清除指定定时器
  clearTimer(timerName) {
    if (this[timerName]) {
      clearTimeout(this[timerName])
      this[timerName] = null
    }
  }

  // 清除所有定时器
  clearAllTimers() {
    this.clearConnectionTimers()
    this.clearTimer('reconnectTimer')
  }

  clearConnectionTimers() {
    this.clearTimer('detectionTimer')
    this.clearTimer('timeoutTimer')
    this.clearTimer('pingTimer')
    this.clearTimer('connectionTimer')
  }

  // 获取当前连接状态
  get isWebSocketConnected() {
    return this.state.connected
  }

  // 获取连接状态文本
  get connectionStatusText() {
    return this.statusText.value
  }
}

export default WebSocketClient
