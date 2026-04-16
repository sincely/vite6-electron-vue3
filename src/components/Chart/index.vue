<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { echarts } from '@/plugins'
import { useDebounceFn, useResizeObserver } from '@vueuse/core'
import { markRaw, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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

onMounted(() => {
  init()
  window.addEventListener('resize', resizeChart)
})

// 原来写的是 onBeforeMount（组件挂载前触发，此时 chart.value 必然为 null，永远不会清理）
// 修复为 onBeforeUnmount，确保组件销毁时正确释放 ECharts 实例
onBeforeUnmount(() => {
  scheduleResize.cancel()
  if (chart.value) {
    chart.value.dispose()
    chart.value = null
  }
  window.removeEventListener('resize', resizeChart)
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

function resizeChart() {
  if (chart.value) {
    chart.value.resize()
  }
}

const scheduleResize = useDebounceFn(() => {
  resizeChart()
}, 16)

useResizeObserver(chartRef, () => {
  scheduleResize()
})

watch(
  () => [props.width, props.height],
  async () => {
    await nextTick()
    scheduleResize()
  }
)
</script>

<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
