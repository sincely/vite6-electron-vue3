<template>
  <card class="recruitment-activities">
    <template #header>
      <div class="dash-header">
        <h4>招聘动态</h4>
      </div>
    </template>
    <template #content>
      <el-scrollbar height="420px">
        <div
          v-for="item in activities"
          :key="item.time"
          class="recruitment-activities-item"
        >
          <el-avatar :src="item.avatar" :size="40" />
          <div class="recruitment-activities-main">
            <div class="recruitment-activities-head">
              <span class="recruitment-activities-name">{{ item.name }}</span>
              <span
                class="recruitment-activities-tag"
                :class="`is-${item.type}`"
              >
                {{ item.tag }}
              </span>
            </div>
            <p class="recruitment-activities-desc">{{ item.desc }}</p>
            <p class="recruitment-activities-time">{{ item.time }}</p>
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
 * 招聘动态时间线
 */
const activities = [
  {
    name: '张晨',
    tag: '已通过',
    type: 'primary',
    desc: '已完成高级前端工程师岗位的代码评审与录用建议。',
    time: '2026-02-19 10:30',
    avatar: avatar1
  },
  {
    name: '李娜',
    tag: '已完成',
    type: 'success',
    desc: '处理技术岗面试安排并同步本周招聘进度日报。',
    time: '2026-02-19 11:15',
    avatar: avatar2
  },
  {
    name: '王凯',
    tag: '已审核',
    type: 'info',
    desc: '已确认新零售项目的岗位需求与招聘预算范围。',
    time: '2026-02-19 13:00',
    avatar: avatar3
  },
  {
    name: '赵敏',
    tag: '待跟进',
    type: 'warning',
    desc: '已发送产品经理岗位的面试安排，等待候选人确认。',
    time: '2026-02-19 14:20',
    avatar: avatar4
  },
  {
    name: '吴昊',
    tag: '已通过',
    type: 'primary',
    desc: '完成前端负责人岗位的终面评估并提交录用意见。',
    time: '2026-02-19 15:05',
    avatar: avatar5
  },
  {
    name: '邓玲',
    tag: '已完成',
    type: 'success',
    desc: '同步销售顾问岗位的薪酬方案与入职时间窗口。',
    time: '2026-02-19 15:42',
    avatar: avatar6
  },
  {
    name: '何静',
    tag: '已审核',
    type: 'info',
    desc: '已确认数据分析岗位的 JD 与面试官排期。',
    time: '2026-02-19 16:18',
    avatar: avatar1
  }
]
</script>

<style lang="scss" scoped>
.recruitment-activities {
  &-item {
    display: flex;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &-main {
    flex: 1;
  }

  &-head {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
  }

  &-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-tag {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;

    &.is-primary {
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary), transparent 88%);
    }

    &.is-success {
      color: var(--color-success);
      background: color-mix(in srgb, var(--color-success), transparent 88%);
    }

    &.is-info {
      color: var(--color-info);
      background: color-mix(in srgb, var(--color-info), transparent 88%);
    }

    &.is-warning {
      color: var(--color-warning);
      background: color-mix(in srgb, var(--color-warning), transparent 88%);
    }
  }

  &-desc {
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &-time {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}
</style>
