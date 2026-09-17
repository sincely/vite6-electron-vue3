// 在线客服（OnlineSupport）状态管理
// 支持全局开关控制浮窗是否显示；可见时，用户可以自行展开/收起聊天面板。

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOnlineSupportStore = defineStore('online-support', () => {
  // 总开关：用户是否启用了在线客服组件
  const enabled = ref(true)
  // 浮窗整体是否可见（受 enabled 控制；enabled=false 时此项强制为 false）
  const visible = ref(false)
  // 聊天面板是否展开（点击浮窗图标切换）
  const panelOpen = ref(false)
  // 未读消息计数（仅用于浮窗角标）
  const unread = ref(0)

  // 切换总开关（开启 = 渲染浮窗；关闭 = 整个组件不渲染）
  function setEnabled(flag) {
    enabled.value = !!flag
    if (!enabled.value) {
      visible.value = false
      panelOpen.value = false
    }
  }

  // 关闭浮窗（开关关闭时调用，或外部主动隐藏）
  function hide() {
    visible.value = false
    panelOpen.value = false
  }

  // 显示浮窗（开关打开时调用）
  function show() {
    visible.value = true
  }

  // 切换聊天面板展开/收起
  function togglePanel(force) {
    if (force === undefined) {
      panelOpen.value = !panelOpen.value
    } else {
      panelOpen.value = !!force
    }
    // 展开面板时清空未读
    if (panelOpen.value) unread.value = 0
  }

  // 新增一条客服消息（用于触发未读提示）
  function addAgentMessage() {
    if (!panelOpen.value) unread.value += 1
  }

  // 清空未读
  function clearUnread() {
    unread.value = 0
  }

  return {
    enabled,
    visible,
    panelOpen,
    unread,
    setEnabled,
    hide,
    show,
    togglePanel,
    addAgentMessage,
    clearUnread
  }
})
