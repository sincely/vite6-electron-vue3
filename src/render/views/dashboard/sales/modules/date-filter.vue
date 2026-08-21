<template>
  <card class="date-filter">
    <template #content>
      <div class="date-filter-body">
        <el-icon class="date-filter-icon"><Calendar /></el-icon>
        <el-date-picker
          v-model="range"
          type="daterange"
          class="date-filter-picker"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY年MM月DD日"
          :value-format="'YYYY-MM-DD'"
        />
        <div class="date-filter-actions">
          <el-button :icon="RefreshRight" circle @click="handleRefresh" />
          <el-button :icon="Operation" circle />
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { Calendar, RefreshRight, Operation } from '@element-plus/icons-vue'

/**
 * 销售数据日期范围筛选
 */
const range = ref(['2026-04-01', '2026-05-01'])

function handleRefresh() {
  // TODO: 按日期范围刷新销售数据
}
</script>

<style lang="scss" scoped>
.date-filter {
  &-body {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  &-icon {
    font-size: 18px;
    color: var(--color-text-muted);
  }

  &-picker {
    flex: 1;
  }

  &-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
