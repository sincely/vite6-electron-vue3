<template>
  <card class="sales-overview">
    <template #header>
      <div class="dash-header">
        <h4>访问量</h4>
        <p>
          今年增长
          <span class="text-up">+15%</span>
        </p>
      </div>
    </template>
    <template #content>
      <chart :options="lineOption" height="310px" />
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 全年访问量数据
 * 记录每月的访问量统计
 */
const data = [50, 25, 40, 20, 70, 35, 65, 30, 35, 20, 40, 44]

// X 轴月份标签
const xAxisData = [
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

const lineOption = ref({})

function buildOptions() {
  const { primary, textMuted, border } = getThemeColors()

  lineOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 20, right: 10, left: 0, bottom: 0, containLabel: true },
    tooltip: { trigger: 'axis', ...tooltipBase() },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
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
        type: 'line',
        data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: { color: primary, width: 2.5 },
        itemStyle: { color: primary },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: primary + '40' },
              { offset: 1, color: primary + '00' }
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
.sales-overview {
  height: 420px;
  overflow: hidden;
}
</style>
