<template>
  <a
    class="mixed-submenu-item"
    :class="{ 'mixed-submenu-item-active': isActive }"
    :style="
      depth > 2 ? { paddingLeft: `${12 + (depth - 2) * 12}px` } : undefined
    "
    @click="handleClick"
  >
    <Icon
      v-if="item.icon"
      :icon="`lucide:${item.icon}`"
      class="mixed-submenu-icon"
      width="14px"
      height="14px"
    />
    <span v-else class="mixed-submenu-dot"></span>
    <span class="mixed-submenu-label">{{ item.label }}</span>
    <Icon
      v-if="item.link"
      icon="lucide:arrow-up-right"
      class="mixed-submenu-external-icon"
      width="12px"
      height="12px"
    />
    <span v-if="item.showBadge" class="menu-badge"></span>
    <span v-else-if="item.showTextBadge" class="menu-text-badge">
      {{ item.showTextBadge }}
    </span>
    <Icon
      v-if="item.children?.length"
      icon="lucide:chevron-right"
      class="mixed-submenu-chevron"
      :class="{ 'mixed-submenu-chevron-open': isExpanded }"
      width="12px"
      height="12px"
    />
  </a>

  <!-- 子级分组：递归渲染更深层级（文件名即组件名，支持模板内自引用） -->
  <div
    v-if="item.children?.length"
    class="mixed-submenu-group"
    :class="{ 'mixed-submenu-group-open': isExpanded }"
  >
    <div class="mixed-submenu-group-inner">
      <MixedMenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>

<script setup>
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

const expandedIds = inject('mixed-expanded-ids')
const toggleExpand = inject('mixed-toggle-expand')

const isExpanded = computed(() => expandedIds.value.includes(props.item.id))

// 与一级菜单一致：仅自身路由命中时高亮，避免子级激活时父分组同时高亮
const isActive = computed(() => props.item.route === route.path)

const handleClick = () => {
  if (props.item.children?.length) {
    toggleExpand(props.item.id)
    return
  }
  if (props.item.link && !props.item.iframe)
    return openExternalLink(props.item.link)
  router.push(props.item.route).catch(() => {})
}
</script>

<style lang="scss" scoped>
// 递归节点均为同一组件，scoped 样式对所有层级生效
.mixed-submenu-item {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 38px;
  padding: 0 12px;
  margin-bottom: 2px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
    border-color: var(--color-border-light);

    .mixed-submenu-dot {
      background: var(--color-primary);
    }

    .mixed-submenu-icon {
      color: var(--color-primary);
    }
  }

  &-active {
    color: var(--color-primary) !important;
    background: var(--brand-accent-soft);
    border-color: color-mix(in srgb, var(--color-primary), transparent 40%);

    .mixed-submenu-dot {
      background: var(--color-primary);
    }

    .mixed-submenu-icon {
      color: var(--color-primary);
    }

    &::before {
      position: absolute;
      inset: 8px auto 8px 0;
      width: 3px;
      content: '';
      background: var(--color-primary);
      border-radius: 4px;
    }
  }
}

.mixed-submenu-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--color-border);
  border-radius: 50%;
}

.mixed-submenu-icon {
  flex-shrink: 0;
  color: var(--color-menu-icon);
  transition: color 0.2s ease;
}

.mixed-submenu-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mixed-submenu-chevron {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--color-text-muted);
  transition: transform 0.2s ease;

  &-open {
    transform: rotate(90deg);
  }
}

// 外部链接标识图标
.mixed-submenu-external-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

// 子级分组展开容器（grid-rows 过渡）
.mixed-submenu-group {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.mixed-submenu-group-inner {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.mixed-submenu-group-open {
  grid-template-rows: 1fr;

  .mixed-submenu-group-inner {
    opacity: 1;
    transition-delay: 0.05s;
  }
}
</style>
