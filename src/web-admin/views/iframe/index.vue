<!-- 内嵌网页视图：在内容区以 iframe 展示 meta.link 指向的外部页面。
     多个内嵌路由共用本组件，经 route.js 的 asIframeComponent 生成与路由同名的
     组件后注册，保证 keep-alive 能按路由名独立缓存各标签页 -->
<template>
  <div class="iframe-view">
    <div class="iframe-toolbar">
      <Icon
        v-if="route.meta.icon"
        class="iframe-toolbar-icon"
        :icon="`lucide:${route.meta.icon}`"
        :width="18"
        :height="18"
      />
      <div class="iframe-toolbar-info">
        <span class="iframe-toolbar-title">{{ route.meta.title }}</span>
        <span class="iframe-toolbar-url">{{ src }}</span>
      </div>
      <IconButton
        icon="lucide:rotate-cw"
        :icon-size="16"
        title="刷新"
        @click="reload"
      />
      <IconButton
        icon="lucide:square-arrow-out-up-right"
        :icon-size="16"
        title="在系统浏览器打开"
        @click="openExternalLink(src)"
      />
    </div>
    <div class="iframe-body">
      <div v-if="loading" class="iframe-loading">
        <Icon
          class="is-spinning"
          icon="lucide:loader-circle"
          :width="26"
          :height="26"
        />
        <span>页面加载中…</span>
      </div>
      <iframe
        v-if="src"
        :key="frameKey"
        :src="src"
        class="iframe-frame"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        @load="loading = false"
      />
      <div v-else class="iframe-empty">未配置内嵌地址（meta.link）</div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { openExternalLink } from '@/utils/openLink'

defineOptions({ name: 'IframeView' })

const route = useRoute()

const src = computed(() => route.meta.link || '')

const loading = ref(true)
// 通过变更 key 重挂 iframe 实现刷新
const frameKey = ref(0)

const reload = () => {
  loading.value = true
  frameKey.value += 1
}
</script>

<style lang="scss" scoped>
.iframe-view {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.iframe-toolbar {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
  align-items: center;
  height: 46px;
  padding: 0 12px;
  border-bottom: 1px solid var(--color-border);
}

.iframe-toolbar-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.iframe-toolbar-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.iframe-toolbar-title {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.iframe-toolbar-url {
  overflow: hidden;
  font-size: 12px;
  color: var(--color-text-tertiary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.iframe-body {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}

.iframe-frame {
  flex: 1;
  width: 100%;
  border: 0;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
}

.is-spinning {
  color: var(--color-primary, #2563eb);
  animation: iframe-spin 1s linear infinite;
}

.iframe-empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

@keyframes iframe-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
