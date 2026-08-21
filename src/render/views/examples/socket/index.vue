<template>
  <div class="socket-page">
    <PageHeader
      title="Socket 连接"
      subtitle="WebSocket 客户端封装：心跳检测、断线重连、消息队列与连接状态管理"
      icon="network"
    >
      <template #actions>
        <div class="status-chip" :class="`status-chip--${statusLevel}`">
          <span class="status-dot"></span>
          <span>{{ statusText }}</span>
        </div>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ messages.length }}</span>
        <span class="stat-label">接收消息</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ sentCount }}</span>
        <span class="stat-label">已发送</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ reconnectAttempts }}</span>
        <span class="stat-label">重连次数</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ queueTip }}</span>
        <span class="stat-label">连接状态</span>
      </div>
    </div>

    <!-- 连接配置 -->
    <el-card shadow="never" class="socket-card">
      <template #header>
        <span class="card-title">连接配置</span>
      </template>
      <div class="config-row">
        <div class="config-url">
          <span class="config-label">服务地址</span>
          <el-input
            v-model="url"
            placeholder="ws://localhost:5320/ws/chat"
            :disabled="isConnected"
            clearable
          />
        </div>
        <div class="config-item">
          <span class="config-label">自动重连</span>
          <el-switch v-model="autoReconnect" :disabled="isConnected" />
        </div>
        <div class="config-item">
          <span class="config-label">心跳保活</span>
          <el-switch v-model="enableHeartbeat" :disabled="isConnected" />
        </div>
        <div class="config-actions">
          <el-button
            v-if="!isConnected"
            type="primary"
            :loading="isConnecting"
            @click="handleConnect"
          >
            连接
          </el-button>
          <el-button v-else type="danger" plain @click="handleDisconnect">
            断开
          </el-button>
        </div>
      </div>
    </el-card>

    <div class="socket-body">
      <!-- 发送消息 -->
      <el-card shadow="never" class="socket-card send-card">
        <template #header>
          <span class="card-title">发送消息</span>
        </template>
        <el-radio-group v-model="sendType" class="send-type">
          <el-radio-button value="text">文本</el-radio-button>
          <el-radio-button value="json">JSON</el-radio-button>
          <el-radio-button value="ping">Ping</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="sendText"
          type="textarea"
          :rows="4"
          :disabled="sendType === 'ping'"
          :placeholder="
            sendType === 'ping'
              ? '发送 ping 心跳，服务端将回复 pong'
              : '输入要发送的消息内容'
          "
        />
        <el-button
          class="send-btn"
          type="primary"
          :disabled="!hasClient"
          @click="handleSend"
        >
          发送
        </el-button>
      </el-card>

      <!-- 连接日志 -->
      <el-card shadow="never" class="socket-card log-card">
        <template #header>
          <div class="log-header">
            <span class="card-title">连接日志</span>
            <el-button link size="small" @click="logs = []">清空</el-button>
          </div>
        </template>
        <div class="log-list">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            <span class="log-time">{{ formatTime(log.time) }}</span>
            <span class="log-text" :class="`log-text--${log.type}`">
              {{ log.text }}
            </span>
          </div>
          <div v-if="!logs.length" class="log-empty">暂无日志</div>
        </div>
      </el-card>
    </div>

    <!-- 接收消息列表 -->
    <el-card shadow="never" class="socket-card">
      <template #header>
        <div class="log-header">
          <span class="card-title">接收消息（{{ messages.length }}）</span>
          <el-button link size="small" @click="messages = []">清空</el-button>
        </div>
      </template>
      <div class="message-list">
        <div v-for="(msg, index) in messages" :key="index" class="message-item">
          <el-tag :type="messageTagType(msg.type)" size="small" effect="light">
            {{ messageTypeLabel(msg.type) }}
          </el-tag>
          <span class="message-text">{{ msg.text }}</span>
          <span class="message-time">{{ formatTime(msg.time) }}</span>
        </div>
        <div v-if="!messages.length" class="log-empty">
          暂无消息，连接后服务端会推送欢迎消息
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
defineOptions({ name: 'example-socket' })
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import WebSocketClient, { DEFAULT_WS_URL } from '@/utils/socket'

const url = ref(DEFAULT_WS_URL)
const autoReconnect = ref(true)
const enableHeartbeat = ref(true)
const sendType = ref('text')
const sendText = ref('')
const sentCount = ref(0)

// shallowRef：避免深层代理将实例上的 computed（statusText）自动解包
const client = shallowRef(null)
const messages = ref([])
const logs = ref([])

const hasClient = computed(() => !!client.value)
const isConnected = computed(() => client.value?.state.connected ?? false)
const isConnecting = computed(() => client.value?.state.connecting ?? false)
const statusText = computed(() => client.value?.statusText.value ?? '已断开')
const reconnectAttempts = computed(
  () => client.value?.state.reconnectAttempts ?? 0
)

const statusLevel = computed(() => {
  if (isConnected.value) return 'success'
  if (isConnecting.value || reconnectAttempts.value > 0) return 'warning'
  return 'danger'
})

