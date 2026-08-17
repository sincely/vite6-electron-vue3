import { watch, h } from 'vue'
import { useNetwork as useVueUseNetwork } from '@vueuse/core'
import SvgIcon from '@/components/SvgIcon/index.vue'

/**
 * 网络监测 Hook (基于 @vueuse/core)
 * 1监听 online/offline 事件，显示全局通知
 * @returns {Object} { isOnline, type, downlink, rtt, saveData, effectiveType }
 */
export function useNetwork() {
  const { isOnline, type, downlink, rtt, saveData, effectiveType } =
    useVueUseNetwork()

  console.log('isOnline init', isOnline.value)

  // 在 Windows Electron 环境下，navigator.onLine 有时不准确或事件不触发
  // 增加一个轮询检测机制作为兜底
  const checkInterval = setInterval(() => {
    // navigator.onLine 是浏览器原生属性，isOnline 是 VueUse 的响应式引用
    // 如果原生状态变了但 VueUse 没变，手动同步
    if (navigator.onLine !== isOnline.value) {
      console.log('Force sync network status:', navigator.onLine)
      isOnline.value = navigator.onLine
    }
  }, 3000)

  // 组件卸载时清理定时器（需要结合组件生命周期，但 hook 内部无法直接获知）
  // 这里做一个简单的全局挂载清理，或者依赖调用方
  // 由于 useNetwork 通常在 App.vue 全局调用，这里简单挂载到 window 以便调试或清理
  if (window._networkInterval) clearInterval(window._networkInterval)
  window._networkInterval = checkInterval

  // 监听在线状态变化
  watch(isOnline, (online) => {
    if (online) {
      console.log('Network went online')
      ElNotification({
        title: '网络已连接',
        message: '您已恢复在线状态',
        icon: h(SvgIcon, {
          iconClass: 'online',
          width: '25px',
          height: '25px'
        }),
        duration: 3000,
        showClose: false,
        position: 'top-right'
      })
    } else {
      console.log('Network went offline')
      ElNotification({
        title: '网络已断开',
        message: '检测到网络连接丢失，请检查您的网络设置',
        icon: h(SvgIcon, {
          iconClass: 'offline',
          width: '25px',
          height: '25px'
        }),
        duration: 3000,
        showClose: false,
        position: 'top-right'
      })
    }
  })

  return {
    isOnline,
    type,
    downlink,
    rtt,
    saveData,
    effectiveType
  }
}
