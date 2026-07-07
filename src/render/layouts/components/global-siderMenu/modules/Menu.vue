<template>
  <nav class="sidebar-nav">
    <div v-for="item in mainItems" :key="item.id">
      <a
        class="sidebar-item"
        :class="{ 'sidebar-item-active': isParentActive(item) }"
        :title="appStore.sidebarCollapsed ? item.label : ''"
        @click="handleNav(item)"
      >
        <div class="sidebar-icon-wrap">
          <SvgIcon
            :icon-class="item.icon"
            class="sidebar-icon"
            width="18px"
            height="18px"
          />
        </div>
        <span class="sidebar-label">{{ item.label }}</span>
        <SvgIcon
          v-if="item.children?.length && !appStore.sidebarCollapsed"
          icon-class="chevron-right"
          class="sidebar-chevron"
          :class="{ 'sidebar-chevron-open': isExpanded(item.id) }"
          width="13px"
          height="13px"
        />
      </a>

      <div
        v-if="item.children?.length"
        class="sidebar-submenu"
        :class="{
          'sidebar-submenu-open':
            !appStore.sidebarCollapsed && isExpanded(item.id)
        }"
      >
        <div class="sidebar-submenu-inner">
          <a
            v-for="child in item.children"
            :key="child.id"
            class="sidebar-item sidebar-item-child"
            :class="{ 'sidebar-item-active': isChildActive(child) }"
            @click="handleClick(child)"
          >
            <span class="sidebar-child-dot"></span>
            <span class="sidebar-label">{{ child.label }}</span>
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { menuItems } from '@/config/menu'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const mainItems = computed(() => menuItems.filter((item) => !item.footer))
const expandedIds = ref([])

const isExpanded = (id) => expandedIds.value.includes(id)

const toggleExpand = (id) => {
  const idx = expandedIds.value.indexOf(id)
  if (idx >= 0) {
    expandedIds.value = []
  } else {
    expandedIds.value = [id]
  }
}

const isParentActive = (item) => {
  const selfMatch = item.route === route.path
  const childMatch = item.children?.some((c) => c.route === route.path) ?? false
  return appStore.sidebarCollapsed ? selfMatch || childMatch : selfMatch
}

const isChildActive = (child) => child.route === route.path

const handleClick = (child) => {
  if (child.children?.length && !appStore.sidebarCollapsed) {
    toggleExpand(child.id)
  } else {
    router.push(child.route).catch(() => {})
  }
}

watch(
  () => route.path,
  (path) => {
    for (const item of mainItems.value) {
      if (item.children?.some((c) => c.route === path)) {
        expandedIds.value = [item.id]
        return
      }
    }

    expandedIds.value = []
  },
  { immediate: true }
)

const handleNav = (item) => {
  if (item.children?.length && !appStore.sidebarCollapsed) {
    toggleExpand(item.id)
  } else {
    router.push(item.route).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
.sidebar-nav {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: 8px;
  overflow: hidden auto;

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

.sidebar-item {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  height: 42px;
  padding: 0 12px;
  margin-bottom: 4px;
  color: var(--color-text-secondary);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
    border-color: var(--color-border-light);

    .sidebar-icon-wrap {
      background: var(--brand-accent-soft);
    }

    .sidebar-icon {
      color: var(--brand-accent);
    }
  }

  &-active {
    font-weight: 600;
    color: var(--color-primary) !important;
    background: var(--brand-accent-soft);
    border-color: color-mix(in srgb, var(--color-primary), transparent 40%);

    // .sidebar-icon-wrap {
    //   background: color-mix(in srgb, var(--color-primary), transparent 12%);
    //   box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-primary), transparent 60%);
    // }

    .sidebar-icon {
      color: var(--color-primary);
    }

    .sidebar-child-dot {
      background: var(--color-primary);
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

  &-child {
    height: 36px;
    padding-left: 42px;
    margin-bottom: 2px;
    font-size: 13px;
    background: transparent;
    border-color: transparent;
    border-radius: var(--radius-sm);
    box-shadow: none;

    &:hover {
      background: var(--color-bg-hover);
    }

    &::before {
      display: none;
    }
  }
}

.sidebar-icon {
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.sidebar-icon-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--color-bg-input);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.sidebar-label {
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s;
}

.sidebar-child-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 2px;
  background: var(--color-border);
  border-radius: 50%;
}

.sidebar-chevron {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--color-text-muted);
  transition: transform 0.2s;

  &-open {
    transform: rotate(90deg);
  }
}

.sidebar-submenu {
  display: grid;
  grid-template-rows: 0fr;
  margin: 0 4px;
  overflow: hidden;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition:
    grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    margin 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.sidebar-submenu-inner {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.sidebar-submenu-open {
  position: relative;
  grid-template-rows: 1fr;
  padding: 4px;
  margin: -2px 4px 4px;
  background: var(--color-bg-content);
  border-color: var(--color-border-light);

  .sidebar-submenu-inner {
    opacity: 1;
    transition-delay: 0.08s;
  }

  &::before {
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 12px;
    width: 1px;
    content: '';
    background: color-mix(in srgb, var(--color-primary), transparent 40%);
    border-radius: 1px;
    opacity: 0;
    animation: fadeIn 0.25s ease 0.08s forwards;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
