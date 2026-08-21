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
        @onPrintImg="cutterPrintImg"
        @onImageLoadComplete="handleImageLoadComplete"
        @onImageLoadError="handleImageLoadError"
        @onClearAll="handleClearAll"
      >
        <template #choose>
          <ElButton type="primary" plain>选择图片</ElButton>
        </template>
        <template #cancel>
          <ElButton type="danger" plain>清除</ElButton>
        </template>
        <template #confirm>
          <div></div>
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
 */
const props = defineProps({
  imgUrl: { type: String, default: '' },
  isModal: { type: Boolean, default: false },
  tool: { type: Boolean, default: true },
  toolBgc: { type: String, default: '#fff' },
  title: { type: String, default: '' },
  previewTitle: { type: String, default: '' },
  showPreview: { type: Boolean, default: true },
  boxWidth: { type: Number, default: 700 },
  boxHeight: { type: Number, default: 458 },
  cutWidth: { type: Number, default: 470 },
  cutHeight: { type: Number, default: 270 },
  sizeChange: { type: Boolean, default: true },
  moveAble: { type: Boolean, default: true },
  imgMove: { type: Boolean, default: true },
  scaleAble: { type: Boolean, default: true },
  originalGraph: { type: Boolean, default: true },
  crossOrigin: { type: Boolean, default: true },
  fileType: { type: String, default: 'png' },
  quality: { type: Number, default: 0.9 },
  watermarkText: { type: String, default: '' },
  watermarkFontSize: { type: Number, default: 20 },
  watermarkColor: { type: String, default: '#ffffff' },
  saveCutPosition: { type: Boolean, default: true },
  previewMode: { type: Boolean, default: true }
})

const emit = defineEmits([
  'update:imgUrl',
  'error',
  'imageLoadComplete',
  'imageLoadError'
])

const temImgPath = ref('')
const imgCutterModal = ref()

// 整合所有 ImgCutter 的 props（水印字段需按其要求的大写命名透传）
const cutterProps = computed(() => ({
  ...props,
  WatermarkText: props.watermarkText,
  WatermarkFontSize: props.watermarkFontSize,
  WatermarkColor: props.watermarkColor
}))

// 图片预加载
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

// 初始化裁剪器
async function initImgCutter() {
  if (!props.imgUrl) return
  try {
    await preloadImage(props.imgUrl)
    imgCutterModal.value?.handleOpen({
      name: '封面图片',
      src: props.imgUrl
    })
  } catch (error) {
    emit('error', error)
    console.error('图片加载失败:', error)
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
    if (newVal) {
      temImgPath.value = newVal
      initImgCutter()
    }
  }
)

// 实时预览
function cutterPrintImg(result) {
  temImgPath.value = result.dataURL
}

// 裁剪完成
function cutDownImg(result) {
  emit('update:imgUrl', result.dataURL)
}

// 图片加载完成
function handleImageLoadComplete(result) {
  emit('imageLoadComplete', result)
}

// 图片加载失败
function handleImageLoadError(error) {
  emit('error', error)
  emit('imageLoadError', error)
}

// 清除所有
function handleClearAll() {
  temImgPath.value = ''
}

// 下载图片
function downloadImg() {
  const a = document.createElement('a')
  a.href = temImgPath.value
  a.download = 'image.png'
  a.click()
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
