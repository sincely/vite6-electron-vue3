<!--
  在线客服组件 OnlineSupport

  通过 `enabled` 属性控制整个浮窗是否显示：
    <OnlineSupport :enabled="false" />   ← 不渲染任何 DOM
    <OnlineSupport :enabled="true" />    ← 渲染悬浮按钮，点击可展开聊天面板

  两种定位模式：
    - mode="fixed"（默认）：通过 Teleport 到 body，position: fixed
      吸附在视口的某个角（右下 / 左下）
    - mode="inline"：保留在 DOM 树中，position: absolute
      锚定到最近定位父级的右上角，适合嵌入布局的内容区

  能力：
    - 文本对话（含 Enter 发送 / Shift+Enter 换行）
    - 表情包选择并插入到光标位置
    - 图片 / 文件附件上传（含拖拽到消息区、剪贴板粘贴）
    - 图片点击放大预览
    - 受控 / 非受控模式（v-model:open）
-->
<template>
  <component :is="inline ? 'div' : Teleport" v-if="inline || enabled" :to="inline ? undefined : 'body'">
    <div
      v-if="enabled"
      class="online-support"
      :class="[`is-${position}`, { 'is-inline': inline, 'is-panel-open': panelOpen }]"
      :style="floatingStyle"
    >
      <!-- 悬浮按钮 -->
      <button v-if="!panelOpen" class="online-support__trigger" :title="triggerTitle" @click="handleTogglePanel">
        <span class="online-support__trigger-icon">
          <SvgIcon icon-class="message" width="22px" height="22px" />
        </span>
        <span v-if="showUnread && unread > 0" class="online-support__badge">
          {{ unread > 99 ? '99+' : unread }}
        </span>
      </button>

      <!-- 聊天面板 -->
      <div v-else class="online-support__panel">
        <!-- 头部 -->
        <div class="online-support__header">
          <div class="online-support__profile">
            <div class="online-support__avatar">
              <SvgIcon icon-class="message" width="18px" height="18px" />
            </div>
            <div class="online-support__meta">
              <span class="online-support__name">在线客服</span>
              <div class="online-support__status">
                <span class="online-support__status-dot"></span>
                <span>{{ statusText }}</span>
              </div>
            </div>
          </div>
          <button class="online-support__close" title="收起" @click="handleTogglePanel(false)">
            <SvgIcon icon-class="close" width="16px" height="16px" />
          </button>
        </div>

        <!-- 消息区（支持拖拽文件） -->
        <div
          ref="messageListRef"
          class="online-support__messages"
          :class="{ 'is-dragover': isDraggingFile }"
          @dragenter.prevent.stop="handleDragEnter"
          @dragover.prevent.stop="handleDragOver"
          @dragleave.prevent.stop="handleDragLeave"
          @drop.prevent.stop="handleDrop"
        >
          <template v-for="msg in messages" :key="msg.id">
            <!-- 系统提示 -->
            <div v-if="msg.type === 'system'" class="online-support__notice">
              {{ msg.content }}
            </div>

            <!-- 普通消息 / 图片 / 文件 -->
            <div v-else class="online-support__bubble-row" :class="{ 'is-agent': msg.from === 'agent' }">
              <div class="online-support__bubble-avatar">
                <SvgIcon v-if="msg.from === 'agent'" icon-class="message" width="14px" height="14px" />
                <span v-else class="online-support__avatar-fallback">
                  {{ userInitial }}
                </span>
              </div>

              <div class="online-support__bubble-stack">
                <!-- 图片消息 -->
                <div v-if="msg.messageType === 'image'" class="online-support__image" @click="previewImage(msg)">
                  <img :src="msg.content" :alt="msg.fileName || '图片'" />
                  <div v-if="msg.fileName" class="online-support__image-name">
                    {{ msg.fileName }}
                  </div>
                </div>

                <!-- 文件消息 -->
                <a
                  v-else-if="msg.messageType === 'file'"
                  class="online-support__file"
                  :href="msg.content"
                  :download="msg.fileName"
                  target="_blank"
                >
                  <div class="online-support__file-icon">
                    <SvgIcon icon-class="download" width="18px" height="18px" />
                  </div>
                  <div class="online-support__file-info">
                    <div class="online-support__file-name">
                      {{ msg.fileName }}
                    </div>
                    <div class="online-support__file-meta">
                      {{ msg.fileSize }}
                    </div>
                  </div>
                </a>

                <!-- 文本消息 -->
                <div v-else class="online-support__bubble">
                  {{ msg.content }}
                </div>

                <div class="online-support__bubble-time">{{ msg.time }}</div>
              </div>
            </div>
          </template>

          <!-- 拖拽时的提示遮罩 -->
          <div v-if="isDraggingFile" class="online-support__drop-mask">
            <SvgIcon icon-class="download" width="32px" height="32px" />
            <span>松开鼠标发送文件</span>
          </div>

          <!-- 常见问题快捷入口 -->
          <div v-if="showQuickReplies && messages.length <= 2" class="online-support__quick">
            <div
              v-for="item in quickReplies"
              :key="item"
              class="online-support__quick-item"
              @click="handleQuickReply(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>

        <!-- 待发送的附件预览条 -->
        <div v-if="pendingAttachments.length" class="online-support__pending">
          <div class="online-support__pending-list">
            <div v-for="item in pendingAttachments" :key="item.key" class="online-support__pending-item">
              <img v-if="item.isImage" :src="item.url" class="online-support__pending-thumb" alt="" />
              <div v-else class="online-support__pending-file">
                <SvgIcon icon-class="download" width="14px" height="14px" />
                <span class="online-support__pending-file-name">
                  {{ item.fileName }}
                </span>
              </div>
              <button class="online-support__pending-remove" title="移除" @click="removePending(item.key)">
                <SvgIcon icon-class="close" width="10px" height="10px" />
              </button>
            </div>
          </div>
        </div>

        <!-- 输入区（表情 / 文件按钮嵌入输入框，发送按钮改为图标） -->
        <div class="online-support__input">
          <div class="online-support__compose">
            <el-input
              ref="inputRef"
              v-model="inputText"
              type="textarea"
              :rows="2"
              :placeholder="inputPlaceholder"
              resize="none"
              @keydown="handleKeydown"
              @paste="handlePaste"
            />

            <div class="online-support__compose-bar">
              <div class="online-support__compose-tools">
                <!-- 表情选择器：标签页分类 + 最近使用 + 光标插入 -->
                <div ref="emojiWrapRef" class="online-support__emoji-wrap">
                  <button
                    class="online-support__tool"
                    :class="{ 'is-active': emojiVisible }"
                    title="表情"
                    :disabled="!showEmoji"
                    @click.stop="toggleEmojiPanel"
                  >
                    <SvgIcon icon-class="emoji" width="18px" height="18px" />
                  </button>

                  <Transition name="emoji-panel">
                    <div v-show="emojiVisible" class="online-support__emoji-panel" @click.stop>
                      <!-- 分类标签页 -->
                      <div class="online-support__emoji-tabs">
                        <button
                          v-for="tab in emojiTabs"
                          :key="tab.key"
                          class="online-support__emoji-tab"
                          :class="{ 'is-active': activeEmojiTab === tab.key }"
                          :title="tab.label"
                          @click="activeEmojiTab = tab.key"
                        >
                          <span v-if="tab.icon" class="online-support__emoji-tab-icon">
                            {{ tab.icon }}
                          </span>
                          <span v-else class="online-support__emoji-tab-text">
                            {{ tab.label }}
                          </span>
                        </button>
                      </div>

                      <!-- 表情网格 -->
                      <div class="online-support__emoji-body">
                        <div
                          v-for="emo in currentEmojiList"
                          :key="emo"
                          class="online-support__emoji-cell"
                          :title="emo"
                          @click="insertEmoji(emo)"
                        >
                          {{ emo }}
                        </div>
                        <div v-if="!currentEmojiList.length" class="online-support__emoji-empty">
                          暂无最近使用的表情
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>

                <button
                  class="online-support__tool"
                  title="发送图片或文件"
                  :disabled="!showFile"
                  @click="triggerFilePicker"
                >
                  <SvgIcon icon-class="image" width="18px" height="18px" />
                </button>
                <input
                  ref="fileInputRef"
                  class="online-support__file-input"
                  type="file"
                  :accept="fileAccept"
                  multiple
                  @change="handleFileChange"
                />
              </div>

              <button class="online-support__send-icon" title="发送" :disabled="!canSend" @click="sendUserMessage">
                <SvgIcon icon-class="send" width="18px" height="18px" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片预览（Teleport 到 body，单实例） -->
      <el-image-viewer v-if="previewSrc" :url-list="[previewSrc]" :initial-index="0" @close="previewSrc = ''" />
    </div>
  </component>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Teleport } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useOnlineSupportStore } from '@/store/modules/onlineSupport'

