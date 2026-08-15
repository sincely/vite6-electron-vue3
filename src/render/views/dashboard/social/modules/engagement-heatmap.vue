<template>
  <card class="engagement-heatmap">
    <template #header>
      <div class="dash-header">
        <h4>互动热力图</h4>
        <p>一周内各时段互动强度</p>
      </div>
      <div class="engagement-heatmap-total">
        <span class="text-up">↑ 2.45%</span>
        <span class="engagement-heatmap-value">231,232</span>
      </div>
    </template>
    <template #content>
      <chart :options="heatmapOption" height="240px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange, hexToRgba } =
  useChartTheme()

/**
 * 互动热力图：星期 x 时段
 */
const hours = ['0时', '4时', '8时', '12时', '16时', '20时']
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// [时段索引, 星期索引, 互动量]
const heatData = [
  [0, 0, 120],
  [1, 0, 200],
  [2, 0, 320],
  [3, 0, 480],
  [4, 0, 360],
  [5, 0, 240],
  [0, 1, 80],
  [1, 1, 160],
  [2, 1, 420],
  [3, 1, 560],
  [4, 1, 520],
  [5, 1, 300],
  [0, 2, 90],
  [1, 2, 180],
  [2, 2, 400],
  [3, 2, 540],
  [4, 2, 500],
  [5, 2, 320],
  [0, 3, 100],
  [1, 3, 190],
  [2, 3, 430],
  [3, 3, 580],
  [4, 3, 540],
  [5, 3, 340],
  [0, 4, 110],
  [1, 4, 210],
  [2, 4, 450],
  [3, 4, 600],
  [4, 4, 560],
  [5, 4, 380],
  [0, 5, 160],
  [1, 5, 260],
  [2, 5, 380],
  [3, 5, 520],
  [4, 5, 480],
  [5, 5, 420],
  [0, 6, 180],
  [1, 6, 280],
  [2, 6, 360],
  [3, 6, 500],
  [4, 6, 460],
  [5, 6, 400]
]

const heatmapOption = ref({})

function buildOptions() {
  const { primary, textMuted, bgCard } = getThemeColors()

  heatmapOption.value = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      formatter: (params) =>
        `${weekDays[params.value[1]]} ${hours[params.value[0]]}<br/>互动量：${params.value[2]}`,
      ...tooltipBase()
    },
    grid: { top: 10, right: 10, left: 0, bottom: 0, containLabel: true },
    xAxis: {
      type: 'category',
      data: hours,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    yAxis: {
      type: 'category',
      data: weekDays,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: textMuted, fontSize: 12 }
    },
    visualMap: {
      show: false,
      min: 80,
      max: 600,
      inRange: {
        color: [
          hexToRgba(primary, 0.12).rgba,
          hexToRgba(primary, 0.45).rgba,
          primary
        ]
      }
    },
    series: [
      {
        type: 'heatmap',
        data: heatData,
        itemStyle: { borderColor: bgCard, borderWidth: 4, borderRadius: 4 },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.3)' }
        }
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.engagement-heatmap {
  &-total {
    display: flex;
    gap: 10px;
    align-items: baseline;
    margin-left: auto;
    font-size: 12px;
  }

  &-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-primary);
  }
}
</style>
