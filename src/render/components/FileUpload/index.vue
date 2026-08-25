<!-- 通用文件上传组件：基于 Element Plus ElUpload 封装 -->
<template>
  <div
    class="file-upload"
    :class="[
      `file-upload--${uploadProps.listType}`,
      { 'is-disabled': uploadProps.disabled, 'is-drag': uploadProps.drag }
    ]"
  >
    <ElUpload
      ref="uploadRef"
      v-model:file-list="fileList"
      v-bind="uploadProps"
      class="file-upload__control"
      :show-file-list="false"
      :before-upload="handleBeforeUpload"
      :before-remove="handleBeforeRemove"
      @update:file-list="handleFileListUpdate"
      @change="handleChange"
      @progress="handleProgress"
      @success="handleSuccess"
      @error="handleError"
      @remove="handleRemove"
      @preview="handlePreview"
      @exceed="handleExceed"
    >
      <template v-if="canChooseMore">
        <slot>
          <div v-if="uploadProps.drag" class="file-upload__drag-content">
            <el-icon class="file-upload__drag-icon"><UploadFilled /></el-icon>
            <span>{{ presentationProps.dragText }}</span>
          </div>
          <ElButton v-else type="primary" :disabled="uploadProps.disabled">
            <el-icon><Upload /></el-icon>
            {{ presentationProps.buttonText }}
          </ElButton>
        </slot>
      </template>

      <template #tip>
        <slot name="tip">
          <div v-if="presentationProps.tip" class="file-upload__tip">
            {{ presentationProps.tip }}
          </div>
        </slot>
      </template>
    </ElUpload>

    <TransitionGroup
      v-if="fileList.length"
      name="file-upload-list"
      tag="ul"
      class="file-upload__list"
    >
      <li
        v-for="file in fileList"
        :key="file.uid"
        class="file-upload__item"
        :class="[`is-${file.status || 'ready'}`]"
      >
        <button
          v-if="isImageFile(file)"
          class="file-upload__thumb"
          type="button"
          :title="canPreview(file) ? '预览图片' : '图片暂不可预览'"
          :disabled="!canPreview(file)"
          @click="handlePreview(file)"
        >
          <img
            v-if="getPreviewUrl(file)"
            :src="getPreviewUrl(file)"
            :alt="file.name"
          />
          <el-icon v-else><Picture /></el-icon>
        </button>
        <div v-else class="file-upload__file-icon">
          <el-icon><Document /></el-icon>
        </div>

        <div class="file-upload__main">
          <div class="file-upload__name" :title="file.name">
            {{ file.name }}
          </div>
          <div v-if="file.status === 'uploading'" class="file-upload__progress">
            <ElProgress
              :percentage="file.percentage || 0"
              :stroke-width="6"
              :show-text="false"
            />
            <span>{{ Math.round(file.percentage || 0) }}%</span>
          </div>
          <div
            v-else-if="file.status === 'error'"
            class="file-upload__status is-error"
          >
            上传失败，可删除后重试
          </div>
          <div
            v-else-if="file.status === 'success'"
            class="file-upload__status is-success"
          >
            上传成功
          </div>
        </div>

        <div class="file-upload__actions">
          <ElButton
            v-if="isImageFile(file) && canPreview(file)"
            link
            type="primary"
            title="预览"
            @click="handlePreview(file)"
          >
            <el-icon><View /></el-icon>
          </ElButton>
          <ElButton
            link
            type="danger"
            title="删除"
            :disabled="uploadProps.disabled"
            @click="handleRemoveClick(file)"
          >
            <el-icon><Delete /></el-icon>
          </ElButton>
        </div>
      </li>
    </TransitionGroup>

    <ElImageViewer
      v-if="previewVisible"
      :url-list="previewImageUrls"
      :initial-index="previewIndex"
      teleported
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ElImageViewer, ElMessage } from 'element-plus'
import {
  Delete,
  Document,
  Picture,
  Upload,
  UploadFilled,
  View
} from '@element-plus/icons-vue'

import { cloneFileList } from './helpers'
import { getResponseUrl, isImageFile, releaseObjectUrl } from './file-url'
import { validateFile } from './file-validator'
import { syncFromModel } from './file-normalize'

