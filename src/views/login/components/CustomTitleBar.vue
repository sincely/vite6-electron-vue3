<template>
  <div class="custom-title-bar" style="-webkit-app-region: drag">
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'account' }"
        @click="switchTab('account')"
      >
        账号登录
      </button>
      <button
        :class="{ active: activeTab === 'qrcode' }"
        @click="switchTab('qrcode')"
      >
        扫码登录
      </button>
    </div>
    <div class="window-controls">
      <button class="control-btn" @click="openSettings">
        <SvgIcon icon-class="settings" width="16px" height="16px" />
      </button>
      <button class="control-btn" @click="minimizeWindow">
        <SvgIcon icon-class="minus" width="16px" height="16px" />
      </button>
      <button class="control-btn close-btn" @click="closeWindow">
        <SvgIcon icon-class="close" width="16px" height="16px" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['update:active-tab'])
const activeTab = ref('account')

const switchTab = (tab) => {
  activeTab.value = tab
  emit('update:active-tab', tab)
}

const openSettings = () => {
  // TODO: Implement settings logic
  console.log('Open settings')
}

const minimizeWindow = () => {
  window.ipcRenderer.send('minimize-window')
}

const closeWindow = () => {
  window.ipcRenderer.send('close-window')
}
</script>

<style lang="scss" scoped>
.custom-title-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  padding: 0 10px;
  background-color: transparent;

  // 虚线
  border-bottom: 1px solid var(--color-border);
}

.tabs {
  display: flex;
  gap: 10px;
  -webkit-app-region: no-drag;

  button {
    position: relative;
    padding: 5px 10px;
    font-size: 16px;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: none;
    border: none;

    &.active {
      font-weight: bold;
      color: var(--color-text-primary);

      &::after {
        position: absolute;
        bottom: -5px;
        left: 50%;
        width: 20px;
        height: 3px;
        content: '';
        background-color: var(--color-primary);
        border-radius: 2px;
        transform: translateX(-50%);
      }
    }
  }
}

.window-controls {
  position: absolute;
  right: 10px;
  display: flex;
  gap: 5px;
  -webkit-app-region: no-drag;

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 5px;

    &:hover {
      background-color: var(--color-bg-hover);
    }

    &.close-btn:hover {
      color: white;
      background-color: #e81123;
    }
  }
}
</style>
