<!-- 人力资源页面 -->
<template>
  <div class="hrm-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <StatCards />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="12" :lg="24" :xs="24">
        <EmployeeStructure />
      </el-col>
      <el-col :xl="12" :lg="24" :xs="24">
        <AttendanceOverview />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="12" :lg="24" :xs="24">
        <RecruitmentOverview />
      </el-col>
      <el-col :xl="12" :lg="24" :xs="24">
        <DepartmentDistribution />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :xl="12" :lg="24" :xs="24">
        <ActiveEmployees />
      </el-col>
      <el-col :xl="12" :lg="24" :xs="24">
        <TodayAttendance />
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24" class="no-margin-bottom">
        <ApplicantList />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import StatCards from './modules/stat-cards.vue'
import EmployeeStructure from './modules/employee-structure.vue'
import AttendanceOverview from './modules/attendance-overview.vue'
import RecruitmentOverview from './modules/recruitment-overview.vue'
import DepartmentDistribution from './modules/department-distribution.vue'
import ActiveEmployees from './modules/active-employees.vue'
import TodayAttendance from './modules/today-attendance.vue'
import ApplicantList from './modules/applicant-list.vue'

defineOptions({ name: 'dashboard-hrm' })
</script>

<style lang="scss" scoped>
.hrm-page {
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
