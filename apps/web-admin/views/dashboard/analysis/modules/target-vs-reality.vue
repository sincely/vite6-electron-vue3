<template>
  <card class="target-vs-reality">
    <template #header>
      <div class="dash-header">
        <h4>目标与实际</h4>
      </div>
    </template>
    <template #content>
      <chart :options="barOption" height="192px" />

      <div class="target-vs-reality-totals">
        <div
          v-for="item in totalItems"
          :key="item.label"
          class="target-vs-reality-item"
        >
          <div class="target-vs-reality-item-left">
            <div class="target-vs-reality-item-icon">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="target-vs-reality-item-text">
              <span class="target-vs-reality-item-label">{{ item.label }}</span>
              <span class="target-vs-reality-item-subLabel">
                {{ item.subLabel }}
              </span>
            </div>
          </div>
          <div class="target-vs-reality-item-value">{{ item.value }}</div>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// 一周的日期标签
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/**
 * 目标与实际销售数据
 * 展示一周内的线上销售情况
 */
const revenueData = [12, 13, 5, 15, 10, 15, 18]

/**
 * 统计项数据
 */
const totalItems = [
  {
    icon: 'ShoppingBag',
    label: '实际销售额',
    subLabel: '全球',
    value: '8,823'
  },
  {
    icon: 'Money',
    label: '目标销售额',
    subLabel: '商业',
    value: '12,122'
  }
]

const barOption = ref({})

function buildOptions() {
  const { primary, textMuted, border } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 15, right: 0, left: 0, bottom: 0, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase()
    },
    xAxis: {
      type: 'category',
      data: weekDays,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: border, type: 'dashed' } },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        data: revenueData,
        barWidth: '28%',
        itemStyle: {
          borderRadius: 4,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: primary + 'b3' },
              { offset: 1, color: primary }
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
.target-vs-reality {
  height: 400px;
  overflow: hidden;

  &-totals {
    padding: 16px 20px 0;
  }

  &-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    &-left {
      display: flex;
      align-items: center;
    }

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      margin-right: 12px;
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary), transparent 88%);
      border-radius: 8px;

      :deep(.el-icon) {
        font-size: 18px;
      }
    }

    &-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    &-label {
      font-size: 14px;
      color: var(--color-text-primary);
    }

    &-subLabel {
      margin-top: 2px;
      font-size: 12px;
      color: var(--color-text-muted);
    }

    &-value {
      font-size: 18px;
      color: var(--color-primary);
    }
  }
}
</style>
