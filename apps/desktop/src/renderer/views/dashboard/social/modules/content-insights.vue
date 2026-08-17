<template>
  <card class="content-insights">
    <template #header>
      <div class="dash-header">
        <h4>内容洞察</h4>
      </div>
    </template>
    <template #content>
      <el-table :data="posts">
        <el-table-column label="帖子名称" prop="name" min-width="120">
          <template #default="{ row }">
            <span class="content-insights-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" prop="date" width="100" />
        <el-table-column label="平台" width="110">
          <template #default="{ row }">
            <span
              class="content-insights-platform"
              :style="{
                color: row.color,
                background: `color-mix(in srgb, ${row.color}, transparent 88%)`
              }"
            >
              {{ row.platform }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="浏览量" prop="views" width="90" />
      </el-table>
    </template>
  </card>
</template>

<script setup>
/**
 * 内容洞察：帖子表现列表
 */
const posts = [
  {
    name: '幕后花絮',
    date: '2月2日',
    platform: 'YouTube',
    views: '9.5K+',
    color: '#ef4444'
  },
  {
    name: '周一激励',
    date: '2月14日',
    platform: 'Instagram',
    views: '1M+',
    color: '#f472b6'
  },
  {
    name: '旅行日记',
    date: '2月13日',
    platform: 'Twitter',
    views: '10K+',
    color: '#0ea5e9'
  },
  {
    name: '今日食谱',
    date: '2月12日',
    platform: 'LinkedIn',
    views: '3.5K',
    color: '#6366f1'
  },
  {
    name: '时尚前线',
    date: '2月11日',
    platform: 'Pinterest',
    views: '1.6M+',
    color: '#f43f5e'
  }
]
</script>

<style lang="scss" scoped>
.content-insights {
  &-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-platform {
    display: inline-block;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;
  }
}
</style>
