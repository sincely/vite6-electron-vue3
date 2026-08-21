<template>
  <card class="new-user">
    <template #header>
      <div class="new-user-header">
        <div class="dash-header">
          <h4>新用户</h4>
          <p>
            这个月增长
            <span class="text-up">+20%</span>
          </p>
        </div>
        <el-radio-group v-model="range">
          <el-radio-button value="本月">本月</el-radio-button>
          <el-radio-button value="上月">上月</el-radio-button>
          <el-radio-button value="今年">今年</el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <template #content>
      <el-table :data="tableData" size="large">
        <el-table-column label="头像" min-width="150">
          <template #default="{ row }">
            <div class="new-user-cell">
              <img class="new-user-avatar" :src="row.avatar" alt="avatar" />
              <span>{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="地区" prop="province" />
        <el-table-column label="性别">
          <template #default="{ row }">
            {{ row.sex === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column label="进度" width="240">
          <template #default="{ row }">
            <el-progress
              :percentage="row.pro"
              :color="row.color"
              :stroke-width="4"
            />
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

const ANIMATION_DELAY = 100

const range = ref('本月')

/**
 * 新用户表格数据
 * 包含用户基本信息和完成进度
 */
const tableData = reactive([
  {
    username: '中小鱼',
    province: '北京',
    sex: 0,
    percentage: 60,
    pro: 0,
    color: 'var(--color-primary)',
    avatar: avatar1
  },
  {
    username: '何小荷',
    province: '深圳',
    sex: 1,
    percentage: 20,
    pro: 0,
    color: 'var(--color-info)',
    avatar: avatar2
  },
  {
    username: '誶誶淰',
    province: '上海',
    sex: 1,
    percentage: 60,
    pro: 0,
    color: 'var(--color-warning)',
    avatar: avatar3
  },
  {
    username: '发呆草',
    province: '长沙',
    sex: 0,
    percentage: 50,
    pro: 0,
    color: 'var(--color-violet)',
    avatar: avatar4
  },
  {
    username: '甜筒',
    province: '浙江',
    sex: 1,
    percentage: 70,
    pro: 0,
    color: 'var(--color-danger)',
    avatar: avatar5
  },
  {
    username: '冷月呆呆',
    province: '湖北',
    sex: 1,
    percentage: 90,
    pro: 0,
    color: 'var(--color-success)',
    avatar: avatar6
  }
])

/**
 * 添加进度条动画效果
 * 延迟后将进度值从 0 更新到目标百分比，触发动画
 */
onMounted(() => {
  setTimeout(() => {
    tableData.forEach((item) => {
      item.pro = item.percentage
    })
  }, ANIMATION_DELAY)
})
</script>

<style lang="scss" scoped>
.new-user {
  height: 512px;
  overflow: hidden;

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &-cell {
    display: flex;
    align-items: center;
  }

  &-avatar {
    width: 36px;
    height: 36px;
    margin-right: 8px;
    border-radius: 8px;
  }
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: var(--el-color-primary) !important;
  background: transparent !important;
}
</style>
