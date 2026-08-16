<!-- 加密货币页面 -->
<template>
  <div class="crypto-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <TickerCards />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="16" :lg="24" :xs="24">
        <CryptoPerformance />
      </el-col>
      <el-col :xl="8" :lg="24" :xs="24">
        <MyBalance />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="8" :lg="12" :xs="24">
        <TransactionHistory />
      </el-col>
      <el-col :xl="8" :lg="12" :xs="24">
        <RecentActivities />
      </el-col>
      <el-col :xl="8" :lg="24" :xs="24">
        <PriceStats />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="12" :lg="24" :xs="24">
        <BuySell />
      </el-col>
      <el-col :xl="12" :lg="24" :xs="24">
        <AssetOverview />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24" class="no-margin-bottom">
        <PortfolioTable />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import TickerCards from './modules/ticker-cards.vue'
import CryptoPerformance from './modules/crypto-performance.vue'
import MyBalance from './modules/my-balance.vue'
import TransactionHistory from './modules/transaction-history.vue'
import RecentActivities from './modules/recent-activities.vue'
import PriceStats from './modules/price-stats.vue'
import BuySell from './modules/buy-sell.vue'
import AssetOverview from './modules/asset-overview.vue'
import PortfolioTable from './modules/portfolio-table.vue'

defineOptions({ name: 'dashboard-crypto' })
</script>

<style lang="scss" scoped>
.crypto-page {
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
