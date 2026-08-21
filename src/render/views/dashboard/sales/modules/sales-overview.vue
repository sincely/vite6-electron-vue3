<template>
  <card class="sales-overview">
    <template #header>
      <div class="dash-header">
        <h4>销售总览</h4>
      </div>
      <el-radio-group v-model="range" class="sales-overview-range" size="small">
        <el-radio-button value="day">日</el-radio-button>
        <el-radio-button value="week">周</el-radio-button>
        <el-radio-button value="month">月</el-radio-button>
        <el-radio-button value="year">年</el-radio-button>
      </el-radio-group>
    </template>
    <template #content>
      <chart :options="chartOption" height="320px" />
      <div class="sales-overview-stats">
        <div class="sales-overview-stats-item">
          <span class="sales-overview-stats-label">订单总量</span>
          <span class="sales-overview-stats-value">15,535</span>
        </div>
        <div class="sales-overview-stats-item">
          <span class="sales-overview-stats-label">销售总额</span>
          <span class="sales-overview-stats-value">21,754</span>
        </div>
        <div class="sales-overview-stats-item">
          <span class="sales-overview-stats-label">累计营收</span>
          <span class="sales-overview-stats-value">¥180万</span>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

const range = ref('month')

/**
 * 销售总览：月度订单 / 销售柱状图 + 营收趋势线
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
const orderData = [28, 28, 28, 27, 18, 24, 27, 24, 19, 25, 23, 15]
const salesData = [21, 16, 28, 28, 20, 25, 26, 26, 25, 16, 28, 21]
const revenueData = [19, 21, 20, 26, 17, 23, 14, 21, 22, 26, 21, 12]

const chartOption = ref({})

function buildOptions() {
  const { primary, success, warning, textMuted } = getThemeColors()

  chartOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 0, left: 0, bottom: 30, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase()
    },
    legend: {
      bottom: 0,
      data: ['订单总量', '销售总额', '营收'],
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
        name: '订单总量',
        type: 'bar',
        barWidth: 14,
        data: orderData,
        itemStyle: { color: primary, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '销售总额',
        type: 'bar',
        barWidth: 14,
        data: salesData,
        itemStyle: { color: success, borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '营收',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: revenueData,
        lineStyle: { color: warning, width: 2 }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.sales-overview {
  &-range {
    margin-left: auto;
  }

  &-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 16px;
    border-top: 1px solid var(--color-border);

    &-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
      padding: 20px 0 4px;
      border-right: 1px solid var(--color-border);

      &:last-child {
        border-right: none;
      }
    }

    &-label {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    &-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
  }
}
</style>
