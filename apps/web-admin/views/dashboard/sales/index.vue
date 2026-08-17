<!-- 销售看板页面 -->
<template>
  <div class="sales-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <StatCards />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <SalesOverview />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <DateFilter />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="16" :lg="24" :xs="24">
        <SalesAssistant />
      </el-col>
      <el-col :xl="8" :lg="24" :xs="24">
        <DeviceDistribution />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="8" :lg="12" :xs="24">
        <HotProducts />
      </el-col>
      <el-col :xl="8" :lg="12" :xs="24">
        <RecentActivities />
      </el-col>
      <el-col :xl="8" :lg="24" :xs="24">
        <KeyCustomers />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <RecentInvoices />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="12" :lg="24" :xs="24">
        <ChannelPerformance />
      </el-col>
      <el-col :xl="12" :lg="24" :xs="24" class="no-margin-bottom">
        <RecentTransactions />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import StatCards from './modules/stat-cards.vue'
import SalesOverview from './modules/sales-overview.vue'
import DateFilter from './modules/date-filter.vue'
import SalesAssistant from './modules/sales-assistant.vue'
import DeviceDistribution from './modules/device-distribution.vue'
import HotProducts from './modules/hot-products.vue'
import RecentActivities from './modules/recent-activities.vue'
import KeyCustomers from './modules/key-customers.vue'
import RecentInvoices from './modules/recent-invoices.vue'
import ChannelPerformance from './modules/channel-performance.vue'
import RecentTransactions from './modules/recent-transactions.vue'

defineOptions({ name: 'dashboard-sales' })
</script>

<style lang="scss" scoped>
.sales-page {
  // 抵消各模块卡片底部的统一间距，避免页面末尾多出空白
  margin-bottom: -20px;

  :deep(.el-col) {
    margin-bottom: 20px;
  }

  :deep(.no-margin-bottom) {
    margin-bottom: 0;
  }
}
</style>
