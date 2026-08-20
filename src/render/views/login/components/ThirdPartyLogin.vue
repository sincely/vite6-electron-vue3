<template>
  <div class="third-party-login">
    <!-- vben：分隔线 + 「其他登录方式」 -->
    <div class="divider">
      <span class="line"></span>
      <span class="text">其他登录方式</span>
      <span class="line"></span>
    </div>

    <div class="providers">
      <el-tooltip
        v-for="provider in providers"
        :key="provider.name"
        :content="provider.tooltip"
        placement="top"
      >
        <button
          type="button"
          class="provider-btn"
          :aria-label="provider.tooltip"
          @click="handleProvider(provider)"
        >
          <SvgIcon :icon-class="provider.icon" width="22px" height="22px" />
        </button>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

defineOptions({ name: 'ThirdPartyLogin' })

const providers = [
  { name: '微信', icon: 'wechat', tooltip: '微信登录' },
  { name: 'QQ', icon: 'qqchat', tooltip: 'QQ登录' },
  { name: 'Github', icon: 'github', tooltip: 'Github登录' }
]

const handleProvider = (provider) => {
  ElMessage.info(`暂未接入${provider.name}登录`)
}
</script>

<style lang="scss" scoped>
.third-party-login {
  width: 100%;
  margin-top: 20px;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .line {
    width: 35%;
    border-bottom: 1px solid var(--color-border);
  }

  .text {
    font-size: 12px;
    color: var(--color-text-muted);
    text-align: center;
    text-transform: uppercase;
  }
}

.providers {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.provider-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  color: var(--color-text-primary);
  cursor: pointer;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-hover);
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
</style>
