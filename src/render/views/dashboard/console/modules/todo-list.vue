<template>
  <card class="todo-list">
    <template #header>
      <div class="dash-header">
        <h4>代办事项</h4>
        <p>
          待处理
          <span class="text-down">3</span>
        </p>
      </div>
    </template>
    <template #content>
      <el-scrollbar class="todo-list-scroll">
        <div v-for="(item, index) in list" :key="index" class="todo-list-item">
          <div>
            <p class="todo-list-item-title">{{ item.username }}</p>
            <p class="todo-list-item-date">{{ item.date }}</p>
          </div>
          <el-checkbox v-model="item.complate" />
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
import { reactive } from 'vue'

/**
 * 待办事项列表
 * 记录每日工作任务及完成状态
 */
const list = reactive([
  {
    username: '查看今天工作内容',
    date: '上午 09:30',
    complate: true
  },
  {
    username: '回复邮件',
    date: '上午 10:30',
    complate: true
  },
  {
    username: '工作汇报整理',
    date: '上午 11:00',
    complate: true
  },
  {
    username: '产品需求会议',
    date: '下午 02:00',
    complate: false
  },
  {
    username: '整理会议内容',
    date: '下午 03:30',
    complate: false
  },
  {
    username: '明天工作计划',
    date: '下午 06:30',
    complate: false
  }
])
</script>

<style lang="scss" scoped>
.todo-list {
  height: 512px;
  overflow: hidden;

  &-scroll {
    height: 100%;
  }

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    font-size: 13px;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: 0;
    }

    &-title {
      font-size: 13px;
      color: var(--color-text-primary);
    }

    &-date {
      margin-top: 4px;
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}
</style>
