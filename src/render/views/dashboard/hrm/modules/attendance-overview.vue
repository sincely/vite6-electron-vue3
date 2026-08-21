<template>
  <card class="attendance-overview">
    <template #header>
      <div class="dash-header">
        <h4>考勤概览</h4>
      </div>
    </template>
    <template #content>
      <div class="attendance-overview-chart">
        <chart :options="gaugeOption" height="180px" />
        <div class="attendance-overview-center">
          <span class="attendance-overview-center-label">总计</span>
          <span class="attendance-overview-center-value">4218</span>
        </div>
      </div>
      <div class="attendance-overview-legend">
        <div
          v-for="item in legendData"
          :key="item.label"
          class="attendance-overview-legend-item"
        >
          <span
            class="attendance-overview-legend-dot"
            :style="{ background: item.color }"
          ></span>
          <span class="attendance-overview-legend-label">{{ item.label }}</span>
          <span class="attendance-overview-legend-value">{{ item.value }}</span>
        </div>
      </div>
      <el-button class="attendance-overview-more">查看完整统计</el-button>
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { onThemeChange } = useChartTheme()

/**
 * 考勤概览：半环仪表盘 + 分类图例
 */
const legendData = [
  { label: '正常出勤', value: '1,754', color: '#6366f1' },
  { label: '迟到', value: '878', color: '#6ee7b7' },
  { label: '请假', value: '634', color: '#fbbf24' },
  { label: '缺勤', value: '470', color: '#fda4af' }
]

const gaugeOption = ref({})

function buildOptions() {
  gaugeOption.value = {
    backgroundColor: 'transparent',
    tooltip: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['78%', '100%'],
        center: ['50%', '95%'],
        startAngle: 180,
        endAngle: 0,
        label: { show: false },
        labelLine: { show: false },
        data: [
          ...legendData.map((item) => ({
            name: item.label,
            value: Number(item.value.replace(/,/g, '')),
            itemStyle: { color: item.color }
          })),
          // 占位半圆，撑起下半部分空白
          { value: 4218, itemStyle: { color: 'transparent' } }
        ]
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.attendance-overview {
  &-chart {
    position: relative;
  }

  &-center {
    position: absolute;
    right: 0;
    bottom: 4px;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;

    &-label {
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    &-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
  }

  &-legend {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;

    &-item {
      display: flex;
      align-items: center;
    }

    &-dot {
      width: 8px;
      height: 8px;
      margin-right: 8px;
      border-radius: 50%;
    }

    &-label {
      flex: 1;
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    &-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
  }

  &-more {
    width: 100%;
    margin-top: 16px;
  }
}
</style>
