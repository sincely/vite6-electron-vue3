<template>
  <div v-if="parentItem && parentItem.children?.length" class="mixed-submenu">
    <nav class="mixed-submenu-nav">
      <MixedMenuItem
        v-for="child in parentItem.children"
        :key="child.id"
        :item="child"
        :depth="2"
      />
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { findMenuPath } from '@/config/menu'
import MixedMenuItem from './MixedMenuItem.vue'

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
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 180px;
  height: 100%;
  overflow: hidden;
  background: var(--sidebar-surface-bg);
  border-right: 1px solid var(--color-border);
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
  flex: 1;
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
