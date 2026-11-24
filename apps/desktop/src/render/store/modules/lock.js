import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLockStore = defineStore(
  'lock',
  () => {
    const isLock = ref(false) // 是否处于锁屏状态
    const lockPassword = ref('') // 锁屏密码（HMAC-SHA256 哈希值，带 hmac-sha256: 前缀）
    const dialogVisible = ref(false) // 设置锁屏密码弹窗是否显示（不持久化）

    function setLockStatus(status) {
      isLock.value = status
    }

    function setLockPassword(password) {
      lockPassword.value = password
    }

    function openLockDialog() {
      dialogVisible.value = true
    }

    function closeLockDialog() {
      dialogVisible.value = false
    }

    // 解锁/退出登录时重置锁屏状态
    function resetLock() {
      isLock.value = false
      lockPassword.value = ''
      dialogVisible.value = false
    }

    return {
      isLock,
      lockPassword,
      dialogVisible,
      setLockStatus,
      setLockPassword,
      openLockDialog,
      closeLockDialog,
      resetLock
    }
  },
  {
    persist: {
      pick: ['isLock', 'lockPassword']
    }
  }
)
