<template>
  <card class="device-distribution">
    <template #header>
      <div class="dash-header">
        <h4>访客设备分布</h4>
      </div>
      <el-link
        class="device-distribution-more"
        type="primary"
        underline="never"
      >
        查看报告 →
      </el-link>
    </template>
    <template #content>
      <chart :options="donutOption" height="220px" />
      <div class="device-distribution-legend">
        <div
          v-for="item in devices"
          :key="item.label"
          class="device-distribution-legend-item"
        >
          <span
            class="device-distribution-legend-dot"
            :style="{ background: item.color }"
          ></span>
          <span class="device-distribution-legend-label">{{ item.label }}</span>
          <span class="device-distribution-legend-value">{{ item.value }}</span>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { useChartTheme } from '@/hooks/useChartTheme'

const { tooltipBase, onThemeChange } = useChartTheme()

/**
 * 访客设备分布环形图
 */
const devices = [
  { label: '桌面端', value: '58%', color: '#6366f1' },
  { label: '移动端', value: '32%', color: '#6ee7b7' },
  { label: '其他', value: '10%', color: '#fbbf24' }
]

const donutOption = ref({})

function buildOptions() {
  donutOption.value = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', ...tooltipBase() },
    series: [
      {
        type: 'pie',
        radius: ['62%', '85%'],
        center: ['50%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        data: devices.map((item) => ({
          name: item.label,
          value: Number.parseInt(item.value),
          itemStyle: { color: item.color }
        }))
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.device-distribution {
  &-more {
    margin-left: auto;
    font-size: 13px;
  }

  &-legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
}
</style>
