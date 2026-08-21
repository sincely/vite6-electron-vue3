<!-- 二维码：基于 qrcode 库，支持 canvas / svg 渲染与中心 Logo -->
<template>
  <div class="qr-code" :style="{ width: `${size}px`, height: `${size}px` }">
    <canvas v-show="renderAs === 'canvas'" ref="canvasRef" />
    <div v-if="renderAs === 'svg'" class="qr-code__svg" v-html="svgHtml"></div>
  </div>
</template>

<script setup>
import QRCode from 'qrcode'

defineOptions({ name: 'QrCode' })

/**
 * 二维码
 * @property {string} value 二维码内容
 * @property {number} size 尺寸（px）
 * @property {string} level 容错级别 L | M | Q | H
 * @property {string} renderAs 渲染方式 canvas | svg
 * @property {number} margin 边距（码元数）
 * @property {string} background 背景色
 * @property {string} foreground 前景色
 * @property {object} imageSettings 中心 Logo 配置 { src, width, height, excavate }
 */
const props = defineProps({
  value: { type: String, default: '' },
  size: { type: Number, default: 128 },
  level: { type: String, default: 'M' },
  renderAs: { type: String, default: 'canvas' },
  margin: { type: Number, default: 4 },
  background: { type: String, default: '#ffffff' },
  foreground: { type: String, default: '#000000' },
  imageSettings: { type: Object, default: null }
})

const canvasRef = ref()
const svgHtml = ref('')

const baseOptions = () => ({
  errorCorrectionLevel: props.level,
  margin: props.margin,
  width: props.size,
  color: {
    dark: props.foreground,
    light: props.background
  }
})

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

/** canvas 渲染 + Logo 叠加 */
async function renderCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !props.value) return

  await QRCode.toCanvas(canvas, props.value, baseOptions())

  const settings = props.imageSettings
  if (!settings?.src) return

  try {
    const img = await loadImage(settings.src)
    const ctx = canvas.getContext('2d')
    const w = settings.width ?? props.size * 0.2
    const h = settings.height ?? w
    const x = (props.size - w) / 2
    const y = (props.size - h) / 2

    // excavate：先挖出 logo 背景区域，避免遮挡码点
    if (settings.excavate) {
      ctx.fillStyle = props.background
      ctx.fillRect(x - 2, y - 2, w + 4, h + 4)
    }
    ctx.drawImage(img, x, y, w, h)
  } catch (error) {
    console.error('二维码 Logo 加载失败:', error)
  }
}

/** svg 渲染 + Logo 注入 */
async function renderSvg() {
  if (!props.value) {
    svgHtml.value = ''
    return
  }

  let svg = await QRCode.toString(props.value, {
    ...baseOptions(),
    type: 'svg'
  })

  // toString 输出的 viewBox 以码元为单位，按比例换算 logo 坐标
  const settings = props.imageSettings
  if (settings?.src) {
    const vbMatch = svg.match(/viewBox="0 0 (\d+) (\d+)"/)
    const vbSize = vbMatch ? Number(vbMatch[1]) : 0

    if (vbSize) {
      const scale = vbSize / props.size
      const w = (settings.width ?? props.size * 0.2) * scale
      const h = (settings.height ?? settings.width ?? props.size * 0.2) * scale
      const x = (vbSize - w) / 2
      const y = (vbSize - h) / 2

      let logoMarkup = ''
      if (settings.excavate) {
        logoMarkup += `<rect x="${x - 1}" y="${y - 1}" width="${w + 2}" height="${h + 2}" fill="${props.background}"/>`
      }
      logoMarkup += `<image href="${settings.src}" x="${x}" y="${y}" width="${w}" height="${h}"/>`

      svg = svg.replace('</svg>', `${logoMarkup}</svg>`)
    }
  }

  // 固定输出尺寸
  svg = svg.replace(
    '<svg ',
    `<svg width="${props.size}" height="${props.size}" `
  )
  svgHtml.value = svg
}

function render() {
  if (props.renderAs === 'svg') renderSvg()
  else renderCanvas()
}

watch(
  () => [
    props.value,
    props.size,
    props.level,
    props.renderAs,
    props.margin,
    props.background,
    props.foreground,
    props.imageSettings
  ],
  () => render(),
  { deep: true }
)

onMounted(render)
</script>

<style lang="scss" scoped>
.qr-code {
  display: inline-block;

  canvas {
    display: block;
  }

  &__svg {
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      display: block;
    }
  }
}
</style>
