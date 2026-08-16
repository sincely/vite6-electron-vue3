<!-- 顶部快速入口：九宫格按钮 + 悬停下拉面板（参照 art-design-pro 的 ArtFastEnter） -->
<template>
  <el-popover
    ref="popoverRef"
    :width="700"
    :offset="0"
    :show-arrow="false"
    trigger="hover"
    placement="bottom-start"
    popper-class="fast-enter-popover"
  >
    <template #reference>
      <button class="fast-enter-trigger" title="快速入口" type="button">
        <Icon icon="ri:function-line" width="18" height="18" />
      </button>
    </template>

    <div class="fast-enter">
      <!-- 应用九宫格 -->
      <div class="fast-enter__apps">
        <div
          v-for="app in enabledApplications"
          :key="app.name"
          class="fast-enter__app"
          @click="handleNavigate(app)"
        >
          <div class="fast-enter__app-icon" :style="{ color: app.iconColor }">
            <Icon :icon="app.icon" width="22" height="22" />
          </div>
          <div class="fast-enter__app-meta">
            <h3>{{ app.name }}</h3>
            <p>{{ app.description }}</p>
          </div>
        </div>
      </div>

      <!-- 快速链接 -->
      <div class="fast-enter__links">
        <h3>快速链接</h3>
        <ul>
          <li
            v-for="link in enabledQuickLinks"
            :key="link.name"
            @click="handleNavigate(link)"
          >
            {{ link.name }}
          </li>
        </ul>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useChatStore } from '@/store/modules/chat'
import { useFastEnter } from '@/hooks/useFastEnter'

defineOptions({ name: 'FastEnter' })

const router = useRouter()
const chatStore = useChatStore()
const popoverRef = ref(null)

const { enabledApplications, enabledQuickLinks } = useFastEnter()

// 统一跳转：内置动作 > 外链 > 内部路由，跳转后收起面板
const handleNavigate = (item) => {
  if (item.action === 'openChat') {
    chatStore.toggleChat(true)
  } else if (item.link) {
    window.open(item.link, '_blank', 'noopener,noreferrer')
  } else if (item.path) {
    router.push(item.path).catch(() => {})
  } else {
    console.warn('快速入口配置无效：缺少 path / link / action', item)
  }
  popoverRef.value?.hide?.()
}
</script>

<style lang="scss" scoped>
.fast-enter-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-left: 2px;
  color: var(--color-text-primary);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-app-region: no-drag;

  &:hover {
    background-color: var(--color-bg-hover);
    border-color: var(--color-border-light);
  }

  &:active {
    background-color: var(--color-bg-active);
    transform: scale(0.94);
  }
}

.fast-enter {
  display: flex;
  gap: 24px;
}

.fast-enter__apps {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  align-content: start;
}

.fast-enter__app {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--color-bg-hover);

    .fast-enter__app-icon {
      background: transparent;
    }
  }
}

.fast-enter__app-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--color-bg-input);
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
}

.fast-enter__app-meta {
  min-width: 0;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  p {
    margin: 4px 0 0;
    overflow: hidden;
    font-size: 12px;
    color: var(--color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.fast-enter__links {
  flex-shrink: 0;
  width: 180px;
  padding-left: 24px;
  border-left: 1px solid var(--color-border);

  h3 {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    padding: 8px 0;
    font-size: 14px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>

<!-- popper  teleport 到 body，皮肤样式需非 scoped -->
<style lang="scss">
.fast-enter-popover.el-popover {
  padding: 20px;
  background: var(--glass-surface);

  // 暗色下 glass-surface 半透明，面板面积大需毛玻璃保证可读性
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  -webkit-app-region: no-drag;
}
</style>
