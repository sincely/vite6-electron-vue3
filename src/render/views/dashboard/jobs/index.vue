<!-- 职位仪表盘页面 -->
<template>
  <div class="jobs-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <StatCards />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <RecruitmentPerformance />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="12" :lg="24" :xs="24">
        <RecruitmentActivities />
      </el-col>
      <el-col :xl="12" :lg="24" :xs="24">
        <CandidateOverview />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="12" :lg="24" :xs="24">
        <NewJobs />
      </el-col>
      <el-col :xl="12" :lg="24" :xs="24">
        <RecruitmentFunnel />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <RecentJobs />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24" class="no-margin-bottom">
        <JobPosts />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import StatCards from './modules/stat-cards.vue'
import RecruitmentPerformance from './modules/recruitment-performance.vue'
import RecruitmentActivities from './modules/recruitment-activities.vue'
import CandidateOverview from './modules/candidate-overview.vue'
import NewJobs from './modules/new-jobs.vue'
import RecruitmentFunnel from './modules/recruitment-funnel.vue'
import RecentJobs from './modules/recent-jobs.vue'
import JobPosts from './modules/job-posts.vue'

defineOptions({ name: 'dashboard-jobs' })
</script>

<style lang="scss" scoped>
.jobs-page {
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
