<template>
  <card class="today-attendance">
    <template #header>
      <div class="dash-header">
        <h4>今日出勤</h4>
      </div>
      <el-button class="today-attendance-sort" size="small">排序方式</el-button>
    </template>
    <template #content>
      <el-table :data="records" :show-header="true">
        <el-table-column label="姓名" min-width="160">
          <template #default="{ row }">
            <div class="today-attendance-user">
              <el-avatar :src="row.avatar" :size="36" />
              <div>
                <div class="today-attendance-name">{{ row.name }}</div>
                <div class="today-attendance-job">{{ row.job }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="签到时间" prop="time" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="today-attendance-status" :class="`is-${row.type}`">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </card>
</template>

<script setup>
import avatar1 from '@/assets/images/avatar/avatar1.webp'
import avatar2 from '@/assets/images/avatar/avatar2.webp'
import avatar3 from '@/assets/images/avatar/avatar3.webp'
import avatar4 from '@/assets/images/avatar/avatar4.webp'
import avatar5 from '@/assets/images/avatar/avatar5.webp'
import avatar6 from '@/assets/images/avatar/avatar6.webp'

/**
 * 今日出勤记录
 * type: success 全天出勤 / warning 迟到、早退
 */
const records = [
  {
    name: '张伟',
    job: '经理',
    time: '8:48',
    status: '全天出勤',
    type: 'success',
    avatar: avatar1
  },
  {
    name: '李娜',
    job: '开发工程师',
    time: '9:20',
    status: '迟到',
    type: 'warning',
    avatar: avatar2
  },
  {
    name: '王强',
    job: '人事专员',
    time: '8:10',
    status: '全天出勤',
    type: 'success',
    avatar: avatar3
  },
  {
    name: '陈晨',
    job: '分析师',
    time: '7:20',
    status: '早退',
    type: 'warning',
    avatar: avatar4
  },
  {
    name: '周敏',
    job: '设计师',
    time: '10:30',
    status: '全天出勤',
    type: 'success',
    avatar: avatar5
  },
  {
    name: '赵磊',
    job: '产品经理',
    time: '8:35',
    status: '全天出勤',
    type: 'success',
    avatar: avatar6
  },
  {
    name: '林晓',
    job: '测试工程师',
    time: '9:05',
    status: '迟到',
    type: 'warning',
    avatar: avatar1
  }
]
</script>

<style lang="scss" scoped>
.today-attendance {
  &-sort {
    margin-left: auto;
  }

  &-user {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-job {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-status {
    display: inline-block;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;

    &.is-success {
      color: var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 88%);
    }

    &.is-warning {
      color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning), transparent 88%);
    }

    &.is-danger {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 88%);
    }
  }
}
</style>