defineOptions({ name: 'OnlineSupport' })

const props = defineProps({
  // 总开关：false 时整个浮窗不渲染
  enabled: { type: Boolean, default: true },
  // 定位模式：fixed（默认，浮窗在视口角） / inline（嵌入父容器右上）
  inline: { type: Boolean, default: false },
  // 浮窗位置：bottom-right / bottom-left / top-right / top-left
  // - bottom-*：fixed 模式下吸附视口底角
  // - top-*：inline 模式下锚定父级右上 / 左上
  position: {
    type: String,
    default: 'top-left',
    validator: (v) => ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(v)
  },
  // 距视口边缘距离（px）
  offset: { type: Number, default: 24 },
  // 是否在浮窗按钮上展示未读角标
  showUnread: { type: Boolean, default: true },
  // 是否显示常见问题快捷入口
  showQuickReplies: { type: Boolean, default: true },
  // 常见问题
  quickReplies: {
    type: Array,
    default: () => ['如何使用本系统？', '如何联系人工客服？', '遇到问题如何反馈？']
  },
  // 客服在线文案
  statusText: { type: String, default: '在线服务中' },
  // 按钮悬浮提示
  triggerTitle: { type: String, default: '在线客服' },
  // 受控：聊天面板展开状态（v-model:open）
  open: { type: Boolean, default: undefined },
  // 是否启用表情包
  showEmoji: { type: Boolean, default: true },
  // 是否启用文件 / 图片发送
  showFile: { type: Boolean, default: true },
  // 文件 input 的 accept
  fileAccept: {
    type: String,
    default: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt'
  },
  // 单个文件大小上限（MB）
  maxFileSizeMB: { type: Number, default: 10 }
})

