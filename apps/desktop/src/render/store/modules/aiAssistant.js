/**
 * AI 智能助手状态管理
 *
 * 面板显隐 / 最大化、会话记录与流式回复状态。
 * 回复经服务端 AI 网关流式下发（见 utils/aiStream），delta 事件实时追加到末条助手消息。
 * 注意：会话不做持久化，避免应用重启后残留半截流式消息。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { startAiStream } from '@/utils/aiStream'
import { useUserStore } from '@/store/modules/user'
import request from '@/utils/request'

export const ASSISTANT_NAME = 'AI 智能助手'

// 首条问候语（与截图文案一致）
const GREETING = '你好，我是你的 AI 智能助手。当前回复由服务端统一代理，支持流式输出和后续模型扩展。'

let messageSeed = 0
let streamSeq = 0

const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const buildGreeting = () => ({
  id: ++messageSeed,
  role: 'assistant',
  content: GREETING,
  time: formatTime()
})

export const useAiAssistantStore = defineStore('ai-assistant', () => {
  const visible = ref(false) // 面板是否可见
  const maximized = ref(false) // 是否最大化（加宽面板）
  const streaming = ref(false) // 是否有进行中的流式回复
  const gateway = ref({ ready: false, streaming: true, provider: '', model: '' })
  const messages = ref([buildGreeting()])

  let activeStream = null

  // 状态栏文案：就绪 · 服务端 AI 网关 · 流式会话
  const statusText = computed(() => `${gateway.value.ready ? '就绪' : '未连接'} · 服务端 AI 网关 · 流式会话`)

  // 拉取网关状态（provider / model），失败时标记未连接
  async function fetchStatus() {
    try {
      const data = await request({ url: '/ai/status' })
      gateway.value = { ready: true, streaming: true, provider: data?.provider || '', model: data?.model || '' }
    } catch {
      gateway.value = { ready: false, streaming: true, provider: '', model: '' }
    }
  }

  // 切换面板显隐；展开时刷新网关状态
  function togglePanel(force) {
    visible.value = force === undefined ? !visible.value : !!force
    if (visible.value) fetchStatus()
  }

  function toggleMaximize(force) {
    maximized.value = force === undefined ? !maximized.value : !!force
  }

  // 结束本轮流式回复（done / error / cancelled 共用）
  function finalizeStream() {
    activeStream = null
    streaming.value = false
  }

  function clearMessages() {
    activeStream?.cancel()
    finalizeStream()
    messages.value = [buildGreeting()]
  }

  // 中止进行中的流式回复（保留已输出内容）
  function stop() {
    if (!streaming.value) return
    activeStream?.cancel()
    const last = messages.value[messages.value.length - 1]
    if (last?.role === 'assistant') {
      last.pending = false
      if (!last.content) last.content = '（已停止）'
    }
    finalizeStream()
  }

  /**
   * 发送一条用户消息并消费流式回复
   * @param {string} text 用户输入
   */
  function send(text) {
    const content = String(text || '').trim()
    if (!content || streaming.value) return

    const userStore = useUserStore()
    messages.value.push({ id: ++messageSeed, role: 'user', content, time: formatTime() })
    messages.value.push({ id: ++messageSeed, role: 'assistant', content: '', time: formatTime(), pending: true })
    // 取响应式代理引用：直接改原始对象不会触发视图更新
    const assistantMsg = messages.value[messages.value.length - 1]
    const history = messages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))

    streaming.value = true
    activeStream = startAiStream({
      messages: history,
      token: userStore.token,
      requestId: `ai_${Date.now()}_${++streamSeq}`,
      onEvent: (evt) => {
        switch (evt?.type) {
          case 'meta':
            gateway.value = { ready: true, streaming: true, provider: evt.provider || '', model: evt.model || '' }
            break
          case 'delta':
            assistantMsg.pending = false
            assistantMsg.content += evt.text || ''
            break
          case 'done':
            assistantMsg.pending = false
            if (!assistantMsg.content) assistantMsg.content = '（模型未返回内容）'
            finalizeStream()
            break
          case 'error':
            assistantMsg.pending = false
            assistantMsg.content = assistantMsg.content
              ? `${assistantMsg.content}\n[中断] ${evt.message || 'AI 服务异常'}`
              : `抱歉，AI 服务暂时不可用：${evt.message || '未知错误'}`
            finalizeStream()
            break
          case 'cancelled':
            assistantMsg.pending = false
            finalizeStream()
            break
          default:
            break
        }
      }
    })
  }

  return {
    visible,
    maximized,
    streaming,
    gateway,
    messages,
    statusText,
    fetchStatus,
    togglePanel,
    toggleMaximize,
    clearMessages,
    stop,
    send
  }
})
