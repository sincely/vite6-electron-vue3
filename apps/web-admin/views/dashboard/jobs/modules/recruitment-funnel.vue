<template>
  <card class="recruitment-funnel">
    <template #header>
      <div class="dash-header">
        <h4>招聘漏斗</h4>
      </div>
    </template>
    <template #content>
      <div class="recruitment-funnel-stats">
        <div
          v-for="item in stages"
          :key="item.label"
          class="recruitment-funnel-stats-item"
        >
          <span class="recruitment-funnel-stats-label">{{ item.label }}</span>
          <span class="recruitment-funnel-stats-value">{{ item.value }}</span>
        </div>
      </div>
      <chart :options="funnelOption" height="280px" />
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

/**
 * 招聘漏斗：各阶段转化
 */
const stages = [
  { label: '总投递数', value: '1,982' },
  { label: '入围候选', value: '262' },
  { label: '已录用', value: '214' },
  { label: '已拒绝', value: '395' },
  { label: '已冻结', value: '79' }
]

const funnelOption = ref({})

function buildOptions() {
  const { primary, info, success, warning, danger } = getThemeColors()

  funnelOption.value = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', ...tooltipBase() },
    series: [
      {
        type: 'funnel',
        left: '10%',
        right: '10%',
        top: 10,
        bottom: 10,
        minSize: '20%',
        gap: 4,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { name: '总投递数', value: 1982, itemStyle: { color: primary } },
          { name: '入围候选', value: 660, itemStyle: { color: info } },
          { name: '已拒绝', value: 395, itemStyle: { color: warning } },
          { name: '已录用', value: 214, itemStyle: { color: success } },
          { name: '已冻结', value: 79, itemStyle: { color: danger } }
        ]
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.recruitment-funnel {
  &-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
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
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
  }
}
</style>