const emit = defineEmits(['update:open', 'send', 'toggle', 'upload'])

// ─────────────────────────────────────────────────────────────
// 状态管理
// ─────────────────────────────────────────────────────────────
const store = useOnlineSupportStore()
const unread = computed(() => store.unread)

const panelOpen = computed({
  get() {
    return props.open === undefined ? store.panelOpen : props.open
  },
  set(val) {
    store.togglePanel(val)
    emit('update:open', val)
  }
})

const floatingStyle = computed(() => {
  const side = props.position.includes('right') ? 'right' : 'left'
  if (props.inline) {
    // inline 模式锚定到父级 top-right（或 top-left），bottom 自动伸展
    return {
      position: 'absolute',
      top: `${props.offset}px`,
      [side]: `${props.offset}px`
    }
  }
  return {
    [side]: `${props.offset}px`,
    bottom: `${props.offset}px`
  }
})

// ─────────────────────────────────────────────────────────────
// 表情包（标签页分类 + 最近使用 + 光标插入）
// ─────────────────────────────────────────────────────────────
const RECENT_KEY = 'online-support-recent-emoji'
const RECENT_MAX = 24

const emojiGroups = [
  {
    key: 'face',
    label: '表情',
    icon: '😀',
    list: '😀 😁 😂 🤣 😃 😄 😅 😆 😉 😊 😋 😎 😍 😘 🥰 😗 😙 😚 ☺️ 🙂 🤗 🤩 🤔 🤨 😐 😑 😶 🙄 😏 😣 😥 😮 🤐 😯 😪 😫 🥱 😴 😌 😛 😜 😝 🤤 😒 😓 😔 😕 🙃 🤑 😲 ☹️ 🙁 😖 😞 😟 😤 😢 😭 😦 😧 😨 😩 🤯 😬 😰 😱 🥵 🥶 😳 🤪 😵 😡 😠 🤬 😷 🤒 🤕 🤢 🤮 🤧 😇 🥳 🥺 🤠 🤡 🤥 🤫 🤭 🧐 🤓 😈 👿 👹 👺 💀 👻 👽 🤖'.split(
      ' '
    )
  },
  {
    key: 'gesture',
    label: '手势',
    icon: '👍',
    list: '👍 👎 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👋 🤚 🖐️ ✋ 🖖 👏 🙌 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦵 🦶 👂 👃 🧠 🦷 🦴 👀 👁️ 👄 💋'.split(
      ' '
    )
  },
  {
    key: 'animal',
    label: '动物',
    icon: '🐶',
    list: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐜 🦗 🕷️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦦 🦥 🐁 🐀 🐿️ 🦔'.split(
      ' '
    )
  },
  {
    key: 'food',
    label: '食物',
    icon: '🍎',
    list: '🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🫑 🌽 🥕 🫒 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🦴 🌭 🍔 🍟 🍕'.split(
      ' '
    )
  }
]

