<template>
  <card class="recruitment-overview">
    <template #header>
      <div class="dash-header">
        <h4>招聘概览</h4>
      </div>
    </template>
    <template #content>
      <div class="recruitment-overview-stats">
        <div class="recruitment-overview-stats-item">
          <span class="recruitment-overview-stats-label">累计录用人数</span>
          <span class="recruitment-overview-stats-value">624</span>
        </div>
        <div class="recruitment-overview-stats-item">
          <span class="recruitment-overview-stats-label">累计反馈数</span>
          <span class="recruitment-overview-stats-value">2,036</span>
        </div>
      </div>
      <chart :options="barOption" height="240px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 招聘概览：月度录用 / 反馈对比柱状图
 */
const months = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]
const hiredData = [14, 16, 16, 16, 10, 13, 14, 16, 13, 16, 16, 16]
const feedbackData = [20, 16, 25, 25, 25, 20, 25, 25, 25, 25, 25, 20]

const barOption = ref({})

function buildOptions() {
  const { primary, violet, textMuted } = getThemeColors()

  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 0, left: 0, bottom: 30, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase()
    },
    legend: {
      bottom: 0,
      data: ['录用人数', '收到反馈'],
      textStyle: { color: textMuted, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: months,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: {
        lineStyle: { type: 'dashed', color: 'rgba(128,128,128,0.25)' }
      },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    series: [
      {
        name: '录用人数',
        type: 'bar',
        barWidth: 14,
        data: hiredData,
        itemStyle: { color: primary, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '收到反馈',
        type: 'bar',
        barWidth: 14,
        data: feedbackData,
        itemStyle: { color: violet, borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.recruitment-overview {
  &-stats {
    display: flex;
    gap: 48px;
    margin-bottom: 16px;

    &-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-label {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    &-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
  }
}
</style>
