<!-- 图片裁剪组件 github: https://github.com/acccccccb/vue-img-cutter -->
<template>
  <div class="cutter-container">
    <div class="cutter-component">
      <div class="title">{{ title }}</div>
      <ImgCutter
        ref="imgCutterModal"
        v-bind="cutterProps"
        class="img-cutter"
        @cutDown="cutDownImg"
        @error="handleError"
        @onChooseImg="handleChooseImg"
        @onPrintImg="cutterPrintImg"
        @onImageLoadComplete="handleImageLoadComplete"
        @onImageLoadError="handleImageLoadError"
        @onClearAll="handleClearAll"
      >
        <template #choose>
          <ElButton type="primary" plain>选择图片</ElButton>
        </template>
        <template #cancel>
          <ElButton type="danger" plain @click="requestClear">清除</ElButton>
        </template>
        <template #confirm>
          <ElButton type="success" plain>确认裁剪</ElButton>
        </template>
      </ImgCutter>
    </div>

    <div v-if="showPreview" class="preview-container">
      <div class="title">{{ previewTitle }}</div>
      <div
        class="preview-box"
        :style="{
          width: `${cutterProps.cutWidth}px`,
          height: `${cutterProps.cutHeight}px`
        }"
      >
        <img
          v-if="temImgPath"
          class="preview-img"
          :src="temImgPath"
          alt="预览图"
        />
      </div>
      <ElButton
        class="download-btn"
        :disabled="!temImgPath"
        @click="downloadImg"
      >
        下载图片
      </ElButton>
    </div>
  </div>
</template>

<script setup>
import ImgCutter from 'vue-img-cutter'
import 'vue-img-cutter/vue-img-cutter.css'

defineOptions({ name: 'ImageCutter' })

/**
 * 图片裁剪
 * @property {string} imgUrl 输入图片（支持 v-model:imgUrl，裁剪结果回传 dataURL）
 * @property {string} title 标题
 * @property {string} previewTitle 预览标题
 * @property {boolean} showPreview 是否显示预览
 * @property {number} boxWidth 容器宽度
 * @property {number} boxHeight 容器高度
 * @property {number} cutWidth 裁剪宽度
 * @property {number} cutHeight 裁剪高度
 * @property {boolean} sizeChange 是否允许调整裁剪框大小
 * @property {boolean} moveAble 是否允许移动裁剪框
 * @property {boolean} imgMove 是否允许移动图片
 * @property {boolean} scaleAble 是否允许缩放
 * @property {boolean} originalGraph 是否显示原始图片
 * @property {boolean} crossOrigin 是否允许跨域
 * @property {string} fileType 输出文件类型 png | jpeg | webp
 * @property {number} quality 输出质量
 * @property {string} watermarkText 水印文本
 * @property {number} watermarkFontSize 水印字体大小
 * @property {string} watermarkColor 水印颜色
 * @property {boolean} saveCutPosition 是否保存裁剪位置
 * @property {boolean} previewMode 是否预览模式
 * @property {boolean} tool 是否显示工具栏
 * @property {string} toolBgc 工具栏背景色
 * @property {string} rate 裁剪框比例，例如 16:9
 * @property {string} accept 允许选择的文件类型
 */
