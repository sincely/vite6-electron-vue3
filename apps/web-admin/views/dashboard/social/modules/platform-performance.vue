<template>
  <card class="platform-performance">
    <template #header>
      <div class="dash-header">
        <h4>社交媒体表现总览</h4>
      </div>
      <div class="platform-performance-tools">
        <el-input
          v-model="keyword"
          class="platform-performance-search"
          placeholder="搜索平台"
          :prefix-icon="Search"
          clearable
        />
        <el-button>排序方式</el-button>
      </div>
    </template>
    <template #content>
      <el-table :data="filteredList">
        <el-table-column type="selection" width="44" />
        <el-table-column label="平台" min-width="120">
          <template #default="{ row }">
            <div class="platform-performance-name">
              <span
                class="platform-performance-dot"
                :style="{ background: row.color }"
              ></span>
              <span>{{ row.platform }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="帖子数" prop="posts" width="90" />
        <el-table-column label="点赞" prop="likes" width="90" />
        <el-table-column label="分享" prop="shares" width="90" />
        <el-table-column label="评论" prop="comments" width="90" />
        <el-table-column label="曝光率" prop="reach" width="90" />
        <el-table-column label="粉丝数" prop="fans" width="90" />
        <el-table-column label="点击率" prop="ctr" width="90" />
        <el-table-column label="操作" width="60" fixed="right">
          <template #default>
            <el-button size="small" :icon="MoreFilled" circle />
          </template>
        </el-table-column>
      </el-table>
      <div class="platform-performance-footer">
        <span class="platform-performance-total">
          显示 {{ filteredList.length }} 条记录
        </span>
      </div>
    </template>
  </card>
</template>

<script setup>
import { Search, MoreFilled } from '@element-plus/icons-vue'

/**
 * 各社交平台表现数据总览
 */
const keyword = ref('')

const platforms = [
  {
    platform: 'Facebook',
    posts: 126,
    likes: '8,860',
    shares: '1,260',
    comments: 980,
    reach: '12.9%',
    fans: '36k',
    ctr: '4.4%',
    color: '#1877f2'
  },
  {
    platform: 'Instagram',
    posts: 99,
    likes: '12,480',
    shares: '2,180',
    comments: '1,860',
    reach: '14.8%',
    fans: '43k',
    ctr: '5.2%',
    color: '#f472b6'
  },
  {
    platform: 'Twitter',
    posts: 184,
    likes: '5,860',
    shares: '1,560',
    comments: '1,040',
    reach: '10.2%',
    fans: '29k',
    ctr: '3.7%',
    color: '#0ea5e9'
  },
  {
    platform: 'LinkedIn',
    posts: 75,
    likes: '4,200',
    shares: 800,
    comments: 600,
    reach: '11.2%',
    fans: '20k',
    ctr: '3.8%',
    color: '#6366f1'
  },
  {
    platform: 'YouTube',
    posts: 30,
    likes: '22,000',
    shares: '4,000',
    comments: '3,800',
    reach: '18.5%',
    fans: '65k',
    ctr: '7.8%',
    color: '#ef4444'
  },
  {
    platform: 'Snapchat',
    posts: 60,
    likes: '6,500',
    shares: '1,200',
    comments: 900,
    reach: '10.1%',
    fans: '22k',
    ctr: '3.9%',
    color: '#facc15'
  },
  {
    platform: 'TikTok',
    posts: 88,
    likes: '18,400',
    shares: '3,500',
    comments: '2,100',
    reach: '16.9%',
    fans: '54k',
    ctr: '6.4%',
    color: '#14b8a6'
  },
  {
    platform: 'Reddit',
    posts: 42,
    likes: '3,700',
    shares: 980,
    comments: '1,240',
    reach: '8.7%',
    fans: '18k',
    ctr: '2.9%',
    color: '#f97316'
  },
  {
    platform: 'X',
    posts: 102,
    likes: '7,800',
    shares: '1,650',
    comments: '1,050',
    reach: '10.4%',
    fans: '29k',
    ctr: '3.7%',
    color: '#64748b'
  },
  {
    platform: 'Behance',
    posts: 36,
    likes: '4,950',
    shares: 870,
    comments: 510,
    reach: '7.9%',
    fans: '16k',
    ctr: '2.4%',
    color: '#7c3aed'
  }
]

const filteredList = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  if (!key) return platforms
  return platforms.filter((item) => item.platform.toLowerCase().includes(key))
})
</script>

<style lang="scss" scoped>
.platform-performance {
  &-tools {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }

  &-search {
    width: 200px;
  }

  &-name {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
  }

  &-total {
    font-size: 13px;
    color: var(--color-text-muted);
  }
}
</style>
