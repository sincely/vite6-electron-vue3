<template>
  <card class="active-user">
    <template #content>
      <chart :options="barOption" height="219px" />
      <h3 class="active-user-title">用户概述</h3>
      <p class="active-user-sub">
        比上周
        <span class="text-up">+23%</span>
      </p>
      <p class="active-user-desc">
        我们为您创建了多个选项，可将它们组合在一起并定制为像素完美的页面
      </p>
      <div class="active-user-metrics">
        <div v-for="item in list" :key="item.name" class="active-user-metric">
          <p class="active-user-metric-num">{{ item.num }}</p>
          <p class="active-user-metric-name">{{ item.name }}</p>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// 最近 9 个月
const xAxisLabels = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月'
]

// 每月活跃用户数
const chartData = [160, 100, 150, 80, 190, 100, 175, 120, 160]

/**
 * 用户统计数据列表
 * 包含总用户量、总访问量、日访问量和周同比等关键指标
 */
const list = [
  { name: '总用户量', num: '32k' },
  { name: '总访问量', num: '128k' },
  { name: '日访问量', num: '1.2k' },
  { name: '周同比', num: '+5%' }
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
      data: xAxisLabels,
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
        data: chartData,
        barWidth: '50%',
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
.active-user {
  height: 420px;
  overflow: hidden;

  &-title {
    margin-top: 20px;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &-sub {
    margin-top: 4px;
    font-size: 13px;
    color: var(--color-text-secondary);
  }

  &-desc {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }

  &-metrics {
    display: flex;
    margin-top: 8px;
  }

  &-metric {
    flex: 1;

    &-num {
      font-size: 22px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-name {
      margin-top: 2px;
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}
</style>