const props = defineProps({
  imgUrl: { type: String, default: '' },
  isModal: { type: Boolean, default: false },
  showChooseBtn: { type: Boolean, default: true },
  lockScroll: { type: Boolean, default: true },
  label: { type: String, default: '选择图片' },
  modalTitle: { type: String, default: '图片裁剪' },
  tool: { type: Boolean, default: true },
  toolBgc: { type: String, default: '#fff' },
  title: { type: String, default: '' },
  previewTitle: { type: String, default: '' },
  showPreview: { type: Boolean, default: true },
  boxWidth: { type: Number, default: 700 },
  boxHeight: { type: Number, default: 458 },
  cutWidth: { type: Number, default: 470 },
  cutHeight: { type: Number, default: 270 },
  rate: { type: String, default: '' },
  sizeChange: { type: Boolean, default: true },
  moveAble: { type: Boolean, default: true },
  imgMove: { type: Boolean, default: true },
  scaleAble: { type: Boolean, default: true },
  originalGraph: { type: Boolean, default: true },
  crossOrigin: { type: Boolean, default: true },
  crossOriginHeader: { type: String, default: 'anonymous' },
  cuttingOriginal: { type: Boolean, default: false },
  fileType: { type: String, default: 'png' },
  quality: { type: Number, default: 0.9 },
  accept: {
    type: String,
    default: 'image/gif, image/jpeg, image/png, image/webp'
  },
  watermarkText: { type: String, default: '' },
  watermarkFontSize: { type: Number, default: 20 },
  watermarkTextFont: { type: String, default: '' },
  watermarkColor: { type: String, default: '#ffffff' },
  watermarkTextColor: { type: String, default: '' },
  watermarkTextX: { type: Number, default: 0.95 },
  watermarkTextY: { type: Number, default: 0.95 },
  smallToUpload: { type: Boolean, default: false },
  saveCutPosition: { type: Boolean, default: true },
  previewMode: { type: Boolean, default: true },
  toolBoxOverflow: { type: Boolean, default: true },
  doNotDisplayCopyright: { type: Boolean, default: true },
  index: { type: [String, Number], default: null },
  afterChooseImg: { type: Function, default: null }
})

const emit = defineEmits([
  'update:imgUrl',
  'error',
  'choose',
  'clear',
  'cut',
  'print',
  'imageLoadComplete',
  'imageLoadError'
])

const temImgPath = ref('')
const imgCutterModal = ref()
const latestResult = ref(null)
let latestInternalResult = ''
let initRequestId = 0
let clearRequested = false

// ImgCutter 的水印参数使用大写字段名，不能直接使用包装组件的字段名。
const cutterProps = computed(() => ({
  isModal: props.isModal,
  showChooseBtn: props.showChooseBtn,
  lockScroll: props.lockScroll,
  label: props.label,
  modalTitle: props.modalTitle,
  tool: props.tool,
  toolBgc: props.toolBgc,
  boxWidth: props.boxWidth,
  boxHeight: props.boxHeight,
  cutWidth: props.cutWidth,
  cutHeight: props.cutHeight,
  rate: props.rate || null,
  sizeChange: props.sizeChange,
  moveAble: props.moveAble,
  imgMove: props.imgMove,
  scaleAble: props.scaleAble,
  originalGraph: props.originalGraph,
  crossOrigin: props.crossOrigin,
  crossOriginHeader: props.crossOriginHeader,
  CuttingOriginal: props.cuttingOriginal,
  fileType: props.fileType,
  quality: props.quality,
  accept: props.accept,
  smallToUpload: props.smallToUpload,
  saveCutPosition: props.saveCutPosition,
  previewMode: props.previewMode,
  toolBoxOverflow: props.toolBoxOverflow,
  DoNotDisplayCopyright: props.doNotDisplayCopyright,
  index: props.index,
  afterChooseImg: props.afterChooseImg,
  WatermarkText: props.watermarkText,
  WatermarkTextFont:
    props.watermarkTextFont || `${props.watermarkFontSize}px Sans-serif`,
  WatermarkTextColor: props.watermarkTextColor || props.watermarkColor,
  WatermarkTextX: props.watermarkTextX,
  WatermarkTextY: props.watermarkTextY
}))

// 图片预加载
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (props.crossOrigin) img.crossOrigin = props.crossOriginHeader
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

// 初始化裁剪器
async function initImgCutter() {
  if (!props.imgUrl) return
  const requestId = ++initRequestId
  const imageUrl = props.imgUrl

  try {
    await preloadImage(imageUrl)
    await nextTick()
    if (requestId !== initRequestId || imageUrl !== props.imgUrl) return

    imgCutterModal.value?.handleOpen({
      name: '图片',
      src: imageUrl
    })
  } catch (error) {
    emit('error', error)
  }
}

