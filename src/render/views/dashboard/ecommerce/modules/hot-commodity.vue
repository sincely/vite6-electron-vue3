<template>
  <card class="hot-commodity">
    <template #header>
      <div class="dash-header">
        <h4>热销商品</h4>
        <p>本周销售排行</p>
      </div>
    </template>
    <template #content>
      <chart :options="lineOption" height="144px" />
      <div class="hot-commodity-list">
        <div
          v-for="item in weeklyList"
          :key="item.title"
          class="hot-commodity-item"
        >
          <div class="hot-commodity-item-icon" :style="{ color: item.color }">
            <el-icon><Money /></el-icon>
          </div>
          <div class="hot-commodity-item-info">
            <p class="hot-commodity-item-title">{{ item.title }}</p>
            <span class="hot-commodity-item-subtitle">
              {{ item.subtitle }}
            </span>
          </div>
          <div class="hot-commodity-item-value" :style="{ color: item.color }">
            +{{ item.value }}
          </div>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { Money } from '@element-plus/icons-vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, onThemeChange } = useChartTheme()

/**
 * 本周热销商品列表
 * 展示销量排名前三的商品信息
 */
const weeklyList = [
  {
    title: '智能手表Pro',
    subtitle: '电子产品',
    value: '1,286件',
    color: 'var(--color-primary)'
  },
  {
    title: '时尚连衣裙',
    subtitle: '女装服饰',
    value: '892件',
    color: 'var(--color-success)'
  },
  {
    title: '厨房小家电',
    subtitle: '家居用品',
    value: '756件',
    color: 'var(--color-danger)'
  }
]

const lineOption = ref({})

function buildOptions() {
  const { primary } = getThemeColors()

  lineOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 5, right: 0, left: 0, bottom: 0 },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: false,
      data: [1, 2, 3, 4, 5, 6, 7]
    },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: [8, 40, 82, 35, 90, 52, 35],
        smooth: true,
        showSymbol: false,
        lineStyle: { color: primary, width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: primary + '33' },
              { offset: 1, color: primary + '03' }
            ]
          }
        }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.hot-commodity {
  height: 451px;
  overflow: hidden;

  &-list {
    margin-top: 40px;
  }

  &-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      background: color-mix(in srgb, currentcolor, transparent 88%);
      border-radius: 10px;

      :deep(.el-icon) {
        font-size: 20px;
      }
    }

    &-info {
      margin-left: 10px;
    }

    &-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-subtitle {
      font-size: 13px;
      color: var(--color-text-muted);
    }

    &-value {
      padding: 6px 12px;
      margin-left: auto;
      font-size: 13px;
      background: color-mix(in srgb, currentcolor, transparent 88%);
      border-radius: 6px;
    }
  }
}
</style>
