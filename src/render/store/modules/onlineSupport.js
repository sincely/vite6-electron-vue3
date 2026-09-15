// 在线客服（OnlineSupport）状态管理
// 支持全局开关控制浮窗是否显示；可见时，用户可以自行展开/收起聊天面板。

import { defineStore } from 'pinia'

export const useOnlineSupportStore = defineStore('online-support', {
  state: () => ({
    // 总开关：用户是否启用了在线客服组件
    enabled: true,
    // 浮窗整体是否可见（受 enabled 控制；enabled=false 时此项强制为 false）
    visible: false,
    // 聊天面板是否展开（点击浮窗图标切换）
    panelOpen: false,
    // 未读消息计数（仅用于浮窗角标）
    unread: 0
  }),
  actions: {
    // 切换总开关（开启 = 渲染浮窗；关闭 = 整个组件不渲染）
    setEnabled(flag) {
      this.enabled = !!flag
      if (!this.enabled) {
        this.visible = false
        this.panelOpen = false
      }
    },
    // 关闭浮窗（开关关闭时调用，或外部主动隐藏）
    hide() {
      this.visible = false
      this.panelOpen = false
    },
    // 显示浮窗（开关打开时调用）
    show() {
      this.visible = true
    },
    // 切换聊天面板展开/收起
    togglePanel(force) {
      if (force === undefined) {
        this.panelOpen = !this.panelOpen
      } else {
        this.panelOpen = !!force
      }
      // 展开面板时清空未读
      if (this.panelOpen) this.unread = 0
    },
    // 新增一条客服消息（用于触发未读提示）
    addAgentMessage() {
      if (!this.panelOpen) this.unread += 1
    },
    // 清空未读
    clearUnread() {
      this.unread = 0
    }
  }
})
