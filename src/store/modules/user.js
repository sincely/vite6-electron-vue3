import { defineStore } from 'pinia'
export const useUserStore = defineStore({
  // id必须唯一，不可重复
  id: 'user',
  // 需要通过函数的方式定义state，
  state: () => {
    return {
      count: 1,
      name: '成舟'
    }
  },
  // getters
  getters: {
    nickName(state) {
      return state.name + '测试'
    }
  }
})
