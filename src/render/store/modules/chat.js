import { defineStore } from 'pinia'

// 聊天窗口（Lightning Bot）状态
// 注意：不做持久化，避免应用重启后抽屉自动弹开
export const useChatStore = defineStore('chat', {
  state: () => ({
    visible: false // 聊天抽屉是否可见
  }),
  actions: {
    // 切换聊天窗口可见性
    toggleChat(visible) {
      this.visible = visible === undefined ? !this.visible : visible
    }
  }
})
