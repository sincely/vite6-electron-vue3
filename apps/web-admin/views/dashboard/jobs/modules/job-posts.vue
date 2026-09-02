<template>
  <card class="job-posts">
    <template #header>
      <div class="dash-header">
        <h4>最新岗位发布</h4>
      </div>
      <div class="job-posts-tools">
        <el-input
          v-model="keyword"
          class="job-posts-search"
          placeholder="搜索职位 / 公司 / 地点"
          :prefix-icon="Search"
          clearable
        />
        <el-button>按发布日期</el-button>
      </div>
    </template>
    <template #content>
      <el-table :data="filteredList">
        <el-table-column label="序号" prop="no" width="70" />
        <el-table-column label="职位名称" prop="job" min-width="130" />
        <el-table-column label="部门" prop="dept" min-width="110" />
        <el-table-column label="公司名称" prop="company" min-width="120" />
        <el-table-column label="地点" prop="city" width="90" />
        <el-table-column label="申请人数" prop="apply" width="90" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <span class="job-posts-status" :class="`is-${row.type}`">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="发布人" min-width="120">
          <template #default="{ row }">
            <div class="job-posts-user">
              <el-avatar :src="row.avatar" :size="28" />
              <span>{{ row.publisher }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布日期" prop="date" width="110" />
        <el-table-column label="操作" width="90" fixed="right" align="center">
          <template #default>
            <div class="table-action">
              <el-button
                link
                type="info"
                size="small"
                :icon="View"
                title="查看"
              />
              <el-button
                link
                type="primary"
                size="small"
                :icon="Edit"
                title="编辑"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="job-posts-footer">
        <span class="job-posts-total">
          显示 {{ filteredList.length }} 条，共 {{ posts.length }} 条记录
        </span>
      </div>
    </template>
  </card>
</template>

<script setup>
import { Search, View, Edit } from '@element-plus/icons-vue'
import avatar1 from '@/assets/images/avatar/avatar1.webp'
import avatar2 from '@/assets/images/avatar/avatar2.webp'
import avatar3 from '@/assets/images/avatar/avatar3.webp'
import avatar4 from '@/assets/images/avatar/avatar4.webp'
import avatar5 from '@/assets/images/avatar/avatar5.webp'
import avatar6 from '@/assets/images/avatar/avatar6.webp'

/**
 * 最新岗位发布表格
 */
const keyword = ref('')

const posts = [
  {
    no: '01',
    job: '软件工程师',
    dept: '技术部',
    company: '星云科技',
    city: '上海',
    apply: 35,
    status: '招聘中',
    type: 'success',
    publisher: '张晨',
    date: '2026-02-15',
    avatar: avatar1
  },
  {
    no: '03',
    job: '市场专员',
    dept: '市场部',
    company: '市场动力',
    city: '深圳',
    apply: 25,
    status: '招聘中',
    type: 'success',
    publisher: '王凯',
    date: '2026-02-10',
    avatar: avatar2
  },
  {
    no: '04',
    job: '数据科学家',
    dept: '技术部',
    company: '数智未来',
    city: '远程',
    apply: 12,
    status: '招聘中',
    type: 'success',
    publisher: '陈倩',
    date: '2026-02-05',
    avatar: avatar3
  },
  {
    no: '02',
    job: '人力资源经理',
    dept: '人力资源',
    company: '人和咨询',
    city: '北京',
    apply: 10,
    status: '已关闭',
    type: 'danger',
    publisher: '李娜',
    date: '2026-01-30',
    avatar: avatar4
  },
  {
    no: '05',
    job: '平面设计师',
    dept: '设计部',
    company: '创想设计',
    city: '杭州',
    apply: 20,
    status: '已关闭',
    type: 'danger',
    publisher: '周立',
    date: '2026-01-25',
    avatar: avatar5
  },
  {
    no: '06',
    job: '客服经理',
    dept: '客户成功',
    company: '客服在线',
    city: '远程',
    apply: 8,
    status: '招聘中',
    type: 'success',
    publisher: '刘敏',
    date: '2026-01-20',
    avatar: avatar6
  }
]

const filteredList = computed(() => {
  const key = keyword.value.trim()
  if (!key) return posts
  return posts.filter(
    (item) =>
      item.job.includes(key) ||
      item.company.includes(key) ||
      item.city.includes(key)
  )
})
</script>

<style lang="scss" scoped>
.job-posts {
  &-tools {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }

  &-search {
    width: 220px;
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

    &.is-danger {
      color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger), transparent 88%);
    }
  }

  &-user {
    display: flex;
    gap: 8px;
    align-items: center;
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
