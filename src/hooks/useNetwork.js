import { ref, onMounted, onUnmounted, h } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
/**
 * 网络监测 Hook
 * 1. 监听 online/offline 事件，显示全局通知
 * 2. 监听 navigator.connection 变化，获取网络质量信息
 * @returns {Object} { isOnline, connection }
 */
export function useNetwork() {
  const isOnline = ref(navigator.onLine)
  const connection = ref({
    type: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    effectiveType: 'unknown'
  })

  // 更新连接信息
  const updateConnectionInfo = () => {
    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection
    if (conn) {
      connection.value = {
        type: conn.type || 'unknown',
        downlink: conn.downlink || 0,
        rtt: conn.rtt || 0,
        saveData: conn.saveData || false,
        effectiveType: conn.effectiveType || 'unknown'
      }
    }
  }

  // 网络恢复处理
  const handleOnline = () => {
    console.log('Network went online')
    isOnline.value = true
    updateConnectionInfo()
    ElNotification({
      title: '网络已连接',
      message: '您已恢复在线状态',
      // type: 'success',
      icon: h(SvgIcon, {
        iconClass: 'online',
        width: '25px',
        height: '25px'
      }),
      duration: 3000,
      showClose: false,
      position: 'top-right'
    })
  }

  // 网络断开处理
  const handleOffline = () => {
    console.log('Network went offline')
    isOnline.value = false
    updateConnectionInfo()
    ElNotification({
      title: '网络已断开',
      message: '检测到网络连接丢失，请检查您的网络设置',
      // type: 'error',
      icon: h(SvgIcon, {
        iconClass: 'offline',
        width: '25px',
        height: '25px'
      }),
      duration: 3000, // 不自动关闭
      showClose: false,
      position: 'top-right'
    })
  }

  // 网络质量变化处理
  const handleConnectionChange = () => {
    updateConnectionInfo()
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection
    if (conn) {
      conn.addEventListener('change', handleConnectionChange)
      // 初始化连接信息
      updateConnectionInfo()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)

    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection
    if (conn) {
      conn.removeEventListener('change', handleConnectionChange)
    }
  })

  console.log(isOnline.value)
  console.log(connection.value)

  return {
    isOnline,
    connection
  }
}