const queueTip = computed(() => {
  if (!client.value) return '未初始化'
  return statusText.value
})

const formatTime = (time) => dayjs(time).format('HH:mm:ss')

const addLog = (text, type = 'info') => {
  logs.value.unshift({ time: Date.now(), text, type })
  if (logs.value.length > 50) logs.value.pop()
}

// ─── 收到服务端消息 ─────────────────────────────────────────
const handleMessage = (event) => {
  let payload
  try {
    payload = JSON.parse(event.data)
  } catch {
    payload = { type: 'message', text: event.data, time: Date.now() }
  }

  // 心跳 pong 仅记录日志，不进入消息列表
  if (payload.type === 'pong') {
    addLog('收到服务端心跳响应 pong')
    return
  }

  messages.value.push(payload)
  if (messages.value.length > 200) {
    messages.value.splice(0, messages.value.length - 200)
  }

  if (payload.type === 'system') {
    addLog(`系统消息：${payload.text}`)
  } else if (payload.type === 'online' || payload.type === 'offline') {
    addLog(`当前在线连接数：${payload.count}`)
  }
}

// ─── 连接 / 断开 ────────────────────────────────────────────
const handleConnect = () => {
  if (!url.value?.trim()) {
    ElMessage.warning('请输入 WebSocket 服务地址')
    return
  }
  // 按当前配置重建单例（配置项在实例创建时固化）
  WebSocketClient.destroyInstance()
  const instance = WebSocketClient.getInstance({
    url: url.value.trim(),
    messageHandler: handleMessage,
    autoReconnect: autoReconnect.value,
    enableHeartbeat: enableHeartbeat.value,
    reconnectInterval: 3 * 1000,
    maxReconnectAttempts: 5
  })
  client.value = instance
  addLog(`正在连接 ${url.value} ...`)
  instance.init()
}

const handleDisconnect = () => {
  client.value?.close()
  addLog('已手动断开连接', 'warn')
}

// ─── 发送消息 ───────────────────────────────────────────────
const handleSend = () => {
  if (!client.value) {
    ElMessage.warning('请先建立连接')
    return
  }

  let data = sendText.value
  if (sendType.value === 'ping') {
    data = 'ping'
  } else if (!data.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  } else if (sendType.value === 'json') {
    data = JSON.stringify({
      type: 'custom',
      content: data,
      from: 'renderer',
      time: Date.now()
    })
  }

  const ok = client.value.send(data, true)
  if (ok) {
    sentCount.value++
    addLog(`已发送（${sendType.value}）：${data}`, 'success')
    if (sendType.value !== 'ping') sendText.value = ''
  } else {
    ElMessage.error('发送失败：连接不可用')
  }
}

const messageTagType = (type) => {
  const map = { system: 'primary', online: 'success', offline: 'info' }
  return map[type] || ''
}

const messageTypeLabel = (type) => {
  const map = {
    system: '系统',
    online: '上线',
    offline: '下线',
    message: '消息'
  }
  return map[type] || type
}

// 页面销毁时关闭连接并释放单例
onUnmounted(() => {
  if (WebSocketClient.hasInstance()) {
    WebSocketClient.destroyInstance()
    client.value = null
  }
})
</script>

<style lang="scss" scoped>
.socket-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 4px;
}

.status-chip {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 999px;

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &--success {
    color: var(--color-success);
    background: rgb(16 185 129 / 10%);

    .status-dot {
      background: var(--color-success);
    }
  }

  &--warning {
    color: var(--color-warning);
    background: rgb(245 158 11 / 10%);

    .status-dot {
      background: var(--color-warning);
    }
  }

  &--danger {
    color: var(--color-danger);
    background: rgb(239 68 68 / 10%);

    .status-dot {
      background: var(--color-danger);
    }
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.socket-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.config-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  align-items: center;
}

.config-url {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  min-width: 280px;
}

.config-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.config-label {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.socket-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (width <= 992px) {
    grid-template-columns: 1fr;
  }
}

.send-card {
  display: flex;
  flex-direction: column;
}

.send-type {
  margin-bottom: 12px;
}

.send-btn {
  align-self: flex-end;
  margin-top: 12px;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.log-list,
.message-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow: auto;
}

.log-item {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 12px;
}

.log-time {
  flex-shrink: 0;
  font-family: monospace;
  color: var(--color-text-muted);
}

.log-text {
  line-height: 1.6;
  color: var(--color-text-secondary);
  word-break: break-all;

  &--success {
    color: var(--color-success);
  }

  &--warn {
    color: var(--color-warning);
  }

  &--error {
    color: var(--color-danger);
  }
}

.log-empty {
  padding: 12px 0;
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
}

.message-item {
  display: flex;
  gap: 10px;
  align-items: baseline;
  padding: 8px 12px;
  background: var(--color-bg-input);
  border-radius: var(--radius-sm);
}

.message-text {
  flex: 1;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-primary);
  word-break: break-all;
}

.message-time {
  flex-shrink: 0;
  font-family: monospace;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
