<!-- 工作台页面 -->
<template>
  <div class="console-page">
    <CardList />

    <el-row :gutter="20">
      <el-col :sm="24" :md="12" :lg="10">
        <ActiveUser />
      </el-col>
      <el-col :sm="24" :md="12" :lg="14">
        <SalesOverview />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :sm="24" :md="24" :lg="12">
        <NewUser />
      </el-col>
      <el-col :sm="24" :md="12" :lg="6">
        <DynamicStats />
      </el-col>
      <el-col :sm="24" :md="12" :lg="6">
        <TodoList />
      </el-col>
    </el-row>

    <AboutProject />
  </div>
</template>

<script setup>
import CardList from './modules/card-list.vue'
import ActiveUser from './modules/active-user.vue'
import SalesOverview from './modules/sales-overview.vue'
import NewUser from './modules/new-user.vue'
import DynamicStats from './modules/dynamic-stats.vue'
import TodoList from './modules/todo-list.vue'
import AboutProject from './modules/about-project.vue'

defineOptions({ name: 'desktop' })
</script>

<style lang="scss" scoped>
.console-page {
  // 抵消各模块卡片底部的统一间距，避免页面末尾多出空白
  margin-bottom: -20px;

  :deep(.el-col) {
    margin-bottom: 20px;
  }
}
</style>
