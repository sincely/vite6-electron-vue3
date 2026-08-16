<template>
  <div class="custom-title-bar">
    <div v-if="showTabs" class="tabs">
      <button
        v-for="item in actionTab"
        :key="item.value"
        :class="{ active: activeTab === item.value }"
        @click="switchTab(item.value)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['update:active-tab'])
const activeTab = ref('account')

const showTabs = ref(false)

const switchTab = (tab) => {
  activeTab.value = tab
  emit('update:active-tab', tab)
}

const actionTab = ref([
  {
    label: '账号登录',
    value: 'account',
    active: true
  },
  {
    label: '扫码登录',
    value: 'qrcode',
    active: true
  }
])
</script>

<style lang="scss" scoped>
.custom-title-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  background-color: transparent;
  border-bottom: 1px solid var(--color-border);
}

.tabs {
  display: flex;
  gap: 10px;

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
</style>