// 标签页定义：最近使用 + 四个分类
const emojiTabs = computed(() => [
  { key: 'recent', label: '最近', icon: '🕐' },
  ...emojiGroups.map((g) => ({ key: g.key, label: g.label, icon: g.icon }))
])

const activeEmojiTab = ref('face')

// 最近使用（localStorage 持久化）
const recentEmojis = ref(loadRecentEmojis())

function loadRecentEmojis() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentEmojis(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {
    // 静默失败
  }
}

function addRecentEmoji(emoji) {
  const list = recentEmojis.value.filter((e) => e !== emoji)
  list.unshift(emoji)
  recentEmojis.value = list.slice(0, RECENT_MAX)
  saveRecentEmojis(recentEmojis.value)
}

// 当前标签页对应的表情列表
const currentEmojiList = computed(() => {
  if (activeEmojiTab.value === 'recent') return recentEmojis.value
  const group = emojiGroups.find((g) => g.key === activeEmojiTab.value)
  return group ? group.list : []
})

const toggleEmojiPanel = () => {
  emojiVisible.value = !emojiVisible.value
  // 打开时默认切到「最近」标签（如果有记录），否则切到「表情」
  if (emojiVisible.value) {
    activeEmojiTab.value = recentEmojis.value.length ? 'recent' : 'face'
  }
}

// 在光标位置插入表情（而非追加到末尾）
const insertEmoji = (emoji) => {
  const textarea = inputRef.value?.$el?.querySelector('textarea')
  if (textarea) {
    const start = textarea.selectionStart ?? inputText.value.length
    const end = textarea.selectionEnd ?? start
    const before = inputText.value.slice(0, start)
    const after = inputText.value.slice(end)
    inputText.value = before + emoji + after
    // 记录最近使用
    addRecentEmoji(emoji)
    // 恢复光标到插入位置之后
    nextTick(() => {
      textarea.focus()
      const pos = start + emoji.length
      textarea.setSelectionRange(pos, pos)
    })
  } else {
    inputText.value = (inputText.value || '') + emoji
    addRecentEmoji(emoji)
  }
  // 不关闭面板，方便连续选择多个表情
}

const inputPlaceholder = computed(() => {
  if (props.showEmoji && props.showFile) return '输入消息，回车发送，Shift+Enter 换行'
  if (props.showFile) return '输入消息或发送文件，回车发送'
  if (props.showEmoji) return '输入消息或发表情，回车发送'
  return '输入消息，回车发送'
})

// ─────────────────────────────────────────────────────────────
// 消息列表（本地模拟客服回复，可替换为真实接口）
// ─────────────────────────────────────────────────────────────
let messageSeed = 1
const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
const isImageMime = (file) => file.type.startsWith('image/')

const AGENT_REPLIES = [
  '收到，我来帮您看看～',
  '您可以先在「常规设置」中查看相关选项。',
  '这个问题我帮您记录下来，稍后会安排同事跟进。',
  '更多功能还在持续迭代中，敬请期待！'
]

const messages = ref([
  {
    id: messageSeed++,
    type: 'system',
    content: '欢迎使用在线客服，客服小助手随时为您服务'
  },
  {
    id: messageSeed++,
    from: 'agent',
    messageType: 'text',
    content: '您好，我是您的在线客服，请问有什么可以帮您？',
    time: formatTime()
  }
])

