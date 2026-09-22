<!-- AI 智能助手面板：服务端 AI 网关 · 流式会话 -->
<template>
  <Transition name="ai-panel">
    <div v-if="aiStore.visible" class="ai-assistant" :class="{ 'is-maximized': aiStore.maximized }">
      <!-- 头部：标题 + 网关状态 + 操作 -->
      <div class="ai-assistant__header">
        <div class="ai-assistant__heading">
          <h3 class="ai-assistant__title">AI 智能助手</h3>
          <div class="ai-assistant__status">
            <span class="ai-assistant__status-dot" :class="{ 'is-ready': aiStore.gateway.ready }"></span>
            <span class="ai-assistant__status-text">{{ aiStore.statusText }}</span>
          </div>
        </div>
        <div class="ai-assistant__actions">
          <button class="ai-assistant__text-btn" title="清空会话" @click="aiStore.clearMessages()">清空</button>
          <button
            class="ai-assistant__icon-btn"
            :title="aiStore.maximized ? '还原' : '最大化'"
            @click="aiStore.toggleMaximize()"
          >
            <SvgIcon :icon-class="aiStore.maximized ? 'mini' : 'fullscreen'" width="16px" height="16px" />
          </button>
          <button class="ai-assistant__icon-btn" title="关闭" @click="aiStore.togglePanel(false)">
            <SvgIcon icon-class="close" width="16px" height="16px" />
          </button>
        </div>
      </div>

      <!-- 会话记录 -->
      <div ref="listRef" class="ai-assistant__messages">
        <div v-for="msg in aiStore.messages" :key="msg.id" class="ai-msg" :class="{ 'is-user': msg.role === 'user' }">
          <div class="ai-msg__avatar">
            <!-- 助手头像：渐变圆 + 笑脸 -->
            <svg v-if="msg.role === 'assistant'" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="10" r="1.7" fill="#fff" />
              <circle cx="15" cy="10" r="1.7" fill="#fff" />
              <path
                d="M8.4 14.2c1 1.3 2.2 2 3.6 2s2.6-.7 3.6-2"
                stroke="#fff"
                stroke-width="1.7"
                fill="none"
                stroke-linecap="round"
              />
            </svg>
            <img
              v-else-if="userAvatar && !avatarLoadFailed"
              :src="userAvatar"
              :alt="displayName"
              @error="avatarLoadFailed = true"
            />
            <span v-else class="ai-msg__avatar-fallback">{{ userInitial }}</span>
          </div>
          <div class="ai-msg__body">
            <div class="ai-msg__meta">
              <span class="ai-msg__name">{{ msg.role === 'user' ? displayName : ASSISTANT_NAME }}</span>
              <span class="ai-msg__time">{{ msg.time }}</span>
            </div>
            <div class="ai-msg__bubble" :class="{ 'is-pending': msg.pending }">
              <!-- 等待首帧：三点跳动 -->
              <span v-if="msg.pending" class="ai-msg__typing">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <template v-else>
                <span class="ai-msg__content">{{ msg.content }}</span>
                <!-- 流式输出中的光标 -->
                <span
                  v-if="msg.role === 'assistant' && aiStore.streaming && msg.id === lastMessageId"
                  class="ai-msg__caret"
                ></span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="ai-assistant__footer">
        <textarea
          v-model="inputText"
          class="ai-assistant__input"
          rows="3"
          placeholder="输入你的问题，Enter 发送，Shift + Enter 换行"
          @keydown.enter.exact.prevent="handleSend"
        ></textarea>
        <div class="ai-assistant__footer-bar">
          <span class="ai-assistant__hint">Enter 发送，Shift + Enter 换行。</span>
          <el-button v-if="aiStore.streaming" type="primary" plain @click="aiStore.stop()">停止</el-button>
          <el-button v-else type="primary" :disabled="!canSend" @click="handleSend">发送</el-button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useAiAssistantStore, ASSISTANT_NAME } from '@/store/modules/aiAssistant'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'AiAssistant' })

const aiStore = useAiAssistantStore()
const userStore = useUserStore()

const inputText = ref('')
const listRef = ref(null)
const avatarLoadFailed = ref(false)

// 当前用户信息（取值逻辑同 ChatBot）
const displayName = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.name || userStore.userInfo?.username || 'Admin'
)
const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())
const userAvatar = computed(() => userStore.userInfo?.avatar || '')

