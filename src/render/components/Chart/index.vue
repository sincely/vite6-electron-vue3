<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { echarts } from '@/plugins'
import { markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
 * 初始化（只在 onMounted 调用一次）
 * @private
 */
function init() {
  // 注册主题
  echarts.registerTheme('chart', {
    legend: {
      itemWidth: 14,
      itemHeight: 14
    },
    bar: {
      barWidth: 30,
      backgroundStyle: {
        color: 'rgba(180, 180, 180, 0.2)'
      },
      showBackground: true
    }
  })

  // 初始化图表实例
  // 只在有明确值时才传 width/height，否则让 ECharts 自动检测容器大小
  const initOpts = {}
  if (props.width != null) initOpts.width = props.width
  if (props.height != null) initOpts.height = props.height
  chart.value = markRaw(echarts.init(chartRef.value, 'chart', initOpts))

  setTimeout(() => {
    if (!chart.value) return
    // options 为空时不调用 setOption，避免报错
    if (props.options && Object.keys(props.options).length) {
      chart.value.setOption(props.options, true)
    }
    resizeChart()
    emit('init', chart.value)
  }, 100)
}

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
