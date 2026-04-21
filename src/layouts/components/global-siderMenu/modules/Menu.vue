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
            @click="router.push(child.route)"
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
  if (idx >= 0) expandedIds.value.splice(idx, 1)
  else expandedIds.value.push(id)
}

const isParentActive = (item) => {
  const selfMatch = item.route === route.path
  const childMatch = item.children?.some((c) => c.route === route.path) ?? false
  return appStore.sidebarCollapsed ? selfMatch || childMatch : selfMatch
}

const isChildActive = (child) => child.route === route.path

watch(
  () => route.path,
  (path) => {
    for (const item of mainItems.value) {
      if (item.children?.some((c) => c.route === path)) {
        if (!expandedIds.value.includes(item.id)) {
          expandedIds.value.push(item.id)
        }
      }
    }
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
  padding: 10px 8px;
  overflow: hidden auto;
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black 16px,
    black calc(100% - 16px),
    transparent 100%
  );

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
  gap: 11px;
  align-items: center;
  height: 46px;
  padding: 0 14px;
  margin-bottom: 7px;
  color: var(--color-text-secondary);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--color-bg-card), transparent 38%) 0%,
    color-mix(in srgb, var(--color-bg-sidebar), transparent 52%) 100%
  );
  border: 1px solid
    color-mix(in srgb, var(--glass-surface-border), transparent 52%);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 6%),
    0 8px 16px -14px rgb(2 6 23 / 78%);
  transition: all 0.24s ease;

  &:hover {
    color: var(--color-text-primary);
    background: color-mix(in srgb, var(--color-bg-hover), transparent 25%);
    border-color: color-mix(in srgb, var(--brand-accent), transparent 72%);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 8%),
      0 10px 18px -14px color-mix(in srgb, var(--brand-accent), transparent 54%);
    transform: translate3d(2px, -1px, 0);

    .sidebar-icon-wrap {
      background: color-mix(in srgb, var(--brand-accent), transparent 88%);
      border-color: color-mix(in srgb, var(--brand-accent), transparent 76%);
    }

    .sidebar-icon {
      color: var(--brand-accent);
    }
  }

  &-active {
    font-weight: 600;
    color: var(--color-primary) !important;
    background: linear-gradient(
      100deg,
      color-mix(in srgb, var(--color-primary), transparent 86%) 0%,
      color-mix(in srgb, var(--brand-accent-alt), transparent 90%) 100%
    );
    border-color: color-mix(in srgb, var(--color-primary), transparent 66%);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 12%),
      0 0 0 1px color-mix(in srgb, var(--color-primary), transparent 82%),
      0 8px 20px -12px color-mix(in srgb, var(--color-primary), transparent 38%);

    .sidebar-icon-wrap {
      background: color-mix(in srgb, var(--color-primary), transparent 76%);
      border-color: color-mix(in srgb, var(--color-primary), transparent 66%);
      box-shadow: 0 0 12px -2px
        color-mix(in srgb, var(--color-primary), transparent 46%);
    }

    .sidebar-icon {
      color: var(--color-primary);
    }

    .sidebar-child-dot {
      background: var(--color-primary);
      box-shadow:
        0 0 0 3px color-mix(in srgb, var(--color-primary), transparent 82%),
        0 0 8px color-mix(in srgb, var(--color-primary), transparent 52%);
    }

    &::before {
      position: absolute;
      inset: 9px auto 9px 4px;
      width: 3px;
      content: '';
      background: linear-gradient(
        180deg,
        var(--color-primary) 0%,
        var(--brand-accent-alt) 100%
      );
      border-radius: 4px;
      box-shadow: 0 0 8px
        color-mix(in srgb, var(--color-primary), transparent 30%);
    }
  }

  &-child {
    height: 38px;
    padding-left: 46px;
    margin-bottom: 2px;
    font-size: 13px;
    background: transparent;
    border-color: transparent;
    border-radius: 12px;
    box-shadow: none;
    opacity: 0.96;

    &:hover {
      background: color-mix(in srgb, var(--color-bg-hover), transparent 22%);
      transform: translate3d(0, 0, 0);
    }

    &::before {
      display: none;
    }
  }
}

.sidebar-icon {
  color: var(--color-text-muted);
  transition: color 0.22s;
}

.sidebar-icon-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: color-mix(in srgb, var(--color-bg-input), transparent 25%);
  border: 1px solid
    color-mix(in srgb, var(--glass-surface-border), transparent 30%);
  border-radius: 10px;
  transition: all 0.22s ease;
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
  background: color-mix(in srgb, var(--brand-accent), transparent 15%);
  border-radius: 50%;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-accent), transparent 90%);
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
  margin: 0 6px;
  overflow: hidden;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  transition:
    grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    margin 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.35s ease,
    border-color 0.35s ease;
}

.sidebar-submenu-inner {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-submenu-open {
  position: relative;
  grid-template-rows: 1fr;
  padding: 4px;
  margin: -2px 6px 6px;
  background: color-mix(in srgb, var(--glass-surface), transparent 18%);
  border-color: color-mix(
    in srgb,
    var(--glass-surface-border),
    transparent 36%
  );

  .sidebar-submenu-inner {
    opacity: 1;
    transition-delay: 0.1s;
  }

  &::before {
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 14px;
    width: 1px;
    content: '';
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--brand-accent), transparent 40%) 0%,
      transparent 100%
    );
    border-radius: 1px;
    opacity: 0;
    animation: fadeIn 0.3s ease 0.1s forwards;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