const canSend = computed(() => !!inputText.value.trim() && !aiStore.streaming)
const lastMessageId = computed(() => aiStore.messages[aiStore.messages.length - 1]?.id)

const handleSend = () => {
  if (!canSend.value) return
  aiStore.send(inputText.value)
  inputText.value = ''
}

// 新消息 / 流式增量时保持滚动到底部
watch(
  () => [aiStore.messages.length, aiStore.messages[aiStore.messages.length - 1]?.content],
  () => {
    nextTick(() => {
      if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight
    })
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.ai-assistant {
  position: fixed;
  top: var(--titlebar-height);
  right: 0;
  bottom: 0;
  z-index: 1800;
  display: flex;
  flex-direction: column;
  width: 480px;
  max-width: 100vw;
  background: var(--color-bg-window);
  border-left: 1px solid var(--color-border);
  box-shadow: -8px 0 24px -8px rgb(0 0 0 / 12%);
  transition: width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.is-maximized {
    width: min(960px, 100vw);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  &__status {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 6px;
  }

  &__status-dot {
    width: 8px;
    height: 8px;
    background: var(--color-text-muted);
    border-radius: 50%;

    &.is-ready {
      background: var(--color-success);
      box-shadow: 0 0 6px color-mix(in srgb, var(--color-success), transparent 50%);
    }
  }

  &__status-text {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__actions {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  &__text-btn {
    padding: 4px 8px;
    font-size: 13px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    transition: all 0.2s;

    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
    }
  }

  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    transition: all 0.2s;

    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
    }
  }

  &__messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: var(--color-bg-content);
  }

  &__footer {
    padding: 16px 20px;
    border-top: 1px solid var(--color-border);
  }

  &__input {
    width: 100%;
    padding: 12px 14px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    color: var(--color-text-primary);
    resize: none;
    background: var(--color-bg-window);
    border: 1px solid var(--color-box-border);
    border-radius: var(--radius-md);
    outline: none;
    transition: border-color 0.2s;

    &::placeholder {
      color: var(--color-text-muted);
    }

    &:focus {
      border-color: var(--color-primary);
    }
  }

  &__footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }

  &__hint {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}

.ai-msg {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  &.is-user {
    flex-direction: row-reverse;

    .ai-msg__meta {
      flex-direction: row-reverse;
    }

    .ai-msg__bubble {
      color: #fff;
      background: var(--gradient-primary);
      border-color: transparent;
    }
  }

  &__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    overflow: hidden;
    background: var(--gradient-cool);
    border-radius: 50%;

    svg {
      width: 22px;
      height: 22px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__avatar-fallback {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
  }

  &__body {
    display: flex;
    flex-direction: column;
    min-width: 0;
    max-width: calc(100% - 46px);
  }

  &__meta {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin-bottom: 6px;
  }

  &__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__time {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__bubble {
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.7;
    color: var(--color-text-primary);
    word-break: break-word;
    background: var(--color-bg-window);
    border: 1px solid var(--color-box-border);
    border-radius: var(--radius-md);
  }

  &__content {
    white-space: pre-wrap;
  }

  // 流式输出光标
  &__caret {
    display: inline-block;
    width: 2px;
    height: 14px;
    margin-left: 2px;
    vertical-align: -2px;
    background: var(--color-primary);
    animation: ai-caret-blink 0.8s step-end infinite;
  }

  // 等待首帧的三点跳动
  &__typing {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    height: 20px;

    i {
      width: 6px;
      height: 6px;
      background: var(--color-text-muted);
      border-radius: 50%;
      animation: ai-typing-bounce 1.2s ease-in-out infinite;

      &:nth-child(2) {
        animation-delay: 0.15s;
      }

      &:nth-child(3) {
        animation-delay: 0.3s;
      }
    }
  }
}

// 面板滑入 / 滑出
.ai-panel-enter-active,
.ai-panel-leave-active {
  transition: transform 0.28s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.ai-panel-enter-from,
.ai-panel-leave-to {
  transform: translateX(100%);
}

@keyframes ai-caret-blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

@keyframes ai-typing-bounce {
  0%,
  60%,
  100% {
    opacity: 0.5;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}
</style>