defineOptions({ name: 'FileUpload' })

/**
 * 通用文件上传组件。
 *
 * modelValue 始终以数组形式回传。数组元素兼容：
 * - URL 字符串：['https://example.com/a.png']
 * - Element Plus UploadFile / UploadUserFile 对象
 *
 * uploadConfig 支持透传 ElUpload 配置；同名的直接 props 优先级更高。
 * maxSize / uploadConfig.maxFileSize 使用字节作为单位。
 */
const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  action: { type: String, default: undefined },
  headers: { type: Object, default: undefined },
  data: { type: Object, default: undefined },
  name: { type: String, default: undefined },
  method: { type: String, default: undefined },
  withCredentials: { type: Boolean, default: undefined },
  multiple: { type: Boolean, default: undefined },
  limit: { type: Number, default: undefined },
  accept: { type: String, default: undefined },
  fileTypes: { type: [Array, String], default: undefined },
  maxSize: { type: Number, default: undefined },
  drag: { type: Boolean, default: undefined },
  autoUpload: { type: Boolean, default: undefined },
  disabled: { type: Boolean, default: undefined },
  listType: { type: String, default: undefined },
  showPreview: { type: Boolean, default: undefined },
  responseUrlKey: { type: String, default: undefined },
  beforeUpload: { type: Function, default: undefined },
  beforeRemove: { type: Function, default: undefined },
  httpRequest: { type: Function, default: undefined },
  uploadConfig: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'progress',
  'success',
  'error',
  'remove',
  'preview',
  'exceed',
  'validate-error',
  'before-upload-error'
])

// 组件实例内部状态
const uploadRef = ref()
const fileList = ref([])
const previewVisible = ref(false)
const previewIndex = ref(0)
const objectUrlMap = new Map()

const getConfigOption = (key, fallback) => {
  if (props[key] !== undefined) return props[key]
  if (props.uploadConfig[key] !== undefined) return props.uploadConfig[key]
  return fallback
}

const resolvedMultiple = computed(() => !!getConfigOption('multiple', false))
const resolvedLimit = computed(() => {
  const limit = Number(
    getConfigOption('limit', props.uploadConfig.maxNumberOfFiles || 0)
  )
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 0
  return resolvedMultiple.value ? normalizedLimit : 1
})
const resolvedFileTypes = computed(() => {
  const value = getConfigOption(
    'fileTypes',
    props.uploadConfig.allowedFileTypes || []
  )
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value || '')
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
})
const resolvedAccept = computed(() => {
  const accept = getConfigOption('accept', '')
  if (accept) return accept
  return resolvedFileTypes.value
    .map((type) => {
      if (type.includes('/') || type.startsWith('.')) return type
      return `.${type}`
    })
    .join(',')
})
const resolvedMaxSize = computed(() => {
  const maxSize = getConfigOption(
    'maxSize',
    props.uploadConfig.maxFileSize || 0
  )
  const normalizedMaxSize = Number(maxSize)
  return Number.isFinite(normalizedMaxSize) && normalizedMaxSize > 0
    ? normalizedMaxSize
    : 0
})
const resolvedShowPreview = computed(() => getConfigOption('showPreview', true))
const resolvedBeforeUpload = computed(
  () => props.beforeUpload || props.uploadConfig.beforeUpload
)
const resolvedBeforeRemove = computed(
  () => props.beforeRemove || props.uploadConfig.beforeRemove
)
const resolvedHttpRequest = computed(
  () => props.httpRequest || props.uploadConfig.httpRequest
)
const resolvedResponseUrlKey = computed(() =>
  getConfigOption('responseUrlKey', 'url')
)

