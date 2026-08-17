<!-- 模板中心 - 聊天：左侧联系人列表 + 右侧会话区 -->
<template>
  <div class="template-chat-page">
    <div class="template-chat">
      <!-- 左侧：联系人列表 -->
      <div class="template-chat__sidebar">
        <div class="template-chat__search">
          <el-input v-model="searchQuery" placeholder="搜索联系人" clearable>
            <template #prefix>
              <SvgIcon icon-class="search" width="14px" height="14px" />
            </template>
          </el-input>
        </div>

        <!-- 排序方式 -->
        <div class="template-chat__sortbar">
          <el-dropdown
            trigger="click"
            placement="bottom-start"
            @command="handleSortCommand"
          >
            <span class="sort-trigger">
              <span>{{ sortLabel }}</span>
              <Icon icon="lucide:chevron-down" width="14" height="14" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="time">按时间排序</el-dropdown-item>
                <el-dropdown-item command="name">按名称排序</el-dropdown-item>
                <el-dropdown-item command="read">全部标为已读</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="template-chat__contacts">
          <div
            v-for="item in filteredContacts"
            :key="item.id"
            class="contact-item"
            :class="{ active: chatStore.selectedContactId === item.id }"
            @click="handleSelect(item)"
          >
            <div class="contact-item__avatar">
              <img :src="item.avatar" :alt="item.name" />
              <span
                class="status-dot"
                :class="item.online ? 'is-online' : 'is-offline'"
              ></span>
            </div>
            <div class="contact-item__info">
              <div class="contact-item__row">
                <span class="contact-item__name">{{ item.name }}</span>
                <span class="contact-item__time">{{ item.lastTime }}</span>
              </div>
              <div class="contact-item__row">
                <span class="contact-item__email">{{ item.email }}</span>
                <span v-if="item.unread" class="contact-item__badge">
                  {{ item.unread > 99 ? '99+' : item.unread }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="!filteredContacts.length" class="template-chat__empty">
            <SvgIcon icon-class="no-message" width="32px" height="32px" />
            <span>未找到相关联系人</span>
          </div>
        </div>
      </div>

      <!-- 右侧：会话区域 -->
      <div class="template-chat__main">
        <!-- 会话头部 -->
        <div class="template-chat__header">
          <div class="header-profile">
            <img
              class="header-avatar"
              :src="chatStore.selectedContact?.avatar"
              :alt="chatStore.selectedContact?.name"
            />
            <div class="header-meta">
              <span class="header-name">
                {{ chatStore.selectedContact?.name }}
              </span>
              <div class="header-status">
                <span
                  class="status-dot"
                  :class="
                    chatStore.selectedContact?.online
                      ? 'is-online'
                      : 'is-offline'
                  "
                ></span>
                <span class="header-status-text">
                  {{ chatStore.selectedContact?.online ? '在线' : '离线' }}
                </span>
              </div>
            </div>
          </div>
          <span class="header-email">
            {{ chatStore.selectedContact?.email }}
          </span>
        </div>

        <!-- 消息列表 -->
        <div ref="messageContainer" class="template-chat__messages">
          <div
            v-for="message in chatStore.currentMessages"
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
              <img
                v-else
                :src="chatStore.selectedContact?.avatar"
                :alt="chatStore.selectedContact?.name"
              />
            </div>
            <div class="chat-message__body">
              <div class="chat-message__meta">
                <span class="chat-message__sender">
                  {{ message.isMe ? displayName : message.sender }}
                </span>
                <span class="chat-message__time">{{ message.time }}</span>
              </div>
              <div class="chat-message__bubble">{{ message.content }}</div>
            </div>
          </div>

          <!-- 对方正在输入 -->
          <div v-if="isTyping" class="chat-message">
            <div class="chat-message__avatar">
              <img
                :src="chatStore.selectedContact?.avatar"
                :alt="chatStore.selectedContact?.name"
              />
            </div>
            <div class="chat-message__body">
              <div class="chat-message__bubble chat-message__bubble--typing">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="template-chat__input">
          <el-input
            v-model="messageText"
            type="textarea"
            :rows="3"
            placeholder="输入消息，回车发送"
            resize="none"
            @keyup.enter.prevent="sendMessage"
          />
          <div class="template-chat__actions">
            <div class="template-chat__tools">
              <SvgIcon
                icon-class="image"
                class-name="template-chat__tool-icon"
                width="18px"
                height="18px"
              />
              <SvgIcon
                icon-class="emoji"
                class-name="template-chat__tool-icon"
                width="18px"
                height="18px"
              />
            </div>
            <el-button
              type="primary"
              :disabled="!messageText.trim()"
              class="template-chat__send"
              @click="sendMessage"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/store/modules/chat'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'template-chat' })

const SCROLL_DELAY = 100

const chatStore = useChatStore()
const userStore = useUserStore()

const searchQuery = ref('')
const messageText = ref('')
const messageContainer = ref(null)
const avatarLoadFailed = ref(false)

// 排序方式：time-按时间（最近联系在前） / name-按名称
const sortMode = ref('time')
const sortLabel = computed(() =>
  sortMode.value === 'name' ? '按名称排序' : '按时间排序'
)

// 排序方式下拉命令
const handleSortCommand = (command) => {
  if (command === 'read') {
    chatStore.markAllRead()
    return
  }
  sortMode.value = command
}

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

// 按名称 / 邮箱过滤联系人，并按当前排序方式排序
const filteredContacts = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  let list = chatStore.contacts
  if (keyword) {
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword)
    )
  }

  const sorted = [...list]
  if (sortMode.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
  } else {
    sorted.sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0))
  }
  return sorted
})

