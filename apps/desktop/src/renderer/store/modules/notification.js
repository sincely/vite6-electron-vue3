import { defineStore } from 'pinia'

let idCounter = 1

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    /** @type {{ id: number, title: string, body: string, type: string, time: number, read: boolean }[]} */
    list: [],
    panelVisible: false
  }),
  getters: {
    unreadCount: (state) => state.list.filter((n) => !n.read).length,
    hasUnread: (state) => state.list.some((n) => !n.read)
  },
  actions: {
    push({ title = '通知', body = '', type = 'info' } = {}) {
      this.list.unshift({
        id: idCounter++,
        title,
        body,
        type,
        time: Date.now(),
        read: false
      })
      // 最多保留 50 条
      if (this.list.length > 50) this.list = this.list.slice(0, 50)
    },
    markRead(id) {
      const item = this.list.find((n) => n.id === id)
      if (item) item.read = true
    },
    markAllRead() {
      this.list.forEach((n) => (n.read = true))
    },
    remove(id) {
      this.list = this.list.filter((n) => n.id !== id)
    },
    clear() {
      this.list = []
    },
    setPanelVisible(v) {
      this.panelVisible = v
    },
    togglePanel() {
      this.panelVisible = !this.panelVisible
    }
  }
})
