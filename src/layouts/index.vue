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
  <!-- 更新弹框 -->
  <UpdateDialog />
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
  }
}
</style>
