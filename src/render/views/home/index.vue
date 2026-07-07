<template>
  <div class="dashboard">
    <!-- 统计卡片行 -->
    <div class="stats-grid">
      <div
        v-for="stat in statCards"
        :key="stat.key"
        class="stat-card"
        :style="{ color: stat.color }"
      >
        <div class="stat-card-header">
          <div class="stat-card-icon-bg">
            <el-icon class="stat-card-icon">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <span class="stat-card-label">{{ stat.label }}</span>
        </div>
        <div class="stat-card-value">{{ stat.value }}</div>
        <div class="stat-card-sub">
          <span :style="{ color: stat.trend > 0 ? '#10b981' : '#ef4444' }">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </span>
          &nbsp;较上月
        </div>
        <div class="stat-spark">
          <chart :options="stat.sparkOption" height="44px" />
        </div>
      </div>
    </div>

    <!-- 主图表行：折线图 + 饼图 -->
    <div class="chart-row">
      <card class="chart-card">
        <template #header>
          <div class="card-title">
            <el-icon><TrendCharts /></el-icon>
            近 7 日销售趋势
          </div>
        </template>
        <template #content>
          <chart :options="lineOption" height="280px" />
        </template>
      </card>

      <card class="chart-card chart-card--narrow">
        <template #header>
          <div class="card-title">
            <el-icon><PieChart /></el-icon>
            销售品类占比
          </div>
        </template>
        <template #content>
          <chart :options="pieOption" height="280px" />
        </template>
      </card>
    </div>

    <!-- 次图表行：柱状图 + 雷达图 -->
    <div class="chart-row">
      <card class="chart-card">
        <template #header>
          <div class="card-title">
            <el-icon><Histogram /></el-icon>
            各地区月度对比
          </div>
        </template>
        <template #content>
          <chart :options="barOption" height="240px" />
        </template>
      </card>

      <card class="chart-card chart-card--narrow">
        <template #header>
          <div class="card-title">
            <el-icon><DataAnalysis /></el-icon>
            产品维度分析
          </div>
        </template>
        <template #content>
          <chart :options="radarOption" height="240px" />
        </template>
      </card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store/modules/app'
import {
  TrendCharts,
  PieChart,
  Histogram,
  DataAnalysis
} from '@element-plus/icons-vue'

const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)

// =============================================
// 颜色工具 - 读取 CSS 变量（每次调用都是最新值）
// =============================================
function c(name, fallback = '') {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  )
}

function makeSparkOption(data, color) {
  return {
    grid: { top: 2, bottom: 2, left: 2, right: 2 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        lineStyle: { color, width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + '55' },
              { offset: 1, color: color + '00' }
            ]
          }
        }
      }
    ],
    animation: false
  }
}

// =============================================
// 响应式 options refs（由 buildOptions 填充）
// =============================================
const statCards = ref([])
const lineOption = ref({})
const pieOption = ref({})
const barOption = ref({})
const radarOption = ref({})

