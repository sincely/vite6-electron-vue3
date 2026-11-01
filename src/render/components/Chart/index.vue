<template>
  <div ref="chartRef" class="chart" :style="sizeStyle"></div>
</template>

<script setup>
import echarts from '@/plugins/echarts'
import { useChartTheme } from '@/hooks/useChartTheme'

defineOptions({
  name: 'chart'
})

/**
 * 图表
 * @property {object} options 配置信息
 * @property {number | string} width 宽
 * @property {number | string} height 高
 */
const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: [Number, String],
    default: null // <--- 修改默认值为 null
  },
  height: {
    type: [Number, String],
    default: null // <--- 修改默认值为 null
  }
})

const emit = defineEmits(['init'])

const chart = ref(null)
const chartRef = ref()

const { getChartColors, onThemeChange } = useChartTheme()

// 显式传入 width/height 时同步约束容器尺寸，
// 避免 .chart 默认 100% 高度把后续兄弟元素挤出固定高度卡片
const sizeStyle = computed(() => {
  const style = {}
  if (props.width != null) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height != null) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return style
})

// options 变化时只更新，不重新 init（原来重新 init 会导致实例泄漏）
watch(
  () => props.options,
  (newOptions) => {
    if (chart.value && newOptions && Object.keys(newOptions).length) {
      chart.value.setOption(newOptions, true)
    }
  },
  { deep: true }
)

// =============================================
// 尺寸监听
// 侧边栏折叠/展开时窗口尺寸不变，window.resize 不会触发，
// 只有图表容器宽度变化，因此用 ResizeObserver 监听容器尺寸。
// rAF 合并同一帧内的多次触发，避免侧边栏过渡动画期间频繁 resize。
// =============================================
let resizeObserver = null
let resizeRafId = null
// 已应用到 echarts 主题里的颜色（用于判断主题色是否变化）
let appliedThemeColor = ''

onMounted(() => {
  init()
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleResize)
    resizeObserver.observe(chartRef.value)
  }
  // window resize 作为兜底
  window.addEventListener('resize', scheduleResize)
})

// 原来写的是 onBeforeMount（组件挂载前触发，此时 chart.value 必然为 null，永远不会清理）
// 修复为 onBeforeUnmount，确保组件销毁时正确释放 ECharts 实例
onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.dispose()
    chart.value = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (resizeRafId != null) {
    cancelAnimationFrame(resizeRafId)
    resizeRafId = null
  }
  window.removeEventListener('resize', scheduleResize)
})

/**
 * 构造 echarts 主题
 * 颜色全部来自图表 token，运行时读取，跟随明暗主题
 * @private
 */
function buildChartTheme() {
  return {
    legend: {
      itemWidth: 14,
      itemHeight: 14
    },
    bar: {
      barWidth: 30,
      backgroundStyle: {
        color: getChartColors().grid
      },
      showBackground: true
    }
  }
}

/**
 * 应用当前配置
 * @private
 */
function applyOptions() {
  if (!chart.value) return
  // options 为空时不调用 setOption，避免报错
  if (props.options && Object.keys(props.options).length) {
    chart.value.setOption(props.options, true)
  }
  resizeChart()
  emit('init', chart.value)
}

/**
 * 初始化
 * @param {number} delay 延迟应用配置的毫秒数（0 表示立即应用）
 * @private
 */
function init(delay = 100) {
  // 注册主题
  const theme = buildChartTheme()
  // 记录已应用的主题色，主题色没变时不必重建实例
  appliedThemeColor = theme.bar.backgroundStyle.color
  echarts.registerTheme('chart', theme)

  // 初始化图表实例
  // 只在有明确值时才传 width/height，否则让 ECharts 自动检测容器大小
  const initOpts = {}
  if (props.width != null) initOpts.width = props.width
  if (props.height != null) initOpts.height = props.height
  chart.value = markRaw(echarts.init(chartRef.value, 'chart', initOpts))

  if (delay) {
    setTimeout(applyOptions, delay)
  } else {
    applyOptions()
  }
}

/**
 * 主题切换后重建实例
 * echarts 的主题在实例创建时就被快照，主题色变化后必须重建才能用上新的 token
 * @private
 */
function rebuildForTheme() {
  if (!chart.value) return
  // 主题色没有变化（onThemeChange 首次立即触发时也会走到这里）就不重建
  if (getChartColors().grid === appliedThemeColor) return
  chart.value.dispose()
  chart.value = null
  init(0)
}

// 主题切换（明暗主题 / 主题色）后重建实例，让主题里的 token 颜色生效
onThemeChange(rebuildForTheme)

// 同一帧内多次触发（ResizeObserver + window resize）只执行一次 resize
function scheduleResize() {
  if (resizeRafId != null) return
  resizeRafId = requestAnimationFrame(() => {
    resizeRafId = null
    resizeChart()
  })
}

function resizeChart() {
  if (chart.value) {
    chart.value.resize()
  }
}
</script>

<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