const inputText = ref('')
const messageListRef = ref(null)
const inputRef = ref(null)
const fileInputRef = ref(null)
const emojiWrapRef = ref(null)
const userInitial = ref('我')
const emojiVisible = ref(false)
const previewSrc = ref('')
const isDraggingFile = ref(false)
const pendingAttachments = ref([])
let pendingKey = 0
let agentReplySeed = 0
let agentReplyTimer = null

// 点击表情区域外部时关闭下拉
onClickOutside(emojiWrapRef, () => {
  emojiVisible.value = false
})

const canSend = computed(() => !!inputText.value.trim() || pendingAttachments.value.length > 0)

// ─────────────────────────────────────────────────────────────
// 滚动到底
// ─────────────────────────────────────────────────────────────
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const handleTogglePanel = (force) => {
  const next = force === undefined ? !panelOpen.value : !!force
  panelOpen.value = next
  emit('toggle', next)
  if (next) scrollToBottom()
}

// ─────────────────────────────────────────────────────────────
// 文件 / 图片选择
// ─────────────────────────────────────────────────────────────
const triggerFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event) => {
  const files = Array.from(event.target.files || [])
  addFiles(files)
  // 清空 input.value 以便重复选择同名文件
  event.target.value = ''
}

const handlePaste = (event) => {
  const items = event.clipboardData?.items
  if (!items || !items.length) return
  const files = []
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) files.push(file)
    }
  }
  if (files.length) {
    event.preventDefault()
    addFiles(files)
  }
}

// ─────────────────────────────────────────────────────────────
// 拖拽上传
// ─────────────────────────────────────────────────────────────
let dragDepth = 0
const handleDragEnter = (event) => {
  if (!props.showFile) return
  if (!event.dataTransfer?.types?.includes('Files')) return
  dragDepth += 1
  isDraggingFile.value = true
}
const handleDragOver = (event) => {
  if (!props.showFile) return
  if (!event.dataTransfer?.types?.includes('Files')) return
  event.dataTransfer.dropEffect = 'copy'
}
const handleDragLeave = () => {
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) isDraggingFile.value = false
}
const handleDrop = (event) => {
  isDraggingFile.value = false
  dragDepth = 0
  if (!props.showFile) return
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length) addFiles(files)
}

// ─────────────────────────────────────────────────────────────
// 文件处理：校验大小、转 dataURL、入队待发送
// ─────────────────────────────────────────────────────────────
const MAX_SIZE_BYTES = computed(() => props.maxFileSizeMB * 1024 * 1024)

const addFiles = async (files) => {
  for (const file of files) {
    if (file.size > MAX_SIZE_BYTES.value) {
      ElMessage.warning(`${file.name} 超过 ${props.maxFileSizeMB}MB，无法发送`)
      continue
    }
    try {
      const url = await readFileAsDataURL(file)
      pendingAttachments.value.push({
        key: ++pendingKey,
        file,
        fileName: file.name,
        fileSize: file.size,
        url,
        isImage: isImageMime(file)
      })
    } catch (err) {
      console.error('[OnlineSupport] 读取文件失败', err)
      ElMessage.error(`${file.name} 读取失败`)
    }
  }
}

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const removePending = (key) => {
  pendingAttachments.value = pendingAttachments.value.filter((item) => item.key !== key)
}

// ─────────────────────────────────────────────────────────────
// 发送消息（文本 + 附件）
// ─────────────────────────────────────────────────────────────
const sendUserMessage = () => {
  const text = inputText.value.trim()
  const attachments = pendingAttachments.value.slice()

  if (!text && !attachments.length) return

  // 先 push 文本消息（若有）
  if (text) {
    messages.value.push({
      id: messageSeed++,
      from: 'user',
      messageType: 'text',
      content: text,
      time: formatTime()
    })
    emit('send', text)
  }
  // 再 push 附件（每条独立消息）
  attachments.forEach((att) => {
    messages.value.push({
      id: messageSeed++,
      from: 'user',
      messageType: att.isImage ? 'image' : 'file',
      content: att.url,
      fileName: att.fileName,
      fileSize: formatFileSize(att.fileSize),
      time: formatTime()
    })
    emit('upload', {
      fileName: att.fileName,
      fileSize: att.fileSize,
      fileType: att.file.type,
      dataURL: att.url
    })
  })

  inputText.value = ''
  pendingAttachments.value = []
  scrollToBottom()

  // 触发模拟客服回复
  scheduleAgentReply(text || (attachments.length ? '[附件]' : ''))
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendUserMessage()
  }
}

