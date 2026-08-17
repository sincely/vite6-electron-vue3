import { defineStore } from 'pinia'
import botAvatar from '@/assets/bar/app.png'
import avatar1 from '@/assets/images/avatar/avatar1.webp'
import avatar2 from '@/assets/images/avatar/avatar2.webp'
import avatar3 from '@/assets/images/avatar/avatar3.webp'
import avatar4 from '@/assets/images/avatar/avatar4.webp'
import avatar5 from '@/assets/images/avatar/avatar5.webp'
import avatar6 from '@/assets/images/avatar/avatar6.webp'

// 聊天窗口（Lightning Bot）状态
// 注意：不做持久化，避免应用重启后抽屉自动弹开

export const BOT_ID = 1
const BOT_NAME = 'Lightning Bot'

// 模拟回复的候选文案（机器人 / 普通联系人）
const BOT_REPLIES = [
  '收到！我来帮你看看，稍等一下～',
  '这是个好问题，你可以在「外观显示」里调整主题、布局和主题色。',
  '我已经记录下来了，还有其他需要帮忙的吗？',
  '可以试试在「常规设置」里开启开机自启，日常使用会方便很多。',
  '没问题，更多功能还在持续迭代中，敬请期待！'
]
const CONTACT_REPLIES = [
  '好的，收到！',
  '嗯嗯，我稍后详细回复你。',
  '没问题，等我一下。',
  '了解了，晚点同步你进展。'
]

let messageSeed = 100
const replyIndexMap = {}
const replyTimers = {}

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// 联系人列表（机器人固定在首位）
// lastTimestamp 与 lastTime 文案对应，用于"按时间排序"
const buildContacts = () => {
  const now = Date.now()
  return [
    {
      id: BOT_ID,
      name: BOT_NAME,
      email: 'bot@lightning.app',
      avatar: botAvatar,
      online: true,
      lastTime: '刚刚',
      lastTimestamp: now,
      unread: 0
    },
    {
      id: 2,
      name: '梅洛迪·梅西',
      email: 'melody@altbox.com',
      avatar: avatar1,
      online: true,
      lastTime: '20小时前',
      lastTimestamp: now - 20 * 60 * 60 * 1000,
      unread: 0
    },
    {
      id: 3,
      name: '马克·史密斯',
      email: 'max@kt.com',
      avatar: avatar2,
      online: true,
      lastTime: '2周前',
      lastTimestamp: now - 14 * 24 * 60 * 60 * 1000,
      unread: 6
    },
    {
      id: 4,
      name: '肖恩·宾',
      email: 'sean@dellito.com',
      avatar: avatar3,
      online: false,
      lastTime: '5小时前',
      lastTimestamp: now - 5 * 60 * 60 * 1000,
      unread: 5
    },
    {
      id: 5,
      name: '爱丽丝·约翰逊',
      email: 'alice@domain.com',
      avatar: avatar4,
      online: true,
      lastTime: '1小时前',
      lastTimestamp: now - 60 * 60 * 1000,
      unread: 2
    },
    {
      id: 6,
      name: '鲍勃·布朗',
      email: 'bob@domain.com',
      avatar: avatar5,
      online: false,
      lastTime: '3天前',
      lastTimestamp: now - 3 * 24 * 60 * 60 * 1000,
      unread: 1
    },
    {
      id: 7,
      name: '查理·戴维斯',
      email: 'charlie@domain.com',
      avatar: avatar6,
      online: true,
      lastTime: '10分钟前',
      lastTimestamp: now - 10 * 60 * 1000,
      unread: 0
    }
  ]
}