const uploadProps = computed(() => {
  const passThroughConfig = { ...props.uploadConfig }
  ;[
    'allowedFileTypes',
    'autoUpload',
    'beforeRemove',
    'beforeUpload',
    'buttonText',
    'dragText',
    'fileTypes',
    'httpRequest',
    'maxFileSize',
    'maxNumberOfFiles',
    'maxSize',
    'responseUrlKey',
    'showPreview',
    'tip'
  ].forEach((key) => delete passThroughConfig[key])

  return {
    ...passThroughConfig,
    action: getConfigOption('action', ''),
    headers: getConfigOption('headers', {}),
    data: getConfigOption('data', {}),
    name: getConfigOption('name', 'file'),
    method: getConfigOption('method', 'post'),
    withCredentials: getConfigOption('withCredentials', false),
    multiple: resolvedMultiple.value,
    limit: resolvedLimit.value,
    accept: resolvedAccept.value,
    drag: !!getConfigOption('drag', false),
    autoUpload: getConfigOption('autoUpload', true),
    disabled: !!getConfigOption('disabled', false),
    listType: getConfigOption('listType', 'text'),
    ...(resolvedHttpRequest.value
      ? { httpRequest: resolvedHttpRequest.value }
      : {})
  }
})

const presentationProps = computed(() => ({
  buttonText: getConfigOption('buttonText', '选择文件'),
  dragText: getConfigOption('dragText', '将文件拖到此处，或点击上传'),
  tip: getConfigOption('tip', '')
}))

const canChooseMore = computed(
  () =>
    !uploadProps.value.disabled &&
    (resolvedLimit.value === 0 || fileList.value.length < resolvedLimit.value)
)

// 给 file-url 模块绑定组件实例的对象 URL 表 + 响应式 responseUrlKey
const getResponseUrlForFile = (file) =>
  getResponseUrl(file?.response, resolvedResponseUrlKey.value)

const getPreviewUrl = (file) => {
  if (!file) return ''
  if (file.url) return file.url

  const responseUrl = getResponseUrlForFile(file)
  if (responseUrl) return responseUrl

  if (
    file.raw &&
    isImageFile(file, resolvedResponseUrlKey.value) &&
    typeof URL !== 'undefined' &&
    URL.createObjectURL
  ) {
    if (!objectUrlMap.has(file.uid)) {
      objectUrlMap.set(file.uid, URL.createObjectURL(file.raw))
    }
    return objectUrlMap.get(file.uid)
  }

  return ''
}

const previewableFiles = computed(() =>
  fileList.value.filter(
    (file) =>
      isImageFile(file, resolvedResponseUrlKey.value) && getPreviewUrl(file)
  )
)
const previewImageUrls = computed(() =>
  previewableFiles.value.map((file) => getPreviewUrl(file))
)

const canPreview = (file) =>
  !!resolvedShowPreview.value &&
  isImageFile(file, resolvedResponseUrlKey.value) &&
  !!getPreviewUrl(file)

const syncFromModelValue = (value) => {
  fileList.value = syncFromModel(
    value,
    fileList.value,
    resolvedLimit.value,
    objectUrlMap,
    resolvedResponseUrlKey.value
  )
}

const emitModelValue = (files = fileList.value) => {
  emit('update:modelValue', cloneFileList(files))
}

const showError = (message) => {
  if (message) ElMessage.error(message)
}

const handleBeforeUpload = async (rawFile) => {
  const validationMessage = validateFile(
    rawFile,
    resolvedFileTypes.value,
    resolvedMaxSize.value
  )
  if (validationMessage) {
    showError(validationMessage)
    emit('validate-error', rawFile, validationMessage)
    return false
  }

  if (!resolvedBeforeUpload.value) return true

  try {
    const result = await resolvedBeforeUpload.value(rawFile, cloneFileList())
    return result !== false
  } catch (error) {
    emit('before-upload-error', error, rawFile)
    showError(error?.message || '上传前校验未通过')
    return false
  }
}

const handleBeforeRemove = async (uploadFile, uploadFiles) => {
  if (!resolvedBeforeRemove.value) return true
  const result = await resolvedBeforeRemove.value(uploadFile, uploadFiles)
  return result !== false
}

const handleFileListUpdate = (files) => {
  fileList.value = files || []
}

const handleChange = (uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
  if (uploadFile?.raw) getPreviewUrl(uploadFile)
  emitModelValue(uploadFiles)
  emit('change', uploadFile, uploadFiles)
}

const handleProgress = (event, uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
  emitModelValue(uploadFiles)
  emit('progress', event, uploadFile, uploadFiles)
}