const handleQuickReply = (text) => {
  inputText.value = text
  sendUserMessage()
}

// ─────────────────────────────────────────────────────────────
// 图片预览
// ─────────────────────────────────────────────────────────────
const previewImage = (msg) => {
  previewSrc.value = msg.content
}

// ─────────────────────────────────────────────────────────────
// 模拟客服回复
// ─────────────────────────────────────────────────────────────
const scheduleAgentReply = (userText) => {
  if (agentReplyTimer) clearTimeout(agentReplyTimer)
  agentReplyTimer = setTimeout(() => {
    let reply
    if (userText && userText.includes('[附件]')) {
      reply = '已收到您发送的文件，我来看看～'
    } else {
      reply = AGENT_REPLIES[agentReplySeed % AGENT_REPLIES.length]
      agentReplySeed += 1
    }
    messages.value.push({
      id: messageSeed++,
      from: 'agent',
      messageType: 'text',
      content: reply,
      time: formatTime()
    })
    if (!panelOpen.value) store.addAgentMessage()
    scrollToBottom()
  }, 1000)
}

// ─────────────────────────────────────────────────────────────
// 监听器
// ─────────────────────────────────────────────────────────────
watch(panelOpen, (val) => {
  if (val) {
    store.clearUnread()
    scrollToBottom()
  }
})

watch(
  () => props.enabled,
  (val) => {
    if (!val) {
      if (panelOpen.value) panelOpen.value = false
      isDraggingFile.value = false
      dragDepth = 0
      pendingAttachments.value = []
    }
  }
)

// 暴露打开 / 关闭 / 清空方法，供外部通过 ref 调用
defineExpose({
  open: () => handleTogglePanel(true),
  close: () => handleTogglePanel(false),
  toggle: () => handleTogglePanel(),
  clearMessages: () => {
    messages.value = messages.value.filter((m) => m.type === 'system')
    pendingAttachments.value = []
  }
})

onBeforeUnmount(() => {
  if (agentReplyTimer) clearTimeout(agentReplyTimer)
  // 释放附件内存中的 dataURL
  pendingAttachments.value = []
})
</script>