// 当前联系人是否正在输入
const isTyping = computed(
  () => !!chatStore.typingMap[chatStore.selectedContactId]
)

const formatCurrentTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      }
    }, SCROLL_DELAY)
  })
}

// 选择联系人
const handleSelect = (item) => {
  if (chatStore.selectedContactId === item.id) return
  chatStore.selectContact(item.id)
  scrollToBottom()
}

// 发送消息并触发模拟回复
const sendMessage = () => {
  const text = messageText.value.trim()
  if (!text) return
  const contactId = chatStore.selectedContactId

  chatStore.pushMessage(contactId, {
    id: chatStore.nextMessageId(),
    sender: displayName.value,
    content: text,
    time: formatCurrentTime(),
    isMe: true
  })
  messageText.value = ''
  chatStore.scheduleReply(contactId)
  scrollToBottom()
}

// 消息变化 / 打字状态变化时保持滚动到底部
watch(
  () => [
    chatStore.currentMessages.length,
    chatStore.selectedContactId,
    isTyping.value
  ],
  () => scrollToBottom()
)

onMounted(() => {
  avatarLoadFailed.value = false
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.template-chat-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.template-chat {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

/* ── 左侧联系人 ─────────────────────────────────────────── */
.template-chat__sidebar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 260px;
  min-height: 0;
  border-right: 1px solid var(--color-border);
}

.template-chat__search {
  flex-shrink: 0;
  padding: 14px 14px 10px;

  :deep(.el-input__wrapper) {
    border-radius: 8px;
  }
}

.template-chat__sortbar {
  flex-shrink: 0;
  padding: 0 14px 10px;
}

.sort-trigger {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary);
  }
}

.template-chat__contacts {
  flex: 1;
  min-height: 0;
  padding: 0 10px 14px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }
}

.contact-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  margin-bottom: 2px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.2s ease;

  &:hover {
    background: var(--color-bg-hover);
  }

  &.active {
    background: color-mix(in srgb, var(--color-primary), transparent 90%);

    .contact-item__name {
      color: var(--color-primary);
    }
  }

  &__avatar {
    position: relative;
    flex-shrink: 0;

    img {
      display: block;
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 50%;
    }
  }

  &__info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__row {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    overflow: hidden;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__time {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--color-text-muted);
  }

  &__email {
    overflow: hidden;
    font-size: 12px;
    color: var(--color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    flex-shrink: 0;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    font-size: 10px;
    font-weight: 600;
    line-height: 16px;
    color: #fff;
    text-align: center;
    background: var(--color-danger);
    border-radius: 8px;
  }
}

.template-chat__empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  padding: 40px 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.status-dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  border: 2px solid var(--color-bg-card);
  border-radius: 50%;

  &.is-online {
    background: var(--color-success);
  }

  &.is-offline {
    background: var(--color-text-muted);
  }
}

/* ── 右侧会话区 ─────────────────────────────────────────── */
.template-chat__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.template-chat__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);

  .header-profile {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .header-avatar {
    width: 38px;
    height: 38px;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: var(--shadow-sm);
  }

  .header-meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .header-name {
    overflow: hidden;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-status {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-top: 3px;

    .status-dot {
      position: static;
      width: 7px;
      height: 7px;
      border: none;
    }
  }

  .header-status-text {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  .header-email {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--color-text-muted);
  }
}

.template-chat__messages {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }
}

.template-chat__input {
  flex-shrink: 0;
  padding: 14px 20px 18px;
  border-top: 1px solid var(--color-border-light);

  :deep(.el-textarea__inner) {
    border-radius: var(--radius-md);
  }
}

.template-chat__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.template-chat__tools {
  display: flex;
  gap: 14px;
  align-items: center;
}

.template-chat__tool-icon {
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary);
  }
}

.template-chat__send {
  min-width: 80px;
}

/* ── 消息气泡 ─────────────────────────────────────────── */
.chat-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 22px;

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
      border-radius: 10px 2px 10px 10px;
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
    max-width: 65%;
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
    border-radius: 2px 10px 10px;

    &--typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 13px 16px;
    }
  }
}

.typing-dot {
  width: 5px;
  height: 5px;
  background: var(--color-text-muted);
  border-radius: 50%;
  animation: typing-bounce 1.2s infinite ease-in-out;

  &:nth-child(2) {
    animation-delay: 0.15s;
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
  }
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    opacity: 0.4;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}
</style>
