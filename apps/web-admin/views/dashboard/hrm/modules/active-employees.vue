<template>
  <card class="active-employees">
    <template #header>
      <div class="dash-header">
        <h4>在职人员</h4>
      </div>
      <el-link class="active-employees-more" type="primary" underline="never">
        查看全部 →
      </el-link>
    </template>
    <template #content>
      <el-scrollbar height="360px">
        <div
          v-for="item in employees"
          :key="item.name"
          class="active-employees-item"
        >
          <el-avatar :src="item.avatar" :size="40" />
          <div class="active-employees-main">
            <div class="active-employees-name">
              {{ item.name }}
              <span class="active-employees-dept">{{ item.dept }}</span>
            </div>
            <div class="active-employees-job">{{ item.job }}</div>
          </div>
          <div class="active-employees-date">
            <div class="active-employees-date-value">{{ item.date }}</div>
            <div class="active-employees-date-label">入职日期</div>
          </div>
        </div>
      </el-scrollbar>
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
 * 在职人员列表
 */
const employees = [
  {
    name: '林雨',
    dept: '市场部',
    job: '市场经理',
    date: '2024-05-20',
    avatar: avatar1
  },
  {
    name: '周远',
    dept: '技术研发',
    job: '后端开发工程师',
    date: '2022-11-30',
    avatar: avatar2
  },
  {
    name: '陈静',
    dept: '运营部',
    job: '项目经理',
    date: '2021-07-08',
    avatar: avatar3
  },
  {
    name: '王哲',
    dept: '技术研发',
    job: '数据分析师',
    date: '2020-10-10',
    avatar: avatar4
  },
  {
    name: '赵欣',
    dept: '财务部',
    job: '财务分析师',
    date: '2022-02-28',
    avatar: avatar5
  },
  {
    name: '刘洋',
    dept: '销售部',
    job: '销售主管',
    date: '2022-08-05',
    avatar: avatar6
  }
]
</script>

<style lang="scss" scoped>
.active-employees {
  &-more {
    margin-left: auto;
    font-size: 13px;
  }

  &-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &-main {
    flex: 1;
  }

  &-name {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-dept {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 400;
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary), transparent 88%);
    border-radius: 6px;
  }

  &-job {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &-date {
    text-align: right;

    &-value {
      margin-bottom: 4px;
      font-size: 13px;
      color: var(--color-text-primary);
    }

    &-label {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}
</style>
