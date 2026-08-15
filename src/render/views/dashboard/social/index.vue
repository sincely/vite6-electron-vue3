<!-- 社交媒体页面 -->
<template>
  <div class="social-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <StatCards />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="16" :lg="24" :xs="24">
        <TrafficTrend />
      </el-col>
      <el-col :xl="8" :lg="24" :xs="24">
        <GenderDistribution />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="12" :lg="24" :xs="24">
        <CountryRanking />
      </el-col>
      <el-col :xl="12" :lg="24" :xs="24">
        <ContentInsights />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <PlatformPerformance />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="8" :lg="12" :xs="24">
        <RecentActivities />
      </el-col>
      <el-col :xl="8" :lg="12" :xs="24">
        <AgeMetrics />
      </el-col>
      <el-col :xl="8" :lg="24" :xs="24">
        <RecommendedFollows />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24" class="no-margin-bottom">
        <EngagementHeatmap />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import StatCards from './modules/stat-cards.vue'
import TrafficTrend from './modules/traffic-trend.vue'
import GenderDistribution from './modules/gender-distribution.vue'
import CountryRanking from './modules/country-ranking.vue'
import ContentInsights from './modules/content-insights.vue'
import PlatformPerformance from './modules/platform-performance.vue'
import RecentActivities from './modules/recent-activities.vue'
import AgeMetrics from './modules/age-metrics.vue'
import RecommendedFollows from './modules/recommended-follows.vue'
import EngagementHeatmap from './modules/engagement-heatmap.vue'

defineOptions({ name: 'dashboard-social' })
</script>

<style lang="scss" scoped>
.social-page {
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
