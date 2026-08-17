<!-- 系统聊天窗口（Lightning Bot） -->
<template>
  <el-drawer
    v-model="visible"
    size="480px"
    :with-header="false"
    class="chat-bot-drawer"
  >
    <div class="chat-bot">
      <!-- 头部 -->
      <div class="chat-bot__header">
        <div class="chat-bot__profile">
          <img class="chat-bot__avatar" :src="botAvatar" alt="Lightning Bot" />
          <div class="chat-bot__meta">
            <span class="chat-bot__name">Lightning Bot</span>
            <div class="chat-bot__status">
              <span class="chat-bot__status-dot"></span>
              <span class="chat-bot__status-text">在线</span>
            </div>
          </div>
        </div>
        <button class="chat-bot__close" title="关闭" @click="closeChat">
          <SvgIcon icon-class="close" width="16px" height="16px" />
        </button>
      </div>

      <!-- 聊天消息区域 -->
      <div ref="messageContainer" class="chat-bot__messages">
        <div
          v-for="message in messages"
          :key="message.id"
          class="chat-message"
          :class="{ 'is-me': message.isMe }"
        >
          <div class="chat-message__avatar">
            <img
              v-if="message.isMe && userAvatar && !avatarLoadFailed"
              :src="userAvatar"
              :alt="displayName"
              @error="avatarLoadFailed = true"
            />
            <span v-else-if="message.isMe" class="avatar-fallback">
              {{ userInitial }}
            </span>
            <img v-else :src="botAvatar" alt="Lightning Bot" />
          </div>
          <div class="chat-message__body">
            <div class="chat-message__meta">
              <span class="chat-message__sender">{{ message.sender }}</span>
              <span class="chat-message__time">{{ message.time }}</span>
            </div>
            <div class="chat-message__bubble">{{ message.content }}</div>
          </div>
        </div>
      </div>

      <!-- 聊天输入区域 -->
      <div class="chat-bot__input">
        <el-input
          v-model="messageText"
          type="textarea"
          :rows="3"
          placeholder="输入消息"
          resize="none"
          @keyup.enter.prevent="sendMessage"
        />
        <div class="chat-bot__actions">
          <div class="chat-bot__tools">
            <SvgIcon
              icon-class="image"
              class-name="chat-bot__tool-icon"
              width="18px"
              height="18px"
            />
            <SvgIcon
              icon-class="emoji"
              class-name="chat-bot__tool-icon"
              width="18px"
              height="18px"
            />
          </div>
          <el-button type="primary" class="chat-bot__send" @click="sendMessage">
            发送
          </el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useChatStore } from '@/store/modules/chat'
import { useUserStore } from '@/store/modules/user'
import botAvatar from '@/assets/bar/app.png'

defineOptions({ name: 'ChatBot' })

// 常量定义
const SCROLL_DELAY = 100
const BOT_NAME = 'Lightning Bot'

const chatStore = useChatStore()
const userStore = useUserStore()

// 抽屉显隐（双向绑定到 store）
const visible = computed({
  get: () => chatStore.visible,
  set: (val) => chatStore.toggleChat(val)
})

// 当前用户信息（取值逻辑同 UserDropdown）
const displayName = computed(
  () =>
    userStore.userInfo?.nickname ||
    userStore.userInfo?.name ||
    userStore.userInfo?.username ||
    'Admin'
)
const userInitial = computed(() => displayName.value.slice(0, 1).toUpperCase())
const userAvatar = computed(() => userStore.userInfo?.avatar || '')
const avatarLoadFailed = ref(false)