onMounted(() => {
  if (props.imgUrl) {
    temImgPath.value = props.imgUrl
    initImgCutter()
  }
})

watch(
  () => props.imgUrl,
  (newVal) => {
    if (newVal === latestInternalResult) {
      latestInternalResult = ''
      return
    }

    initRequestId += 1
    if (!newVal) {
      temImgPath.value = ''
      latestResult.value = null
      imgCutterModal.value?.handleClose()
      return
    }

    temImgPath.value = newVal
    initImgCutter()
  }
)

// 实时预览
function cutterPrintImg(result) {
  if (!result?.dataURL) return
  temImgPath.value = result.dataURL
  latestResult.value = result
  emit('print', result)
}

// 裁剪完成
function cutDownImg(result) {
  if (!result?.dataURL) return
  temImgPath.value = result.dataURL
  latestResult.value = result
  latestInternalResult = result.dataURL
  emit('update:imgUrl', result.dataURL)
  emit('cut', result)
}

// 选择新图片
function handleChooseImg(result) {
  emit('choose', result)
}

// 标记用户主动点击清除，避免把确认裁剪时内部的 clearAll 误判为清除操作。
function requestClear() {
  clearRequested = true
}

// 捕获文件类型、读取失败和无图片等通用错误
function handleError(error) {
  emit('error', error)
}

// 图片加载完成
function handleImageLoadComplete(result) {
  emit('imageLoadComplete', result)
}

// 图片加载失败
function handleImageLoadError(error) {
  emit('imageLoadError', error)
}

// 清除所有
function handleClearAll() {
  const shouldEmitClear = clearRequested
  clearRequested = false
  temImgPath.value = ''
  latestResult.value = null
  latestInternalResult = ''
  if (shouldEmitClear) {
    emit('update:imgUrl', '')
    emit('clear')
  }
}

// 下载图片
function downloadImg() {
  if (!temImgPath.value) return
  const a = document.createElement('a')
  a.href = temImgPath.value
  a.download =
    latestResult.value?.fileName || `image.${props.fileType || 'png'}`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
</script>

<style lang="scss" scoped>
.cutter-container {
  display: flex;
  flex-flow: row wrap;

  .title {
    padding-bottom: 10px;
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .cutter-component {
    margin-right: 30px;
  }

  .preview-container {
    .preview-box {
      background-color: var(--color-bg-active);

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .download-btn {
      display: block;
      margin: 20px auto;
    }
  }

  :deep(.toolBoxControl) {
    z-index: 100;
  }

  :deep(.dockMain) {
    right: 0;
    bottom: -40px;
    left: 0;
    z-index: 10;
    padding: 0;
    background-color: transparent !important;
    opacity: 1;
  }

  :deep(.copyright) {
    display: none !important;
  }

  :deep(.i-dialog-footer) {
    margin-top: 60px !important;
  }

  :deep(.dockBtn) {
    height: 26px;
    padding: 0 10px;
    font-size: 12px;
    line-height: 26px;
    color: var(--el-color-primary) !important;
    background-color: var(--el-color-primary-light-9) !important;
    border: 1px solid var(--el-color-primary-light-4) !important;
  }

  :deep(.dockBtnScrollBar) {
    margin: 0 10px 0 6px;
    background-color: var(--el-color-primary-light-1);
  }

  :deep(.scrollBarControl) {
    border-color: var(--el-color-primary);
  }

  :deep(.closeIcon) {
    line-height: 15px !important;
  }
}
</style>

<style lang="scss">
/* 暗色主题下裁剪器内部样式适配 */
html[data-theme='dark'],
html.dark {
  .cutter-container {
    .toolBox {
      border: transparent;
    }

    .dialogMain {
      background-color: transparent !important;
    }

    .i-dialog-footer .btn {
      background-color: var(--el-color-primary) !important;
      border: transparent;
    }
  }
}
</style>