// 初始会话记录（自己的消息 sender 留空，渲染时使用当前用户昵称）
const buildMessagesMap = () => ({
  [BOT_ID]: [
    {
      id: 1,
      sender: BOT_NAME,
      content: '你好！我是你的AI助手，有什么我可以帮你的吗？',
      time: '10:00',
      isMe: false
    },
    {
      id: 2,
      sender: '',
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
      sender: '',
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
      sender: '',
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
      sender: '',
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
  ],
  2: [
    {
      id: 11,
      sender: '梅洛迪·梅西',
      content: '设计稿已经更新到 V2 版本了，记得查看哦。',
      time: '09:20',
      isMe: false
    },
    {
      id: 12,
      sender: '',
      content: '好的，我下午看一下。',
      time: '09:24',
      isMe: true
    }
  ],
  3: [
    {
      id: 13,
      sender: '马克·史密斯',
      content: '明天的会议改到 10 点了，别迟到。',
      time: '昨天',
      isMe: false
    }
  ],
  4: [
    {
      id: 14,
      sender: '肖恩·宾',
      content: '部署脚本我放到仓库里了。',
      time: '14:02',
      isMe: false
    },
    {
      id: 15,
      sender: '',
      content: '收到，辛苦！',
      time: '14:05',
      isMe: true
    }
  ],
  5: [
    {
      id: 16,
      sender: '爱丽丝·约翰逊',
      content: '周报模板发我一份呗～',
      time: '11:30',
      isMe: false
    }
  ],
  6: [
    {
      id: 17,
      sender: '鲍勃·布朗',
      content: '周五一起评审新功能原型吗？',
      time: '周二',
      isMe: false
    }
  ],
  7: [
    {
      id: 18,
      sender: '查理·戴维斯',
      content: '仪表盘图表的配色已经按主题调整好了。',
      time: '08:45',
      isMe: false
    }
  ]
})

export const useChatStore = defineStore('chat', {
  state: () => ({
    visible: false, // 聊天抽屉是否可见
    // ── 设置页聊天 ──────────────────────────────────────────────
    selectedContactId: BOT_ID, // 当前选中的联系人
    contacts: buildContacts(), // 联系人列表
    messagesMap: buildMessagesMap(), // 各联系人的会话记录 { [id]: Message[] }
    typingMap: {} // 各联系人的"正在输入"状态 { [id]: boolean }
  }),
  getters: {
    // 当前选中的联系人
    selectedContact(state) {
      return (
        state.contacts.find((c) => c.id === state.selectedContactId) ||
        state.contacts[0]
      )
    },
    // 当前会话的消息列表
    currentMessages(state) {
      return state.messagesMap[state.selectedContactId] || []
    }
  },
  actions: {
    // 切换聊天窗口可见性
    toggleChat(visible) {
      this.visible = visible === undefined ? !this.visible : visible
    },
    // 选择联系人并清空其未读数
    selectContact(id) {
      this.selectedContactId = id
      const contact = this.contacts.find((c) => c.id === id)
      if (contact) contact.unread = 0
    },
    // 生成消息自增 id
    nextMessageId() {
      return ++messageSeed
    },
    // 追加一条消息；非当前联系人的来信累加未读数
    pushMessage(contactId, message) {
      if (!this.messagesMap[contactId]) {
        this.messagesMap[contactId] = []
      }
      this.messagesMap[contactId].push(message)

      const contact = this.contacts.find((c) => c.id === contactId)
      if (contact) {
        contact.lastTime = message.time
        contact.lastTimestamp = Date.now()
        if (!message.isMe && contactId !== this.selectedContactId) {
          contact.unread = (contact.unread || 0) + 1
        }
      }
    },
    // 全部标为已读：清空所有联系人未读数
    markAllRead() {
      this.contacts.forEach((contact) => {
        contact.unread = 0
      })
    },
    // 模拟对方回复：先显示"正在输入"，随后追加回复消息
    scheduleReply(contactId) {
      if (replyTimers[contactId]) return
      const contact = this.contacts.find((c) => c.id === contactId)
      if (!contact) return

      replyTimers[contactId] = setTimeout(() => {
        this.typingMap[contactId] = true

        replyTimers[contactId] = setTimeout(
          () => {
            this.typingMap[contactId] = false
            const replies = contactId === BOT_ID ? BOT_REPLIES : CONTACT_REPLIES
            const index = (replyIndexMap[contactId] =
              ((replyIndexMap[contactId] ?? -1) + 1) % replies.length)
            this.pushMessage(contactId, {
              id: this.nextMessageId(),
              sender: contact.name,
              content: replies[index],
              time: formatTime(),
              isMe: false
            })
            delete replyTimers[contactId]
          },
          1200 + Math.random() * 1000
        )
      }, 400)
    }
  }
})
