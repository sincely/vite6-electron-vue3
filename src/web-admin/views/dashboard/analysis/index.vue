<!-- 分析页页面 -->
<template>
  <div class="analysis-page">
    <el-row :gutter="20">
      <el-col :xl="14" :lg="15" :xs="24">
        <TodaySales />
      </el-col>
      <el-col :xl="10" :lg="9" :xs="24">
        <VisitorInsights />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="10" :lg="10" :xs="24">
        <TotalRevenue />
      </el-col>
      <el-col :xl="7" :lg="7" :xs="24">
        <CustomerSatisfaction />
      </el-col>
      <el-col :xl="7" :lg="7" :xs="24">
        <TargetVsReality />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="10" :lg="10" :xs="24">
        <TopProducts />
      </el-col>
      <el-col :xl="7" :lg="7" :xs="24">
        <SalesMappingByCountry />
      </el-col>
      <el-col :xl="7" :lg="7" :xs="24">
        <VolumeServiceLevel />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import TodaySales from './modules/today-sales.vue'
import VisitorInsights from './modules/visitor-insights.vue'
import TotalRevenue from './modules/total-revenue.vue'
import CustomerSatisfaction from './modules/customer-satisfaction.vue'
import TargetVsReality from './modules/target-vs-reality.vue'
import TopProducts from './modules/top-products.vue'
import SalesMappingByCountry from './modules/sales-mapping-by-country.vue'
import VolumeServiceLevel from './modules/volume-service-level.vue'

defineOptions({ name: 'dashboard-analysis' })
</script>

<style lang="scss" scoped>
.analysis-page {
  // 抵消各模块卡片底部的统一间距，避免页面末尾多出空白
  margin-bottom: -20px;

  :deep(.el-col) {
    margin-bottom: 20px;
  }
}
</style>
