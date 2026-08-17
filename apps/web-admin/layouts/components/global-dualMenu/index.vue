<template>
  <div class="dual-menu">
    <!-- 第一列：一级菜单窄栏 -->
    <div class="dual-menu-rail" :class="{ 'show-text': showText }">
      <GlobalLogo />

      <nav class="dual-menu-nav">
        <a
          v-for="item in mainItems"
          :key="item.id"
          class="dual-menu-item"
          :class="{ 'dual-menu-item-active': isActive(item) }"
          :title="showText ? '' : item.label"
          @click="handleNav(item)"
        >
          <span class="dual-menu-icon-wrap">
            <Icon
              v-if="item.icon"
              :icon="`lucide:${item.icon}`"
              class="dual-menu-icon"
              width="20px"
              height="20px"
            />
            <span
              v-if="item.showBadge"
              class="menu-badge menu-badge-icon"
            ></span>
          </span>
          <span v-if="showText" class="dual-menu-name">{{ item.label }}</span>
        </a>
      </nav>

      <!-- 图标 / 文字显示切换 -->
      <div
        class="dual-menu-switch"
        :title="showText ? '隐藏菜单文字' : '显示菜单文字'"
        @click="appStore.setDualMenuShowText(!showText)"
      >
        <Icon icon="ri:arrow-left-right-fill" width="16px" height="16px" />
      </div>
    </div>

    <!-- 第二列：当前一级菜单的子菜单 -->
    <div class="dual-menu-column">
      <div class="dual-menu-column-header">
        <span class="dual-menu-column-title">
          {{ activeParent?.label || 'Lightning' }}
        </span>
      </div>
      <div class="dual-menu-column-body">
        <MixedSubmenu :parent-item="activeParent" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useAppStore } from '@/store/modules/app'
import { visibleMenuItems, findTopLevelParent, firstLeaf } from '@/config/menu'
import { openExternalLink } from '@/utils/openLink'
import GlobalLogo from '../global-logo/index.vue'
import MixedSubmenu from '../global-siderMenu/modules/MixedSubmenu.vue'

const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const mainItems = computed(() =>
  visibleMenuItems.value.filter((item) => !item.footer)
)
const showText = computed(() => appStore.dualMenuShowText)

// 当前路由对应的一级菜单项（决定第一列激活态与第二列内容）
const activeParent = computed(() => findTopLevelParent(route.path))

const isActive = (item) => activeParent.value?.id === item.id

// 点击一级菜单：导航到其第一个叶子页面（无子项则导航到自身；
// 外链唤起系统浏览器，声明 iframe 的内嵌页走应用内路由跳转）
const handleNav = (item) => {
  const leaf = firstLeaf(item)
  if (leaf?.link && !leaf?.iframe) return openExternalLink(leaf.link)
  router.push(leaf?.route || item.route).catch(() => {})
}
</script>

<style lang="scss" scoped>
$transition: 0.3s cubic-bezier(0.22, 0.7, 0.2, 1);

.dual-menu {
  position: relative;
  z-index: 3;
  display: flex;
  height: 100%;
  user-select: none;
}

// 第一列：一级菜单窄栏
.dual-menu-rail {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 64px;
  height: 100%;
  overflow: hidden;
  background: var(--sidebar-surface-bg);
  border-right: 1px solid var(--color-border);
  transition: width $transition;

  &.show-text {
    width: 80px;
  }
}

.dual-menu-nav {
  flex: 1;
  padding: 4px 0;
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

.dual-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 46px;
  margin: 8px;
  overflow: hidden;
  color: var(--color-text-secondary);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  &-active {
    font-weight: 600;
    color: var(--color-primary);
    background: var(--brand-accent-soft);
  }
}

.show-text .dual-menu-item {
  height: 60px;
}

.dual-menu-icon-wrap {
  position: relative; // 红点（.menu-badge-icon）的定位基准
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dual-menu-icon {
  display: block;
  margin: 0 auto;
}

.dual-menu-name {
  display: block;
  max-width: 100%;
  margin-top: 2px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dual-menu-switch {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin: 4px auto;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }
}

// 第二列：子菜单列
.dual-menu-column {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 180px;
  height: 100%;
  overflow: hidden;
  background: var(--sidebar-surface-bg);
  border-right: 1px solid var(--color-border);
}

.dual-menu-column-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 8px;
  overflow: hidden;
}

.dual-menu-column-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.dual-menu-column-body {
  flex: 1;
  min-height: 0;
}
</style>
