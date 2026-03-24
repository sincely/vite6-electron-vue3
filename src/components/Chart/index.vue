<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { markRaw, onBeforeMount, onMounted, onUnmounted, ref, watch } from 'vue'
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
    default: 'auto'
  },
  height: {
    type: [Number, String],
    default: 'auto'
  }
})

const emit = defineEmits(['init'])

const chart = ref(null)
const chartRef = ref()

watch(
  () => props.options,
  () => init(),
  {
    deep: true
  }
)

onMounted(() => {
  init()
  window.addEventListener('resize', resizeChart)
})

onBeforeMount(() => {
  if (!chart.value) {
    return
  }
  chart.value.dispose()
  chart.value = null
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
})
/**
 * 初始化
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
  // 初始化图表
  chart.value = markRaw(
    echarts.init(chartRef.value, 'chart', {
      width: props.width,
      height: props.height
    })
  )

  setTimeout(() => {
    // 设置true清空echart缓存
    chart.value.setOption(props.options, true)
    resizeChart()
    emit('init', chart.value)
  }, 100)
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
