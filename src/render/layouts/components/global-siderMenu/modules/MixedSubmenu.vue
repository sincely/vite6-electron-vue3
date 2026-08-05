<template>
  <div v-if="parentItem && parentItem.children?.length" class="mixed-submenu">
    <nav class="mixed-submenu-nav">
      <a
        v-for="child in parentItem.children"
        :key="child.id"
        class="mixed-submenu-item"
        :class="{ 'mixed-submenu-item-active': isChildActive(child) }"
        @click="handleClick(child)"
      >
        <span class="mixed-submenu-dot"></span>
        <span class="mixed-submenu-label">{{ child.label }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  parentItem: {
    type: Object,
    default: null
  }
})

const route = useRoute()
const router = useRouter()

const isChildActive = (child) => child.route === route.path

const handleClick = (child) => {
  router.push(child.route).catch(() => {})
}
</script>

<style lang="scss" scoped>
.mixed-submenu {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 180px;
  height: 100%;
  overflow: hidden;
  background-color: var(--menu-bg, var(--sidebar-surface-bg));
  background-image: var(--menu-bg-gradient, none);
  border-right: 1px solid var(--menu-border, var(--color-border));
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
  color: var(--menu-text-secondary, var(--color-text-secondary));
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--menu-text, var(--color-text-primary));
    background: var(--menu-hover-bg, var(--color-bg-hover));
    border-color: var(--menu-border, var(--color-border-light));
  }

  &-active {
    color: var(--menu-active-text, var(--color-primary)) !important;
    background: var(--menu-active-bg, var(--brand-accent-soft));
    border-color: color-mix(
      in srgb,
      var(--menu-active-indicator, var(--color-primary)),
      transparent 40%
    );

    .mixed-submenu-dot {
      background: var(--menu-active-indicator, var(--color-primary));
    }

    &::before {
      position: absolute;
      inset: 8px auto 8px 0;
      width: 3px;
      content: '';
      background: var(--menu-active-indicator, var(--color-primary));
      border-radius: 4px;
    }
  }
}

.mixed-submenu-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--menu-icon, var(--color-border));
  border-radius: 50%;
}

.mixed-submenu-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
