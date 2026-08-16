<template>
  <card class="candidate-overview">
    <template #header>
      <div class="dash-header">
        <h4>候选人概览</h4>
      </div>
    </template>
    <template #content>
      <div class="candidate-overview-body">
        <chart :options="donutOption" height="240px" />
        <div class="candidate-overview-stats">
          <div class="candidate-overview-stats-item">
            <span class="candidate-overview-stats-label">男性</span>
            <span class="candidate-overview-stats-value">16,620</span>
            <span class="text-up">↑ 3.92%</span>
            <span class="candidate-overview-stats-unit">今年</span>
          </div>
          <div class="candidate-overview-stats-item">
            <span class="candidate-overview-stats-label">女性</span>
            <span class="candidate-overview-stats-value">13,240</span>
            <span class="text-up">↑ 1.08%</span>
            <span class="candidate-overview-stats-unit">今年</span>
          </div>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 候选人概览：性别分布环形图
 */
const donutOption = ref({})

function buildOptions() {
  const { primary, success, textSecondary } = getThemeColors()

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
        radius: ['62%', '85%'],
        center: ['50%', '45%'],
        label: { show: false },
        labelLine: { show: false },
        data: [
          { name: '男性', value: 16620, itemStyle: { color: primary } },
          { name: '女性', value: 13240, itemStyle: { color: success } }
        ]
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.candidate-overview {
  &-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &-stats {
    display: flex;
    gap: 40px;

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

    &-unit {
      font-size: 12px;
      color: var(--color-text-muted);
    }
  }
}
</style>
