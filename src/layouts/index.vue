<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="layout-sidebar">
      <GlobalSider />
    </aside>

    <!-- 右侧主区域 -->
    <div class="layout-main">
      <!-- 标题栏 / 窗口控制 -->
      <GlobalHeader>
        <template #center>
          <GlobalSearch />
        </template>
      </GlobalHeader>

      <!-- 面包屑导航（含搜索插槽） -->
      <GlobalBreadcrumb>
        <template #extra>
          <button class="icon-btn" title="刷新" @click="reload">
            <SvgIcon icon-class="refresh-cw" width="16px" height="16px" />
          </button>
        </template>
      </GlobalBreadcrumb>

      <!-- 页面内容（路由视图 + 过渡 + 加载） -->
      <GlobalContent v-if="isRouterAlive" />

      <!-- 底部状态栏 -->
      <GlobalFooter />
    </div>
  </div>
  <!-- 更新弹框 -->
  <UpdateDialog />
</template>

<script setup>
import { ref, nextTick, provide } from 'vue'
import GlobalSider from './components/global-siderMenu/index.vue'
import GlobalHeader from './components/global-header/index.vue'
import GlobalBreadcrumb from './components/global-breadcrumb/index.vue'
import GlobalSearch from './components/global-search/index.vue'
import GlobalContent from './components/global-content/index.vue'
import GlobalFooter from './components/global-footer/index.vue'

// 页面刷新逻辑：通过 v-if 销毁并重建组件
const isRouterAlive = ref(true)
const reload = () => {
  isRouterAlive.value = false
  nextTick(() => {
    isRouterAlive.value = true
  })
}

// 向后代组件暴露刷新方法（可选，若子页面也需要触发刷新）
provide('reload', reload)
</script>

<style lang="scss" scoped>
.layout-container {
  position: relative;
  display: flex;
  gap: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  background: transparent;

  .layout-sidebar {
    position: relative;
    z-index: 3;
  }

  .layout-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    background: var(--color-bg-content, var(--glass-surface));

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      color: var(--color-text-secondary);
      cursor: pointer;
      background: color-mix(in srgb, var(--color-bg-hover), transparent 38%);
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
      -webkit-app-region: no-drag;

      &:hover {
        color: var(--color-text-primary);
        background-color: color-mix(
          in srgb,
          var(--color-bg-hover),
          transparent 10%
        );
        border-color: color-mix(in srgb, var(--color-border), transparent 38%);
      }

      &:active {
        background-color: var(--color-bg-active);
      }
    }
  }
}
</style>