const handleSuccess = (response, uploadFile, uploadFiles) => {
  const url = getResponseUrl(response, resolvedResponseUrlKey.value)
  if (url && !uploadFile.url) uploadFile.url = url
  fileList.value = uploadFiles
  emitModelValue(uploadFiles)
  emit('success', response, uploadFile, uploadFiles)
}

const handleError = (error, uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
  emitModelValue(uploadFiles)
  emit('error', error, uploadFile, uploadFiles)
}

const handleRemove = (uploadFile, uploadFiles) => {
  releaseObjectUrl(uploadFile.uid, objectUrlMap)
  fileList.value = uploadFiles
  emitModelValue(uploadFiles)
  emit('remove', uploadFile, uploadFiles)
}

const handleRemoveClick = (file) => {
  uploadRef.value?.handleRemove(file)
}

const clearFiles = () => {
  fileList.value.forEach((file) => releaseObjectUrl(file.uid, objectUrlMap))
  uploadRef.value?.clearFiles()
  fileList.value = []
  emitModelValue([])
}

const handlePreview = (file) => {
  emit('preview', file)
  if (!canPreview(file)) return
  const index = previewableFiles.value.findIndex(
    (previewFile) => previewFile.uid === file.uid
  )
  previewIndex.value = index > -1 ? index : 0
  previewVisible.value = true
}

const handleExceed = (files, uploadFiles) => {
  const message = resolvedLimit.value
    ? `最多只能上传 ${resolvedLimit.value} 个文件`
    : '文件数量超出限制'
  showError(message)
  emit('exceed', files, uploadFiles)
}

watch(
  () => props.modelValue,
  (value) => syncFromModelValue(value),
  { immediate: true, deep: true }
)

watch(
  () => [resolvedLimit.value, resolvedMultiple.value],
  () => syncFromModelValue(props.modelValue)
)

onBeforeUnmount(() => {
  objectUrlMap.forEach((objectUrl) => {
    if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
      URL.revokeObjectURL(objectUrl)
    }
  })
  objectUrlMap.clear()
})

defineExpose({
  submit: () => uploadRef.value?.submit(),
  abort: (file) => uploadRef.value?.abort(file),
  clearFiles,
  getFileList: () => cloneFileList(),
  getUploadRef: () => uploadRef.value
})
</script>

<style lang="scss" scoped>
.file-upload {
  width: 100%;

  &__control {
    display: inline-block;
    max-width: 100%;
  }

  &__drag-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    min-width: 260px;
    min-height: 120px;
    color: var(--el-text-color-regular);
  }

  &__drag-icon {
    font-size: 28px;
    color: var(--el-color-primary);
  }

  &__tip {
    margin-top: 7px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(100%, 560px);
    padding: 0;
    margin: 10px 0 0;
    list-style: none;
  }

  &__item {
    display: flex;
    align-items: center;
    min-height: 56px;
    padding: 8px 10px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-primary-light-5);
    }
  }

  &__thumb,
  &__file-icon {
    display: inline-flex;
    flex: 0 0 40px;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    overflow: hidden;
    font-size: 22px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border: 0;
    border-radius: 4px;
  }

  &__thumb {
    padding: 0;
    cursor: pointer;

    &:disabled {
      cursor: default;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
    margin: 0 12px;
  }

  &__name {
    overflow: hidden;
    font-size: 13px;
    line-height: 20px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__progress {
    display: flex;
    gap: 8px;
    align-items: center;

    :deep(.el-progress) {
      flex: 1;
    }

    span {
      flex: 0 0 34px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: right;
    }
  }

  &__status {
    font-size: 12px;
    line-height: 18px;

    &.is-success {
      color: var(--el-color-success);
    }

    &.is-error {
      color: var(--el-color-danger);
    }
  }

  &__actions {
    display: flex;
    flex: 0 0 auto;
    gap: 2px;
    align-items: center;

    :deep(.el-button) {
      padding: 4px;
    }
  }

  &--picture-card {
    .file-upload__list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
  }

  &.is-disabled {
    opacity: 0.7;
  }
}

.file-upload-list-enter-active,
.file-upload-list-leave-active {
  transition: all 0.2s ease;
}

.file-upload-list-enter-from,
.file-upload-list-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
