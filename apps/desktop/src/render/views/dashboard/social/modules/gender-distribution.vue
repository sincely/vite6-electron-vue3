<template>
  <card class="gender-distribution">
    <template #header>
      <div class="dash-header">
        <h4>受众性别分布</h4>
      </div>
    </template>
    <template #content>
      <chart :options="donutOption" height="200px" />
      <div class="gender-distribution-stats">
        <div class="gender-distribution-stats-item">
          <span class="gender-distribution-stats-label">男性</span>
          <span class="gender-distribution-stats-value">13.08K</span>
        </div>
        <div class="gender-distribution-stats-item">
          <span class="gender-distribution-stats-label">女性</span>
          <span class="gender-distribution-stats-value">11.02K</span>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 受众性别分布环形图
 */
const donutOption = ref({})

function buildOptions() {
  const { primary, textSecondary } = getThemeColors()
  const rose = '#f472b6'

  donutOption.value = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', ...tooltipBase() },
    legend: {
      bottom: 0,
      data: ['男性', '女性'],
      textStyle: { color: textSecondary, fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['58%', '80%'],
        center: ['50%', '42%'],
        label: { show: false },
        labelLine: { show: false },
        data: [
          { name: '男性', value: 13080, itemStyle: { color: primary } },
          { name: '女性', value: 11020, itemStyle: { color: rose } }
        ]
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.gender-distribution {
  &-stats {
    display: flex;
    gap: 40px;
    justify-content: center;
    margin-top: 8px;

    &-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
    }

    &-label {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    &-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
  }
}
</style>
