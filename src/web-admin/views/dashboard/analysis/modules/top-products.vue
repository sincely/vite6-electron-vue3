<template>
  <card class="top-products">
    <template #header>
      <div class="dash-header">
        <h4>热门产品</h4>
      </div>
    </template>
    <template #content>
      <el-table :data="products" size="large">
        <el-table-column prop="name" label="产品名称" width="200" />
        <el-table-column prop="popularity" label="热度">
          <template #default="{ row }">
            <el-progress
              :percentage="row.popularity"
              :color="getColor(row.popularity)"
              :stroke-width="5"
              :show-text="false"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80">
          <template #default="{ row }">
            <span class="top-products-tag" :style="getTagStyle(row)">
              {{ row.sales }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </card>
</template>

<script setup>
const COLOR_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75
}

const POPULARITY_COLORS = {
  LOW: '#00E096',
  MEDIUM: '#0095FF',
  HIGH: '#884CFF',
  VERY_HIGH: '#FE8F0E'
}

/**
 * 热门产品列表数据
 * 包含产品名称、热度和销量信息
 */
const products = [
  { name: '智能手机', popularity: 10, sales: '100' },
  { name: '笔记本电脑', popularity: 29, sales: '100' },
  { name: '平板电脑', popularity: 65, sales: '100' },
  { name: '智能手表', popularity: 32, sales: '100' },
  { name: '无线耳机', popularity: 78, sales: '100' },
  { name: '智能音箱', popularity: 41, sales: '100' }
]

/**
 * 根据热度百分比获取对应的颜色
 * @param percentage 热度百分比 (0-100)
 * @returns 对应的颜色值
 */
function getColor(percentage) {
  if (percentage < COLOR_THRESHOLDS.LOW) return POPULARITY_COLORS.LOW
  if (percentage < COLOR_THRESHOLDS.MEDIUM) return POPULARITY_COLORS.MEDIUM
  if (percentage < COLOR_THRESHOLDS.HIGH) return POPULARITY_COLORS.HIGH
  return POPULARITY_COLORS.VERY_HIGH
}

// hex 颜色转 rgb 分量，用于生成浅色背景
function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16)
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`
}

function getTagStyle(row) {
  const color = getColor(row.popularity)
  return {
    color,
    backgroundColor: `rgba(${hexToRgb(color)}, 0.08)`,
    border: '1px solid currentColor'
  }
}
</script>

<style lang="scss" scoped>
.top-products {
  height: 328px;
  overflow: hidden;

  &-tag {
    padding: 3px 6px;
    font-size: 12px;
    border-radius: 4px;
  }
}
</style>
