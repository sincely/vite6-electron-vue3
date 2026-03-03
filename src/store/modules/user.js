import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  // 需要通过函数的方式定义state，
  state: () => {
    return {
      name: '',
      token: null
    }
  },
  persist: true // 看这里，一键开启持久化
})
