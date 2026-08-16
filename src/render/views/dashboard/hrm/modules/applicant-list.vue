<template>
  <card class="applicant-list">
    <template #header>
      <div class="dash-header">
        <h4>应聘者列表</h4>
      </div>
      <div class="applicant-list-tools">
        <el-input
          v-model="keyword"
          class="applicant-list-search"
          placeholder="搜索编号 / 姓名 / 岗位"
          :prefix-icon="Search"
          clearable
        />
        <el-button type="primary">排序方式</el-button>
      </div>
    </template>
    <template #content>
      <el-table :data="filteredList">
        <el-table-column type="selection" width="44" />
        <el-table-column label="申请编号" prop="code" width="110" />
        <el-table-column label="应聘者" min-width="140">
          <template #default="{ row }">
            <div class="applicant-list-user">
              <el-avatar :src="row.avatar" :size="36" />
              <span class="applicant-list-name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="应聘岗位" prop="job" min-width="140" />
        <el-table-column label="申请日期" prop="date" width="120" />
        <el-table-column label="邮箱" prop="email" min-width="180" />
        <el-table-column label="工作经验" prop="experience" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="applicant-list-status" :class="`is-${row.type}`">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right" align="center">
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
              <el-button
                link
                type="danger"
                size="small"
                :icon="Delete"
                title="删除"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="applicant-list-footer">
        <span class="applicant-list-total">
          显示 {{ filteredList.length }} 条记录
        </span>
        <el-pagination
          layout="prev, pager, next"
          :total="20"
          :page-size="5"
          :current-page="page"
          @current-change="(p) => (page = p)"
        />
      </div>
    </template>
  </card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Search, View, Edit, Delete } from '@element-plus/icons-vue'
import avatar1 from '@/assets/images/avatar/avatar1.webp'
import avatar2 from '@/assets/images/avatar/avatar2.webp'
import avatar3 from '@/assets/images/avatar/avatar3.webp'
import avatar4 from '@/assets/images/avatar/avatar4.webp'
import avatar5 from '@/assets/images/avatar/avatar5.webp'

/**
 * 应聘者列表：搜索 + 状态标签 + 行操作
 */
const keyword = ref('')
const page = ref(1)

const applicants = [
  {
    code: '#SPT-011',
    name: '许悦',
    job: '系统管理员',
    date: '2023-11-24',
    email: 'xuyue@company.com',
    experience: '2年以上',
    status: '新申请',
    type: 'primary',
    avatar: avatar1
  },
  {
    code: '#SPT-012',
    name: '吴昊',
    job: '数据分析',
    date: '2023-12-13',
    email: 'wuhao@company.com',
    experience: '3年以上',
    status: '已面试',
    type: 'info',
    avatar: avatar2
  },
  {
    code: '#SPT-013',
    name: '宋婧',
    job: 'UX/UI 设计师',
    date: '2023-11-10',
    email: 'songjing@company.com',
    experience: '应届',
    status: '已录用',
    type: 'success',
    avatar: avatar3
  },
  {
    code: '#SPT-014',
    name: '叶琳',
    job: '数据库管理',
    date: '2023-12-16',
    email: 'yelin@company.com',
    experience: '1年',
    status: '待复审',
    type: 'warning',
    avatar: avatar4
  },
  {
    code: '#SPT-015',
    name: '唐凯',
    job: 'AI 与机器学习',
    date: '2023-12-22',
    email: 'tangkai@company.com',
    experience: '5年以上',
    status: '已淘汰',
    type: 'danger',
    avatar: avatar5
  }
]

const filteredList = computed(() => {
  const key = keyword.value.trim()
  if (!key) return applicants
  return applicants.filter(
    (item) =>
      item.name.includes(key) ||
      item.code.includes(key) ||
      item.job.includes(key)
  )
})
</script>

<style lang="scss" scoped>
.applicant-list {
  &-tools {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }

  &-search {
    width: 220px;
  }

  &-user {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-status {
    display: inline-block;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;

    &.is-primary {
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary), transparent 88%);
    }

    &.is-info {
      color: var(--color-info);
      background: color-mix(in srgb, var(--color-info), transparent 88%);
    }

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