<style lang="scss" scoped>
.online-support {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 14px;

  // inline 模式：相对父级定位，不参与 Teleport 到 body
  &.is-inline {
    position: absolute;
    z-index: 100;
    pointer-events: auto;

    // 面板展开时不占父级空间，靠 absolute 自然覆盖内容
    &.is-panel-open {
      align-items: flex-end;
    }
  }

  &.is-bottom-left {
    align-items: flex-start;
  }

  // ── 悬浮按钮 ────────────────────────────────────────────────
  &__trigger {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    color: #fff;
    cursor: pointer;
    background: var(--color-primary);
    border: none;
    border-radius: 50%;
    box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  &__trigger:hover {
    box-shadow: 0 12px 28px rgb(0 0 0 / 22%);
    transform: translateY(-2px);
  }

  &__trigger-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__badge {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
    color: #fff;
    text-align: center;
    background: var(--color-danger);
    border-radius: 999px;
  }

  // ── 面板 ────────────────────────────────────────────────────
  &__panel {
    display: flex;
    flex-direction: column;
    width: 360px;
    height: 520px;
    max-height: calc(100vh - 120px);
    overflow: hidden;
    background: var(--color-bg-window);
    border: 1px solid var(--color-border-light);
    border-radius: 14px;
    box-shadow: 0 18px 48px rgb(0 0 0 / 18%);
  }

  &__header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    color: #fff;
    background: linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary), #000 18%));
  }

  &__profile {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgb(255 255 255 / 22%);
    border-radius: 50%;
  }

  &__meta {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
  }

  &__status {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-top: 2px;
    font-size: 11px;
    opacity: 0.92;
  }

  &__status-dot {
    width: 6px;
    height: 6px;
    background: #5ef39f;
    border-radius: 50%;
    box-shadow: 0 0 6px rgb(94 243 159 / 70%);
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    color: #fff;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    opacity: 0.85;
    transition: all 0.2s ease;

    &:hover {
      background: rgb(255 255 255 / 18%);
      opacity: 1;
    }
  }

  // ── 消息区 ──────────────────────────────────────────────────
  &__messages {
    position: relative;
    flex: 1;
    min-height: 0;
    padding: 14px 14px 6px;
    overflow-y: auto;
    background: var(--color-bg-page);
    transition: background-color 0.2s ease;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 4px;
    }

    &.is-dragover {
      background: color-mix(in srgb, var(--color-primary), transparent 92%);
      outline: 2px dashed var(--color-primary);
      outline-offset: -8px;
    }
  }

  &__notice {
    padding: 4px 10px;
    margin: 4px auto 12px;
    font-size: 11px;
    color: var(--color-text-muted);
    text-align: center;
    background: var(--color-bg-input);
    border-radius: 999px;
  }

  &__bubble-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    margin-bottom: 14px;

    &.is-agent {
      .online-support__bubble {
        color: var(--color-text-primary);
        background: var(--color-bg-card);
        border-radius: 4px 12px 12px;
      }

      .online-support__file {
        background: var(--color-bg-card);
      }
    }

    &:not(.is-agent) {
      flex-direction: row-reverse;

      .online-support__bubble {
        color: #fff;
        background: var(--color-primary);
        border-radius: 12px 4px 12px 12px;
      }

      .online-support__bubble-stack {
        align-items: flex-end;
      }

      .online-support__bubble-time {
        text-align: right;
      }

      .online-support__file {
        color: var(--color-text-primary);
        background: color-mix(in srgb, var(--color-primary), transparent 80%);
      }

      .online-support__image {
        background: color-mix(in srgb, var(--color-primary), transparent 80%);
      }
    }
  }

  &__bubble-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    color: #fff;
    background: color-mix(in srgb, var(--color-primary), #fff 18%);
    border-radius: 50%;
  }

  &__avatar-fallback {
    font-size: 11px;
    font-weight: 600;
    color: #fff;
  }

  &__bubble-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 75%;
  }

  &__bubble {
    padding: 8px 12px;
    font-size: 13px;
    line-height: 1.5;
    word-break: break-word;
    white-space: pre-wrap;
  }

  &__bubble-time {
    margin-top: 3px;
    font-size: 11px;
    color: var(--color-text-muted);
  }

  // ── 图片消息 ────────────────────────────────────────────────
  &__image {
    max-width: 220px;
    overflow: hidden;
    cursor: zoom-in;
    background: var(--color-bg-card);
    border-radius: 8px;

    img {
      display: block;
      width: 100%;
      max-height: 220px;
      object-fit: cover;
    }
  }

  &__image-name {
    padding: 4px 8px;
    font-size: 11px;
    color: var(--color-text-muted);
    text-align: center;
    background: var(--color-bg-input);
  }

  // ── 文件消息 ────────────────────────────────────────────────
  &__file {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 180px;
    max-width: 240px;
    padding: 8px 10px;
    color: var(--color-text-primary);
    text-decoration: none;
    background: var(--color-bg-card);
    border-radius: 8px;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  &__file-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    color: #fff;
    background: var(--color-primary);
    border-radius: 6px;
  }

  &__file-info {
    flex: 1;
    min-width: 0;
  }

  &__file-name {
    overflow: hidden;
    font-size: 12px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__file-meta {
    margin-top: 2px;
    font-size: 11px;
    color: var(--color-text-muted);
  }

  // ── 拖拽遮罩 ────────────────────────────────────────────────
  &__drop-mask {
    position: absolute;
    inset: 6px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    pointer-events: none;
    background: color-mix(in srgb, var(--color-bg-window), transparent 8%);
    border-radius: 8px;
  }

  // ── 快捷问题 ────────────────────────────────────────────────
  &__quick {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }

  &__quick-item {
    padding: 5px 10px;
    font-size: 12px;
    color: var(--color-primary);
    cursor: pointer;
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
    border: 1px solid color-mix(in srgb, var(--color-primary), transparent 70%);
    border-radius: 999px;
    transition: all 0.2s ease;

    &:hover {
      color: #fff;
      background: var(--color-primary);
    }
  }

  // ── 待发送附件条 ────────────────────────────────────────────
  &__pending {
    flex-shrink: 0;
    padding: 6px 12px;
    background: var(--color-bg-window);
    border-top: 1px solid var(--color-border-light);
  }

  &__pending-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__pending-item {
    position: relative;
    display: flex;
    overflow: hidden;
    background: var(--color-bg-input);
    border-radius: 6px;
  }

  &__pending-thumb {
    display: block;
    width: 56px;
    height: 56px;
    object-fit: cover;
  }

  &__pending-file {
    display: flex;
    gap: 4px;
    align-items: center;
    max-width: 140px;
    padding: 0 8px;
  }

  &__pending-file-name {
    overflow: hidden;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__pending-remove {
    position: absolute;
    top: 2px;
    right: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: #fff;
    cursor: pointer;
    background: rgb(0 0 0 / 50%);
    border: none;
    border-radius: 50%;

    &:hover {
      background: var(--color-danger);
    }
  }

  // ── 输入区（嵌入工具栏 + 图标式发送）────────────────────────
  &__input {
    position: relative;
    flex-shrink: 0;
    padding: 10px 12px 12px;
    background: var(--color-bg-window);
    border-top: 1px solid var(--color-border-light);
  }

  &__compose {
    display: flex;
    flex-direction: column;
    padding: 6px 8px 4px;
    background: var(--color-bg-input);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    transition: border-color 0.2s ease;

    &:focus-within {
      border-color: var(--color-primary);
    }

    :deep(.el-textarea__inner) {
      padding: 2px 4px;
      font-size: 13px;
      resize: none;
      background: transparent;
      border: none;
      box-shadow: none;
    }

    :deep(.el-textarea__inner:focus) {
      box-shadow: none;
    }
  }

  &__compose-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 2px;
  }

  &__compose-tools {
    position: relative;
    display: flex;
    gap: 2px;
    align-items: center;
  }

  &__tool {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary), transparent 92%);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  &__file-input {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
    opacity: 0;
  }

  // 发送图标按钮
  &__send-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: #fff;
    cursor: pointer;
    background: var(--color-primary);
    border: none;
    border-radius: 50%;
    box-shadow: 0 2px 6px color-mix(in srgb, var(--color-primary), transparent 60%);
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      box-shadow: 0 4px 10px color-mix(in srgb, var(--color-primary), transparent 50%);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      cursor: not-allowed;
      background: var(--color-border);
      box-shadow: none;
    }
  }

  // ── 表情选择器（标签页分类 + 最近使用 + 光标插入）──────────────
  &__emoji-wrap {
    position: relative;
  }

  &__emoji-panel {
    position: absolute;
    bottom: calc(100% + 10px);
    left: -4px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    width: 304px;
    overflow: hidden;
    background: var(--color-bg-window);
    border: 1px solid var(--color-border-light);
    border-radius: 12px;
    box-shadow: 0 12px 32px rgb(0 0 0 / 16%);
  }

  // 分类标签页
  &__emoji-tabs {
    display: flex;
    flex-shrink: 0;
    gap: 2px;
    padding: 6px 8px;
    background: var(--color-bg-input);
    border-bottom: 1px solid var(--color-border-light);
  }

  &__emoji-tab {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0;
    font-size: 16px;
    color: var(--color-text-muted);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition: all 0.15s ease;

    &:hover {
      background: color-mix(in srgb, var(--color-primary), transparent 92%);
    }

    &.is-active {
      color: var(--color-primary);
      background: var(--color-bg-window);
      box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
    }
  }

  &__emoji-tab-icon {
    line-height: 1;
  }

  &__emoji-tab-text {
    font-size: 12px;
    font-weight: 500;
  }

  // 表情网格区域
  &__emoji-body {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 2px;
    max-height: 220px;
    padding: 8px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 4px;
    }
  }

  &__emoji-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.12s ease;

    &:hover {
      background: color-mix(in srgb, var(--color-primary), transparent 88%);
      transform: scale(1.15);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__emoji-empty {
    grid-column: 1 / -1;
    padding: 32px 0;
    font-size: 12px;
    color: var(--color-text-muted);
    text-align: center;
  }

  // 表情按钮激活态
  &__tool.is-active {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 90%);
  }
}

// 面板过渡动画
.emoji-panel-enter-active,
.emoji-panel-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.emoji-panel-enter-from,
.emoji-panel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}
</style>
