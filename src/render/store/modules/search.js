import { defineStore } from 'pinia'

// 搜索历史最大条数
const HISTORY_MAX_LENGTH = 10

export const useSearchStore = defineStore('search', {
  state: () => {
    return {
      // 搜索历史：{ title, path }[]，最新在前
      searchHistory: []
    }
  },
  actions: {
    // 新增搜索历史：按 path 去重置顶，超出上限淘汰末尾
    addSearchHistory(item) {
      const record = { title: item.title, path: item.path }
      const existIndex = this.searchHistory.findIndex(
        (historyItem) => historyItem.path === record.path
      )

      if (existIndex !== -1) {
        this.searchHistory.splice(existIndex, 1)
      } else if (this.searchHistory.length >= HISTORY_MAX_LENGTH) {
        this.searchHistory.pop()
      }

      this.searchHistory.unshift(record)
    },
    // 删除单条搜索历史
    removeSearchHistory(index) {
      this.searchHistory.splice(index, 1)
    }
  },
  persist: true
})
