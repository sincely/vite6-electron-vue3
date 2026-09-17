import { defineStore } from 'pinia'
import { ref } from 'vue'

// 搜索历史最大条数
const HISTORY_MAX_LENGTH = 10

export const useSearchStore = defineStore(
  'search',
  () => {
    // 搜索历史：{ title, path }[]，最新在前
    const searchHistory = ref([])

    // 新增搜索历史：按 path 去重置顶，超出上限淘汰末尾
    function addSearchHistory(item) {
      const record = { title: item.title, path: item.path }
      const existIndex = searchHistory.value.findIndex((historyItem) => historyItem.path === record.path)

      if (existIndex !== -1) {
        searchHistory.value.splice(existIndex, 1)
      } else if (searchHistory.value.length >= HISTORY_MAX_LENGTH) {
        searchHistory.value.pop()
      }

      searchHistory.value.unshift(record)
    }

    // 删除单条搜索历史
    function removeSearchHistory(index) {
      searchHistory.value.splice(index, 1)
    }

    return {
      searchHistory,
      addSearchHistory,
      removeSearchHistory
    }
  },
  { persist: true }
)
