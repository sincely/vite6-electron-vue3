import { defineStore } from 'pinia'

export const useLockStore = defineStore('lock', {
  state: () => ({
    isLock: false, // 是否处于锁屏状态
    lockPassword: '', // 锁屏密码（HMAC-SHA256 哈希值，带 hmac-sha256: 前缀）
    dialogVisible: false // 设置锁屏密码弹窗是否显示（不持久化）
  }),
  actions: {
    setLockStatus(status) {
      this.isLock = status
    },
    setLockPassword(password) {
      this.lockPassword = password
    },
    openLockDialog() {
      this.dialogVisible = true
    },
    closeLockDialog() {
      this.dialogVisible = false
    },
    // 解锁/退出登录时重置锁屏状态
    resetLock() {
      this.isLock = false
      this.lockPassword = ''
      this.dialogVisible = false
    }
  },
  persist: {
    paths: ['isLock', 'lockPassword']
  }
})