// 初始化聊天消息数据
const initializeMessages = () => [
  {
    id: 1,
    sender: BOT_NAME,
    content: '你好！我是你的AI助手，有什么我可以帮你的吗？',
    time: '10:00',
    isMe: false
  },
  {
    id: 2,
    sender: displayName.value,
    content: '我想了解一下系统的使用方法。',
    time: '10:01',
    isMe: true
  },
  {
    id: 3,
    sender: BOT_NAME,
    content:
      '好的，我来为您介绍系统的主要功能。首先，您可以通过左侧菜单访问不同的功能模块...',
    time: '10:02',
    isMe: false
  },
  {
    id: 4,
    sender: displayName.value,
    content: '听起来很不错，能具体讲讲数据分析部分吗？',
    time: '10:05',
    isMe: true
  },
  {
    id: 5,
    sender: BOT_NAME,
    content:
      '当然可以。数据分析模块可以帮助您实时监控关键指标，并生成详细的报表...',
    time: '10:06',
    isMe: false
  },
  {
    id: 6,
    sender: displayName.value,
    content: '太好了，那我如何开始使用呢？',
    time: '10:08',
    isMe: true
  },
  {
    id: 7,
    sender: BOT_NAME,
    content:
      '您可以先创建一个项目，然后在项目中添加相关的数据源，系统会自动进行分析。',
    time: '10:09',
    isMe: false
  },
  {
    id: 8,
    sender: displayName.value,
    content: '明白了，谢谢你的帮助！',
    time: '10:10',
    isMe: true
  },
  {
    id: 9,
    sender: BOT_NAME,
    content: '不客气，有任何问题随时联系我。',
    time: '10:11',
    isMe: false
  }
]

const messages = ref(initializeMessages())
const messageText = ref('')
const messageContainer = ref(null)
let messageId = 10

// 工具函数
const formatCurrentTime = () => {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      }
    }, SCROLL_DELAY)
  })
}

// 发送消息
const sendMessage = () => {
  const text = messageText.value.trim()
  if (!text) return

  messages.value.push({
    id: messageId++,
    sender: displayName.value,
    content: text,
    time: formatCurrentTime(),
    isMe: true
  })
  messageText.value = ''
  scrollToBottom()
}

// 关闭聊天窗口
const closeChat = () => {
  chatStore.toggleChat(false)
}

// 打开抽屉时滚动到底部
watch(visible, (val) => {
  if (val) {
    avatarLoadFailed.value = false
    scrollToBottom()
  }
})
</script>

<style lang="scss">
// 抽屉本体样式（ElDrawer teleport 到 body，需非 scoped）
.chat-bot-drawer {
  background: var(--color-bg-window);

  .el-drawer__body {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
  }
}
</style>

<style lang="scss" scoped>
.chat-bot {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--color-border-light);
  }

  &__profile {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
  }

  &__meta {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__status {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-top: 3px;
  }

  &__status-dot {
    width: 7px;
    height: 7px;
    background: var(--color-success);
    border-radius: 50%;
    box-shadow: 0 0 6px
      color-mix(in srgb, var(--color-success), transparent 40%);
  }

  &__status-text {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-hover);
    }
  }

  &__messages {
    flex: 1;
    min-height: 0;
    padding: 20px 16px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 4px;
    }
  }

  &__input {
    flex-shrink: 0;
    padding: 12px 16px 16px;
    border-top: 1px solid var(--color-border-light);

    :deep(.el-textarea__inner) {
      border-radius: var(--radius-md);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
  }

  &__tools {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  &__tool-icon {
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__send {
    min-width: 80px;
  }
}

.chat-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  &.is-me {
    flex-direction: row-reverse;

    .chat-message__body {
      align-items: flex-end;
    }

    .chat-message__meta {
      flex-direction: row-reverse;
    }

    .chat-message__bubble {
      background: color-mix(in srgb, var(--color-primary), transparent 85%);
      border-radius: 2px 10px 10px;
    }
  }

  &__avatar {
    flex-shrink: 0;

    img {
      display: block;
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 50%;
    }

    .avatar-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      background: var(--color-primary);
      border-radius: 50%;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 70%;
  }

  &__meta {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 12px;
  }

  &__sender {
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__time {
    color: var(--color-text-muted);
  }

  &__bubble {
    padding: 10px 14px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-text-primary);
    word-break: break-word;
    white-space: pre-wrap;
    background: color-mix(
      in srgb,
      var(--color-text-secondary),
      transparent 88%
    );
    border-radius: 10px 2px 10px 10px;
  }
}
</style>
