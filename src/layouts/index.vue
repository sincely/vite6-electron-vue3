<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside class="layout-sidebar">
      <GlobalSider />
    </aside>

    <!-- 右侧主区域 -->
    <div class="layout-main">
      <!-- 标题栏 / 窗口控制 -->
      <GlobalHeader />

      <!-- 面包屑导航（含搜索插槽） -->
      <GlobalBreadcrumb>
        <template #extra>
          <GlobalSearch />
        </template>
      </GlobalBreadcrumb>

      <!-- 页面内容（路由视图 + 过渡 + 加载） -->
      <GlobalContent />

      <!-- 底部状态栏 -->
      <GlobalFooter />
    </div>
  </div>
</template>

<script setup>
import GlobalSider from './components/global-siderMenu/index.vue'
import GlobalHeader from './components/global-header/index.vue'
import GlobalBreadcrumb from './components/global-breadcrumb/index.vue'
import GlobalSearch from './components/global-search/index.vue'
import GlobalContent from './components/global-content/index.vue'
import GlobalFooter from './components/global-footer/index.vue'
</script>

<style lang="scss" scoped>
.layout-container {
  position: relative;
  display: flex;
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 10px;
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
    background: var(--glass-surface);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-surface-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--glass-shadow-soft);
  }
}

@media (width <= 960px) {
  .layout-container {
    gap: 8px;
    padding: 8px;
  }
}
</style>
