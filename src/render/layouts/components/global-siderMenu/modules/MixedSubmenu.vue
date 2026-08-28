<template>
  <div
    v-if="parentItem && parentItem.children?.length"
    class="mixed-submenu"
    :class="{ 'is-collapsed': MIXED_SUBMENU_COLLAPSIBLE && collapsed }"
  >
    <!-- 裁剪层：折叠过渡期间以固定 180px 菜单整体向左滑出，避免内容被压缩换行 -->
    <div class="mixed-submenu-clip">
      <nav class="mixed-submenu-nav">
        <MixedMenuItem
          v-for="child in parentItem.children"
          :key="child.id"
          :item="child"
          :depth="2"
        />
      </nav>
    </div>
    <!-- 收缩/展开把手：位于子菜单栏右缘，垂直居中 -->
    <button
      v-if="MIXED_SUBMENU_COLLAPSIBLE"
      type="button"
      class="mixed-submenu-toggle"
      :title="collapsed ? '展开子菜单' : '收起子菜单'"
      @click="collapsed = !collapsed"
    >
      <Icon
        :icon="collapsed ? 'lucide:chevrons-right' : 'lucide:chevrons-left'"
        width="14"
        height="14"
      />
    </button>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { findMenuPath } from '@/config/menu'
import MixedMenuItem from './MixedMenuItem.vue'

// ==================== 功能开关 ====================
// top-mixed 混合模式下子菜单栏收缩/展开功能，需要时改为 true 开启
const MIXED_SUBMENU_COLLAPSIBLE = true

// 子菜单栏折叠状态（仅开关开启时可通过右缘把手交互）
const collapsed = ref(false)

const props = defineProps({
  parentItem: {
    type: Object,
    default: null
  }
})

const route = useRoute()

// 子级分组的展开状态（递归节点通过 inject 共享）
const expandedIds = ref([])

const toggleExpand = (id) => {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) {
    expandedIds.value.splice(idx, 1)
  } else {
    expandedIds.value.push(id)
  }
}

provide('mixed-expanded-ids', expandedIds)
provide('mixed-toggle-expand', toggleExpand)

// 路由变化时自动展开当前页面所属的分组链路
watch(
  () => [route.path, props.parentItem],
  ([path]) => {
    if (!props.parentItem) {
      expandedIds.value = []
      return
    }
    const chain = findMenuPath(path)
    expandedIds.value =
      chain[0]?.id === props.parentItem.id
        ? chain.slice(1, -1).map((item) => item.id)
        : []
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.mixed-submenu {
  position: relative;
  flex-shrink: 0;
  width: 180px;
  height: 100%;
  background: var(--sidebar-surface-bg);
  border-right: 1px solid var(--color-border);
  transition:
    width 0.24s cubic-bezier(0.16, 1, 0.3, 1),
    border-right-color 0.24s ease;

  &.is-collapsed {
    width: 0;
    border-right-color: transparent;
  }
}

// 裁剪层：宽度跟随外层过渡，overflow hidden 将菜单整体向左滑出
.mixed-submenu-clip {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

// 收缩/展开把手：骑跨在子菜单栏右边界线上
.mixed-submenu-toggle {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 44px;
  padding: 0;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: var(--glass-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: color 0.2s ease;
  transform: translate(50%, -50%);

  &:hover {
    color: var(--color-primary);
  }
}

.mixed-submenu-header {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);

  .mixed-submenu-header-icon {
    flex-shrink: 0;
    color: var(--color-primary);
  }
}

.mixed-submenu-nav {
  box-sizing: border-box;
  width: 180px;
  height: 100%;
  padding: 8px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 4px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
  }
}
</style>
