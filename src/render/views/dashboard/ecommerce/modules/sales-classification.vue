<template>
  <card class="sales-classification">
    <template #header>
      <div class="dash-header">
        <h4>销售分类</h4>
        <p>按产品类别</p>
      </div>
    </template>
    <template #content>
      <chart :options="ringOption" height="240px" />
      <div class="sales-classification-totals">
        <div class="sales-classification-item">
          <div class="sales-classification-item-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div>
            <p class="sales-classification-item-value">¥500,458</p>
            <span class="sales-classification-item-label">总收入</span>
          </div>
        </div>
        <div class="sales-classification-item">
          <div class="sales-classification-item-icon">
            <el-icon><Wallet /></el-icon>
          </div>
          <div>
            <p class="sales-classification-item-value">¥130,580</p>
            <span class="sales-classification-item-label">净利润</span>
          </div>
        </div>
      </div>
    </template>
  </card>
</template>

<script setup>
import { ref } from 'vue'
import { Money, Wallet } from '@element-plus/icons-vue'
import { useChartTheme } from '@/hooks/useChartTheme'

const { getThemeColors, tooltipBase, onThemeChange } = useChartTheme()

// 按产品类别的销售分类数据
const data = [
  { value: 30, name: '电子产品' },
  { value: 55, name: '服装鞋包' },
  { value: 36, name: '家居用品' }
]

const COLORS = ['#4C87F3', '#EDF2FF', '#8BD8FC']

const ringOption = ref({})

function buildOptions() {
  const { textMuted, bgCard } = getThemeColors()

  ringOption.value = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      ...tooltipBase()
    },
    // 环形图中心文字
    title: {
      text: '¥300,458',
      left: '50%',
      top: '45%',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      textStyle: {
        fontSize: 18,
        fontWeight: 500,
        color: textMuted
      }
    },
    color: COLORS,
    series: [
      {
        name: '销售分类',
        type: 'pie',
        radius: ['70%', '80%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0,
          borderColor: bgCard,
          borderWidth: 2
        },
        label: { show: false },
        emphasis: { label: { show: false } },
        data
      }
    ]
  }
}

onThemeChange(buildOptions)
</script>

<style lang="scss" scoped>
.sales-classification {
  height: 420px;
  overflow: hidden;

  &-totals {
    display: flex;
    justify-content: space-around;
  }

  &-item {
    display: flex;
    align-items: center;

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      margin-right: 10px;
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary), transparent 88%);
      border-radius: 10px;

      :deep(.el-icon) {
        font-size: 20px;
      }
    }

    &-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-label {
      font-size: 13px;
      color: var(--color-text-muted);
    }
  }
}
</style>