function buildOptions() {
  const primary = c('--color-primary', '#3b82f6')
  const success = c('--color-success', '#10b981')
  const warning = c('--color-warning', '#f59e0b')
  const danger = c('--color-danger', '#ef4444')
  const info = c('--color-info', '#0ea5e9')
  const textPrimary = c('--color-text-primary', '#111827')
  const textSecondary = c('--color-text-secondary', '#6b7280')
  const textMuted = c('--color-text-muted', '#9ca3af')
  const border = c('--color-border', '#e5e7eb')
  const bgCard = c('--color-bg-card', '#ffffff')

  const tooltipBase = {
    backgroundColor: bgCard,
    borderColor: border,
    textStyle: { color: textPrimary }
  }

  // ---- 统计卡片 ----
  statCards.value = [
    {
      key: 'orders',
      label: '总订单数',
      value: '24,891',
      trend: 12.4,
      color: primary,
      icon: 'Document',
      sparkOption: makeSparkOption(
        [80, 95, 70, 120, 100, 140, 130, 160],
        primary
      )
    },
    {
      key: 'revenue',
      label: '销售总额',
      value: '¥ 1,284,560',
      trend: 8.2,
      color: success,
      icon: 'Money',
      sparkOption: makeSparkOption(
        [60, 80, 75, 100, 95, 120, 110, 145],
        success
      )
    },
    {
      key: 'users',
      label: '活跃用户',
      value: '8,342',
      trend: -2.6,
      color: warning,
      icon: 'User',
      sparkOption: makeSparkOption([120, 100, 110, 90, 85, 95, 80, 88], warning)
    },
    {
      key: 'conversion',
      label: '转化率',
      value: '3.72%',
      trend: 0.8,
      color: info,
      icon: 'TrendCharts',
      sparkOption: makeSparkOption([30, 35, 28, 40, 38, 45, 42, 50], info)
    }
  ]

  // ---- 折线图 ----
  lineOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 20, bottom: 34, left: 56, right: 20 },
    tooltip: { trigger: 'axis', ...tooltipBase },
    legend: {
      // top: 10,
      data: ['本周', '上周'],
      textStyle: { color: textSecondary }
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: border } },
      axisTick: { show: false },
      axisLabel: { color: textSecondary, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: border, type: 'dashed' } },
      axisLabel: {
        color: textSecondary,
        fontSize: 12,
        formatter: (v) => (v >= 1000 ? v / 1000 + 'k' : v)
      }
    },
    series: [
      {
        name: '本周',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [12400, 18000, 15200, 22000, 19800, 28500, 24100],
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
      },
      {
        name: '上周',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: [9800, 14200, 11500, 17600, 15200, 21000, 18400],
        lineStyle: { color: textMuted, width: 2, type: 'dashed' },
        itemStyle: { color: textMuted }
      }
    ]
  }

  // ---- 饼图 ----
  pieOption.value = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)', ...tooltipBase },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'center',
      textStyle: { color: textSecondary, fontSize: 12 }
    },
    color: [primary, success, warning, danger, info],
    series: [
      {
        name: '销售品类',
        type: 'pie',
        radius: ['42%', '70%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: bgCard, borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            color: textPrimary
          },
          scaleSize: 8
        },
        data: [
          { name: '电子产品', value: 38420 },
          { name: '服装配饰', value: 24610 },
          { name: '家居生活', value: 18340 },
          { name: '食品饮料', value: 12580 },
          { name: '其他', value: 6050 }
        ]
      }
    ]
  }

  // ---- 柱状图 ----
  barOption.value = {
    backgroundColor: 'transparent',
    grid: { top: 20, bottom: 34, left: 56, right: 16 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...tooltipBase
    },
    legend: {
      // bottom: 0,
      data: ['华东', '华南', '华北', '西部'],
      textStyle: { color: textSecondary }
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: border } },
      axisTick: { show: false },
      axisLabel: { color: textSecondary, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: border, type: 'dashed' } },
      axisLabel: {
        color: textSecondary,
        fontSize: 12,
        formatter: (v) => (v >= 1000 ? v / 1000 + 'k' : v)
      }
    },
    color: [primary, success, warning, info],
    series: ['华东', '华南', '华北', '西部'].map((name, i) => {
      const colors = [primary, success, warning, info]
      const col = colors[i]
      return {
        name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: col, width: 2 },
        itemStyle: { color: col },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: col + '30' },
              { offset: 1, color: col + '00' }
            ]
          }
        },
        data: [
          [18000, 21000, 19500, 24000, 22500, 28000],
          [14000, 16500, 15000, 18500, 17000, 21000],
          [11000, 13000, 12500, 15000, 14000, 17500],
          [8500, 9500, 9000, 11000, 10500, 13000]
        ][i]
      }
    })
  }

  // ---- 雷达图 ----
  radarOption.value = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', ...tooltipBase },
    legend: {
      bottom: 0,
      data: ['产品A', '产品B'],
      textStyle: { color: textSecondary }
    },
    radar: {
      indicator: [
        { name: '销量', max: 100 },
        { name: '用户评分', max: 100 },
        { name: '复购率', max: 100 },
        { name: '利润率', max: 100 },
        { name: '增长速度', max: 100 },
        { name: '市场占比', max: 100 }
      ],
      radius: '60%',
      center: ['50%', '48%'],
      splitLine: { lineStyle: { color: border } },
      splitArea: { areaStyle: { color: 'transparent' } },
      axisLine: { lineStyle: { color: border } },
      axisName: { color: textSecondary, fontSize: 11 }
    },
    color: [primary, success],
    series: [
      {
        type: 'radar',
        data: [
          {
            name: '产品A',
            value: [85, 92, 76, 68, 88, 72],
            lineStyle: { width: 2 },
            areaStyle: { opacity: 0.15 },
            symbol: 'circle',
            symbolSize: 5
          },
          {
            name: '产品B',
            value: [70, 78, 88, 82, 65, 90],
            lineStyle: { width: 2 },
            areaStyle: { opacity: 0.15 },
            symbol: 'circle',
            symbolSize: 5
          }
        ]
      }
    ]
  }
}

// 主题切换时等待 DOM 更新后重新构建（CSS 变量已被 setTheme 更新）
watch(
  isDark,
  () => {
    nextTick(() => buildOptions())
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
  padding: 2px;
}

// =============================================
// 统计卡片
// =============================================
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  padding: 16px 18px 12px;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    box-shadow: var(--glass-shadow-hover);
    transform: translate3d(0, -2px, 0);
  }

  &-header {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &-icon-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    background: color-mix(in srgb, currentcolor, transparent 84%);
    border: 1px solid color-mix(in srgb, currentcolor, transparent 70%);
    border-radius: 10px;
  }

  &-icon {
    font-size: 16px;
  }

  &-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  &-value {
    margin-top: 12px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text-primary);
  }

  &-sub {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-muted);
  }
}

.stat-spark {
  height: 44px;
  margin-top: 8px;
}

// =============================================
// 图表行
// =============================================
.chart-row {
  display: flex;
  gap: 20px;
}

.chart-card {
  flex: 1;
  min-width: 0;

  &--narrow {
    flex: 0 0 425px;
  }
}

.card-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);

  :deep(.el-icon) {
    font-size: 17px;
    color: var(--color-primary);
    background: var(--brand-accent-soft);
    border-radius: 8px;
  }
}

// =============================================
// 响应式
// =============================================
@media (width <= 1280px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 900px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}

@media (width <= 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
