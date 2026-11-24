<template>
  <card class="new-jobs">
    <template #header>
      <div class="dash-header">
        <h4>最近新增岗位</h4>
      </div>
    </template>
    <template #content>
      <el-table :data="jobs">
        <el-table-column label="公司" min-width="160">
          <template #default="{ row }">
            <div class="new-jobs-company">
              <span
                class="new-jobs-logo"
                :style="{
                  color: row.color,
                  background: `color-mix(in srgb, ${row.color}, transparent 88%)`
                }"
              >
                {{ row.logo }}
              </span>
              <span class="new-jobs-name">{{ row.company }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="职位" prop="job" min-width="140" />
        <el-table-column label="地点" prop="city" width="100" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <span class="new-jobs-type">{{ row.type }}</span>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </card>
</template>

<script setup>
/**
 * 最近新增岗位列表
 */
const jobs = [
  {
    logo: 'N',
    company: 'Nucleus OP',
    job: '产品工程师',
    city: '海得拉巴',
    type: '全职',
    color: '#6366f1'
  },
  {
    logo: 'D',
    company: 'Data SC',
    job: '品牌专员',
    city: '班加罗尔',
    type: '实习',
    color: '#10b981'
  },
  {
    logo: 'DX',
    company: 'Delooit XP',
    job: 'UI 开发工程师',
    city: '钦奈',
    type: '全职',
    color: '#f59e0b'
  },
  {
    logo: 'T',
    company: 'Tech IP',
    job: '手动测试工程师',
    city: '海得拉巴',
    type: '兼职',
    color: '#ef4444'
  },
  {
    logo: 'L',
    company: 'LogoTech',
    job: 'AWS 开发工程师',
    city: '喀拉拉',
    type: '自由职业',
    color: '#0ea5e9'
  },
  {
    logo: 'B',
    company: 'ByteNest',
    job: '数据分析师',
    city: '纽约',
    type: '全职',
    color: '#7c3aed'
  },
  {
    logo: 'C',
    company: 'CloudMint',
    job: '后端开发工程师',
    city: '西雅图',
    type: '全职',
    color: '#14b8a6'
  },
  {
    logo: 'Nf',
    company: 'NovaFlow',
    job: '产品设计师',
    city: '远程',
    type: '兼职',
    color: '#f43f5e'
  }
]
</script>

<style lang="scss" scoped>
.new-jobs {
  &-company {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 13px;
    font-weight: 700;
    border-radius: 8px;
  }

  &-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-type {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}
</style>
