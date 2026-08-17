<template>
  <card class="dynamic-stats">
    <template #header>
      <div class="dash-header">
        <h4>动态</h4>
        <p>
          新增
          <span class="text-up">+6</span>
        </p>
      </div>
    </template>
    <template #content>
      <el-scrollbar class="dynamic-stats-scroll">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="dynamic-stats-item"
        >
          <span class="dynamic-stats-name">{{ item.username }}</span>
          <span class="dynamic-stats-type">{{ item.type }}</span>
          <span class="dynamic-stats-target">{{ item.target }}</span>
        </div>
      </el-scrollbar>
    </template>
  </card>
</template>

<script setup>
import { reactive } from 'vue'

/**
 * 用户动态列表
 * 记录用户的关注、发文、提问、兑换等各类活动
 */
const list = reactive([
  {
    username: '中小鱼',
    type: '关注了',
    target: '誶誶淰'
  },
  {
    username: '何小荷',
    type: '发表文章',
    target: 'Vue3 + Vite + Electron 项目实战笔记'
  },
  {
    username: '中小鱼',
    type: '关注了',
    target: '誶誶淰'
  },
  {
    username: '何小荷',
    type: '发表文章',
    target: 'Vue3 + Vite + Electron 项目实战笔记'
  },
  {
    username: '誶誶淰',
    type: '提出问题',
    target: '主题可以配置吗'
  },
  {
    username: '发呆草',
    type: '兑换了物品',
    target: '《奇特的一生》'
  },
  {
    username: '甜筒',
    type: '关闭了问题',
    target: '发呆草'
  },
  {
    username: '冷月呆呆',
    type: '兑换了物品',
    target: '《高效人士的七个习惯》'
  }
])
</script>

<style lang="scss" scoped>
.dynamic-stats {
  height: 512px;
  overflow: hidden;

  &-scroll {
    height: 100%;
  }

  &-item {
    display: flex;
    align-items: center;
    height: 70px;
    overflow: hidden;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: 0;
    }
  }

  &-name {
    flex-shrink: 0;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-type {
    flex-shrink: 0;
    margin: 0 8px;
    color: var(--color-text-muted);
  }

  &-target {
    overflow: hidden;
    color: var(--color-primary);
    text-overflow: ellipsis;
  }
}
</style>
