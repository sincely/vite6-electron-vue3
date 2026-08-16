<!-- 电子商务页面 -->
<template>
  <div class="ecommerce-page">
    <el-row :gutter="20">
      <el-col :sm="24" :md="24" :lg="16">
        <Banner />
      </el-col>
      <el-col :sm="12" :md="12" :lg="4">
        <TotalOrderVolume />
      </el-col>
      <el-col :sm="12" :md="12" :lg="4">
        <TotalProducts />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :sm="12" :md="12" :lg="8">
        <SalesTrend />
      </el-col>
      <el-col :sm="12" :md="12" :lg="8">
        <SalesClassification />
      </el-col>
      <el-col :sm="24" :md="24" :lg="8">
        <el-row :gutter="20">
          <el-col :sm="24" :md="12" :lg="12">
            <ProductSales />
          </el-col>
          <el-col :sm="24" :md="12" :lg="12">
            <SalesGrowth />
          </el-col>
          <el-col :span="24" class="no-margin-bottom">
            <CartConversionRate />
          </el-col>
        </el-row>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :sm="24" :md="12" :lg="8">
        <HotCommodity />
      </el-col>
      <el-col :sm="24" :md="12" :lg="8">
        <AnnualSales />
      </el-col>
      <el-col :sm="24" :md="24" :lg="8">
        <TransactionList />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :md="24" :lg="8">
        <RecentTransaction />
      </el-col>
      <el-col :md="24" :lg="16" class="no-margin-bottom">
        <HotProductsList />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import Banner from './modules/banner.vue'
import TotalOrderVolume from './modules/total-order-volume.vue'
import TotalProducts from './modules/total-products.vue'
import SalesTrend from './modules/sales-trend.vue'
import SalesClassification from './modules/sales-classification.vue'
import TransactionList from './modules/transaction-list.vue'
import HotCommodity from './modules/hot-commodity.vue'
import RecentTransaction from './modules/recent-transaction.vue'
import AnnualSales from './modules/annual-sales.vue'
import ProductSales from './modules/product-sales.vue'
import SalesGrowth from './modules/sales-growth.vue'
import CartConversionRate from './modules/cart-conversion-rate.vue'
import HotProductsList from './modules/hot-products-list.vue'

defineOptions({ name: 'dashboard-ecommerce' })
</script>

<style lang="scss" scoped>
.ecommerce-page {
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
