import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

let idCounter = 1

export const useNotificationStore = defineStore('notification', () => {
  /** @type {import('vue').Ref<{ id: number, title: string, body: string, type: string, time: number, read: boolean }[]>} */
  const list = ref([])
  const panelVisible = ref(false)

  const unreadCount = computed(() => list.value.filter((n) => !n.read).length)
  const hasUnread = computed(() => list.value.some((n) => !n.read))

  function push({ title = '通知', body = '', type = 'info' } = {}) {
    list.value.unshift({
      id: idCounter++,
      title,
      body,
      type,
      time: Date.now(),
      read: false
    })
    // 最多保留 50 条
    if (list.value.length > 50) list.value = list.value.slice(0, 50)
  }

  function markRead(id) {
    const item = list.value.find((n) => n.id === id)
    if (item) item.read = true
  }

  function markAllRead() {
    list.value.forEach((n) => (n.read = true))
  }

  function remove(id) {
    list.value = list.value.filter((n) => n.id !== id)
  }

  function clear() {
    list.value = []
  }

  function setPanelVisible(v) {
    panelVisible.value = v
  }

  function togglePanel() {
    panelVisible.value = !panelVisible.value
  }

  return {
    list,
    panelVisible,
    unreadCount,
    hasUnread,
    push,
    markRead,
    markAllRead,
    remove,
    clear,
    setPanelVisible,
    togglePanel
  }
})
