<template>
  <a
    class="sidebar-item sidebar-item-child"
    :class="{ 'sidebar-item-active': isActive }"
    :style="
      depth > 2 ? { paddingLeft: `${42 + (depth - 2) * 14}px` } : undefined
    "
    @click="handleClick"
  >
    <Icon
      v-if="item.icon"
      :icon="`lucide:${item.icon}`"
      class="sidebar-child-icon"
      width="14px"
      height="14px"
    />
    <span v-else class="sidebar-child-dot"></span>
    <span class="sidebar-label">{{ item.label }}</span>
    <Icon
      v-if="item.link"
      icon="lucide:arrow-up-right"
      class="sidebar-external-icon"
      width="12px"
      height="12px"
    />
    <span v-if="item.showBadge" class="menu-badge"></span>
    <span v-else-if="item.showTextBadge" class="menu-text-badge">
      {{ item.showTextBadge }}
    </span>
    <SvgIcon
      v-if="item.children?.length"
      icon-class="chevron-right"
      class="sidebar-chevron"
      :class="{ 'sidebar-chevron-open': isExpanded }"
      width="13px"
      height="13px"
    />
  </a>

  <!-- 子级分组：递归渲染更深层级（文件名即组件名，支持模板内自引用） -->
  <div
    v-if="item.children?.length"
    class="sidebar-submenu"
    :class="{ 'sidebar-submenu-open': isExpanded }"
  >
    <div class="sidebar-submenu-inner">
      <SubMenuNode
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { openExternalLink } from '@/utils/openLink'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 2
  }
})

const route = useRoute()
const router = useRouter()

const expandedIds = inject('menu-expanded-ids')
const toggleExpand = inject('menu-toggle-expand')
const isCollapsed = inject('menu-collapsed')

const isExpanded = computed(() => expandedIds.value.includes(props.item.id))

// 与一级菜单一致：仅自身路由命中时高亮，避免子级激活时父分组同时高亮
const isActive = computed(() => props.item.route === route.path)

const handleClick = () => {
  if (props.item.children?.length && !isCollapsed.value) {
    toggleExpand(props.item.id, props.depth)
    return
  }
  if (props.item.link && !props.item.iframe)
    return openExternalLink(props.item.link)
  router.push(props.item.route).catch(() => {})
}
</script>
