<template>
  <card class="traffic-trend">
    <template #header>
      <div class="dash-header">
        <h4>主页流量趋势</h4>
        <p>近 30 日访问与互动走势</p>
      </div>
    </template>
    <template #content>
      <chart :options="lineOption" height="280px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange, hexToRgba } =
  useChartTheme()

/**
 * 主页流量趋势：双系列平滑面积图
 */
const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
const visitData = [
  420, 432, 401, 434, 490, 530, 520, 482, 491, 534, 580, 610, 592, 601, 634,
  690, 730, 710, 682, 691, 734, 780, 810, 792, 801, 834, 890, 930, 910, 948
]
const interactData = visitData.map((v, i) =>
  Math.round(v * (0.42 + (i % 5) * 0.03))
)

const lineOption = ref({})

function buildOptions() {
  const { primary, info, textMuted } = getThemeColors()

  lineOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 10, right: 0, left: 0, bottom: 30, containLabel: true },
    tooltip: { trigger: 'axis', ...tooltipBase() },
    legend: {
      bottom: 0,
      data: ['访问量', '互动量'],
      textStyle: { color: textMuted, fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12, interval: 4 }
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
        name: '访问量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: visitData,
        lineStyle: { color: primary, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(primary, 0.28).rgba },
              { offset: 1, color: hexToRgba(primary, 0.02).rgba }
            ]
          }
        }
      },
      {
        name: '互动量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: interactData,
        lineStyle: { color: info, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(info, 0.28).rgba },
              { offset: 1, color: hexToRgba(info, 0.02).rgba }
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
.traffic-trend {
  height: 100%;
}
</style>
