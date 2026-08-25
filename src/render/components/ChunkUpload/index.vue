<template>
  <div class="chunk-upload" :class="{ 'is-disabled': disabled }">
    <input
      ref="inputRef"
      class="chunk-upload__input"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleInputChange"
    />

    <div
      class="chunk-upload__dropzone"
      :class="{ 'is-dragover': isDragover }"
      role="button"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div class="chunk-upload__drop-icon">
        <Icon icon="lucide:cloud-upload" :width="28" :height="28" />
      </div>
      <div class="chunk-upload__drop-copy">
        <p class="chunk-upload__drop-title">
          拖拽文件到这里，或
          <button
            type="button"
            class="chunk-upload__browse"
            @click.stop="openPicker"
          >
            点击选择
          </button>
        </p>
        <p class="chunk-upload__hint">
          {{ typeText }} · {{ multiple ? '支持多文件' : '单文件上传' }}
          <span v-if="chunkSizeLabel">· 分片 {{ chunkSizeLabel }}</span>
        </p>
      </div>
    </div>

    <p
      v-if="feedback"
      class="chunk-upload__feedback"
      :class="`is-${feedback.type}`"
    >
      <Icon
        :icon="
          feedback.type === 'error'
            ? 'lucide:circle-alert'
            : 'lucide:circle-check'
        "
        :width="15"
        :height="15"
      />
      {{ feedback.message }}
    </p>

    <div v-if="fileList.length" class="chunk-upload__list">
      <div class="chunk-upload__list-header">
        <span>文件列表（{{ fileList.length }}）</span>
        <span v-if="activeCount" class="chunk-upload__active-count">
          <i class="chunk-upload__pulse"></i>
          {{ activeCount }} 个任务处理中
        </span>
      </div>

      <div v-for="item in fileList" :key="item.uid" class="chunk-upload__item">
        <div
          class="chunk-upload__preview"
          :class="{ 'is-image': item.isImage }"
        >
          <img
            v-if="item.isImage && item.previewUrl"
            :src="item.previewUrl"
            :alt="item.name"
          />
          <Icon v-else :icon="fileIcon(item)" :width="22" :height="22" />
        </div>

        <div class="chunk-upload__item-main">
          <div class="chunk-upload__item-topline">
            <span class="chunk-upload__file-name" :title="item.name">
              {{ item.name }}
            </span>
            <span class="chunk-upload__file-size">
              {{ formatSize(item.size) }}
            </span>
          </div>

          <div class="chunk-upload__item-meta">
            <span class="chunk-upload__status" :class="`is-${item.status}`">
              <i v-if="isWorking(item)" class="chunk-upload__status-dot"></i>
              {{ statusText(item) }}
            </span>
            <span v-if="item.method" class="chunk-upload__method">
              {{ item.method }}
            </span>
            <span
              v-if="item.totalChunks > 1 && item.status !== 'success'"
              class="chunk-upload__chunks"
            >
              {{ item.uploadedChunks || 0 }}/{{ item.totalChunks }} 分片
            </span>
          </div>

          <div v-if="showProgress(item)" class="chunk-upload__progress-row">
            <div class="chunk-upload__progress-track">
              <span
                class="chunk-upload__progress-bar"
                :class="{ 'is-success': item.status === 'success' }"
                :style="{ width: `${item.percent}%` }"
              ></span>
            </div>
            <span class="chunk-upload__percent">
              {{ Math.round(item.percent) }}%
            </span>
          </div>

          <p
            v-if="item.error"
            class="chunk-upload__item-error"
            :title="item.error"
          >
            {{ item.error }}
          </p>
        </div>

        <div class="chunk-upload__actions">
          <button
            v-if="item.isImage && item.previewUrl"
            type="button"
            class="chunk-upload__action"
            title="预览图片"
            @click.stop="previewItem(item)"
          >
            <Icon icon="lucide:eye" :width="16" :height="16" />
          </button>
          <button
            v-if="isWorking(item)"
            type="button"
            class="chunk-upload__action"
            :title="item.status === 'paused' ? '继续上传' : '暂停上传'"
            @click.stop="togglePause(item)"
          >
            <Icon
              :icon="item.status === 'paused' ? 'lucide:play' : 'lucide:pause'"
              :width="16"
              :height="16"
            />
          </button>
          <button
            v-if="item.status === 'error'"
            type="button"
            class="chunk-upload__action is-primary"
            title="重试上传"
            @click.stop="startUpload(item)"
          >
            <Icon icon="lucide:refresh-cw" :width="16" :height="16" />
          </button>
          <button
            type="button"
            class="chunk-upload__action is-remove"
            title="移除文件"
            @click.stop="removeFile(item)"
          >
            <Icon icon="lucide:x" :width="16" :height="16" />
          </button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="previewVisible"
      title="图片预览"
      width="min(680px, 90vw)"
      append-to-body
    >
      <div class="chunk-upload__image-dialog">
        <img v-if="previewUrl" :src="previewUrl" alt="预览图片" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'

import {
  acceptFile,
  chunkLength,
  createUid,
  fileIcon,
  fileKey,
  formatSize,
  getRemoteName,
  isImageFile,
  isWorking,
  normalizeChunkList,
  publicModel,
  showProgress,
  statusText,
  unwrap
} from './helpers'
import { calculateHash } from './chunk-hash'
import { clearStoredChunks, readStoredChunks, storeChunks } from './chunk-store'
import { acquireSlot, flushSlotWaiters, releaseSlot } from './chunk-slots'
import { callMerge, callUploadChunk, callVerify } from './chunk-api'
import {
  cancelTask,
  createTask,
  deleteTask,
  getTask,
  pauseTask,
  resumeTask,
  waitUntilResumed
} from './chunk-task'

defineOptions({ name: 'ChunkUpload' })

const props = defineProps({
  /** v-model 必须是数组；回显数据也使用这个数组 */
  modelValue: {
    type: Array,
    default: () => []
  },
  /** 默认协议：POST `${action}/verify`、`${action}`、`${action}/merge` */
  action: {
    type: String,
    default: ''
  },
  verifyUrl: {
    type: String,
    default: ''
  },
  chunkUrl: {
    type: String,
    default: ''
  },
  mergeUrl: {
    type: String,
    default: ''
  },
  /** 可注入 verify / uploadChunk / merge，便于接入任意后端或云存储 */
  api: {
    type: Object,
    default: () => ({})
  },
  headers: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: [Object, Function],
    default: () => ({})
  },
  withCredentials: {
    type: Boolean,
    default: false
  },
  /** 单个分片大小，默认 5 MB */
  chunkSize: {
    type: Number,
    default: 5 * 1024 * 1024
  },
  /** 全组件同时进行的分片请求数 */
  concurrency: {
    type: Number,
    default: 3
  },
  /** 计算文件哈希时读取的块大小 */
  hashChunkSize: {
    type: Number,
    default: 2 * 1024 * 1024
  },
  /** 哈希算法：在 Worker 中由 hash-wasm 计算，支持 md5 / sha1 / sha-1 / sha256 / sha-256 */
  hashAlgorithm: {
    type: String,
    default: 'md5',
    validator: (value) =>
      ['md5', 'sha1', 'sha-1', 'sha256', 'sha-256'].includes(value)
  },
  /** 单文件大小上限，单位 MB；0 表示不限制 */
  maxSize: {
    type: Number,
    default: 0
  },
  accept: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: true
  },
  limit: {
    type: Number,
    default: 0
  },
  drag: {
    type: Boolean,
    default: true
  },
  autoUpload: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  /** 上传前可返回 false 取消，也可返回一个替换后的 File */
  beforeUpload: {
    type: Function,
    default: null
  },
  fileField: {
    type: String,
    default: 'file'
  },
  chunkField: {
    type: String,
    default: 'chunk'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'change',
  'before-upload',
  'progress',
  'success',
  'error',
  'remove',
  'preview'
])

// 组件实例内部状态：UI 展示 + 与 props 双向同步
const inputRef = ref()
const fileList = ref([])
const isDragover = ref(false)
const feedback = ref(null)
const previewVisible = ref(false)
const previewUrl = ref('')
// 仅组件实例级别的预览对象 URL 注册表；任务注册表由 chunk-task 模块统一管理
const objectUrls = new Map()

const activeCount = computed(
  () => fileList.value.filter((item) => isWorking(item)).length
)

const typeText = computed(() => {
  if (!props.accept) return '支持所有文件类型'
  return `支持 ${props.accept.replaceAll(',', '、')}`
})

const chunkSizeLabel = computed(() => formatSize(props.chunkSize))

// 透传给 chunk-api 的运行期配置
const apiOptions = computed(() => ({
  action: props.action,
  verifyUrl: props.verifyUrl,
  chunkUrl: props.chunkUrl,
  mergeUrl: props.mergeUrl,
  api: props.api,
  headers: props.headers,
  data: props.data,
  withCredentials: props.withCredentials,
  chunkField: props.chunkField
}))

const findCurrentItem = (uid) => fileList.value.find((item) => item.uid === uid)

const updateItem = (item, patch) => {
  const current = findCurrentItem(item.uid)
  if (!current) return
  Object.assign(current, patch)
  emitModel()
}

const emitModel = () => {
  // 即使外部误传了非数组，组件发出的值始终是数组。
  emit('update:modelValue', fileList.value.map(publicModel))
  emit('change', fileList.value.map(publicModel))
}

const normalizeItem = (value, existing) => {
  const source =
    typeof value === 'string'
      ? { url: value, name: getRemoteName(value) }
      : value instanceof File
        ? { raw: value, name: value.name }
        : value || {}
  const raw = source.raw instanceof File ? source.raw : existing?.raw
  const isRemote = !raw && Boolean(source.url || source.previewUrl)
  const item = {
    ...source,
    uid: source.uid || existing?.uid || createUid(),
    raw,
    name: source.name || raw?.name || '未命名文件',
    size: source.size ?? raw?.size ?? 0,
    type: source.type || raw?.type || '',
    status: source.status || (isRemote ? 'success' : 'ready'),
    percent:
      typeof source.percent === 'number' ? source.percent : isRemote ? 100 : 0,
    isImage: source.isImage ?? isImageFile(raw || source),
    previewUrl: source.previewUrl || source.url || '',
    uploadedChunks: source.uploadedChunks || 0,
    totalChunks: source.totalChunks || 0,
    error: source.error || '',
    method: source.method || (isRemote ? '已回显' : ''),
    fileKey:
      source.fileKey ||
      (raw ? fileKey(raw) : `${source.name || ''}_${source.size || 0}`)
  }
  return item
}

const syncModelValue = (value) => {
  const incoming = Array.isArray(value) ? value : []
  if (
    incoming.length === fileList.value.length &&
    incoming.every((item, index) => item === fileList.value[index])
  ) {
    return
  }
  const oldItems = new Map(fileList.value.map((item) => [item.uid, item]))
  fileList.value = incoming.map((item) =>
    normalizeItem(item, oldItems.get(item?.uid))
  )
}

watch(() => props.modelValue, syncModelValue, { immediate: true })

const setFeedback = (message, type = 'error') => {
  feedback.value = { message, type }
  window.clearTimeout(setFeedback.timer)
  setFeedback.timer = window.setTimeout(() => {
    feedback.value = null
  }, 4200)
}

const openPicker = () => {
  if (!props.disabled) inputRef.value?.click()
}

const handleDragEnter = () => {
  if (!props.disabled && props.drag) isDragover.value = true
}

const handleDragLeave = (event) => {
  if (event.currentTarget === event.target) isDragover.value = false
}

const handleDrop = (event) => {
  isDragover.value = false
  if (!props.disabled && props.drag)
    processFiles(Array.from(event.dataTransfer?.files || []))
}

const handleInputChange = (event) => {
  processFiles(Array.from(event.target.files || []))
  event.target.value = ''
}

const validateFile = (file) => {
  if (!acceptFile(file, props.accept))
    return `「${file.name}」不是允许的文件类型`
  if (props.maxSize > 0 && file.size > props.maxSize * 1024 * 1024) {
    return `「${file.name}」超过 ${props.maxSize} MB 大小限制`
  }
  if (fileList.value.some((item) => item.fileKey === fileKey(file))) {
    return `「${file.name}」已经在列表中`
  }
  return ''
}

const createItem = (file) => {
  const item = normalizeItem(
    {
      uid: createUid(),
      raw: file,
      name: file.name,
      size: file.size,
      type: file.type,
      fileKey: fileKey(file),
      status: 'ready',
      isImage: isImageFile(file)
    },
    null
  )
  if (item.isImage) {
    const url = URL.createObjectURL(file)
    objectUrls.set(item.uid, url)
    item.previewUrl = url
  }
  return item
}

const processFiles = async (files) => {
  if (!files.length || props.disabled) return
  const candidates = props.multiple ? files : files.slice(0, 1)
  const accepted = []

  for (const sourceFile of candidates) {
    if (
      props.limit > 0 &&
      fileList.value.length + accepted.length >= props.limit
    ) {
      setFeedback(`最多只能添加 ${props.limit} 个文件`)
      break
    }
    let file = sourceFile
    const validationMessage = validateFile(file)
    if (validationMessage) {
      setFeedback(validationMessage)
      emit('error', { file, phase: 'validate', message: validationMessage })
      continue
    }
    try {
      emit('before-upload', file)
      if (props.beforeUpload) {
        const result = await props.beforeUpload(file, candidates)
        if (result === false) continue
        if (result instanceof File) file = result
      }
    } catch (error) {
      const message = error?.message || '上传前校验未通过'
      setFeedback(message)
      emit('error', { file, phase: 'before-upload', message, error })
      continue
    }
    const replacedValidation = validateFile(file)
    if (replacedValidation) {
      setFeedback(replacedValidation)
      emit('error', { file, phase: 'validate', message: replacedValidation })
      continue
    }
    accepted.push(file)
  }

  if (!props.multiple && accepted.length) {
    fileList.value.forEach((item) => cancelTask(item))
    fileList.value.forEach(revokePreview)
    fileList.value = []
  }

  const addedItems = accepted.map(createItem)
  fileList.value.push(...addedItems)
  emitModel()
  if (props.autoUpload) {
    await Promise.all(addedItems.map((item) => startUpload(item)))
  }
}

// 聚合「已完成的分片字节数 + 进行中分片的部分字节数」得到整体进度
const updateProgress = (item, task, uploaded) => {
  const uploadedBytes = [...uploaded].reduce(
    (sum, index) => sum + chunkLength(item.raw, index, props.chunkSize),
    0
  )
  const partialBytes = [...task.chunkProgress.entries()].reduce(
    (sum, [index, loaded]) => {
      return uploaded.has(index)
        ? sum
        : sum + Math.min(loaded, chunkLength(item.raw, index, props.chunkSize))
    },
    0
  )
  const percent = item.raw.size
    ? ((uploadedBytes + partialBytes) / item.raw.size) * 100
    : 100
  updateItem(item, {
    percent: Math.min(100, percent),
    uploadedChunks: uploaded.size
  })
  emit('progress', {
    item: publicModel(item),
    percent: item.percent,
    uploadedChunks: uploaded.size
  })
}

const startUpload = async (item) => {
  if (!item?.raw || props.disabled) return
  const existingTask = getTask(item.uid)
  if (existingTask && item.status === 'paused') {
    resumeTask(existingTask)
    updateItem(item, { status: 'uploading', error: '' })
    return
  }
  if (existingTask) return

  const task = createTask(item.uid)

  try {
    updateItem(item, {
      status: 'hashing',
      percent: 0,
      error: '',
      method: '分片上传'
    })
    const fileHash = await calculateHash(
      item.raw,
      task,
      props.hashChunkSize,
      (percent) => {
        updateItem(item, { percent })
        emit('progress', { item: publicModel(item), percent, phase: 'hashing' })
      },
      props.hashAlgorithm
    )
    if (task.cancelled) return
    item.hash = fileHash
    item.totalChunks = Math.max(1, Math.ceil(item.raw.size / props.chunkSize))

    updateItem(item, { status: 'verifying', percent: 0 })
    const verifyResult = unwrap(
      await callVerify(
        {
          file: item.raw,
          item: publicModel(item),
          fileHash,
          totalChunks: item.totalChunks,
          chunkSize: props.chunkSize,
          task
        },
        apiOptions.value
      )
    )
    if (task.cancelled) return

    const directUrl =
      verifyResult.url || verifyResult.fileUrl || verifyResult.downloadUrl
    if (
      verifyResult.exists ||
      verifyResult.uploaded === true ||
      verifyResult.fastUpload
    ) {
      clearStoredChunks(fileHash, props.chunkSize)
      updateItem(item, {
        status: 'success',
        percent: 100,
        uploadedChunks: item.totalChunks,
        url: directUrl || item.url || '',
        previewUrl: directUrl || item.previewUrl,
        method: '秒传成功',
        response: verifyResult
      })
      emit('success', {
        item: publicModel(item),
        response: verifyResult,
        method: 'fast'
      })
      return
    }

    item.uploadId =
      verifyResult.uploadId || verifyResult.taskId || item.uploadId
    const uploaded = new Set([
      ...readStoredChunks(fileHash, props.chunkSize),
      ...normalizeChunkList(
        verifyResult.uploadedChunks ?? verifyResult.chunks,
        item.totalChunks
      )
    ])
    item.uploadedChunks = uploaded.size
    updateProgress(item, task, uploaded)
    await waitUntilResumed(task)

    const pending = Array.from(
      { length: item.totalChunks },
      (_, index) => index
    ).filter((index) => !uploaded.has(index))
    let cursor = 0
    const worker = async () => {
      while (cursor < pending.length && !task.cancelled && !task.failed) {
        await waitUntilResumed(task)
        if (task.cancelled || task.failed) return
        const index = pending[cursor++]
        const acquired = await acquireSlot(task, props.concurrency)
        if (!acquired) return
        try {
          const start = index * props.chunkSize
          const chunk = item.raw.slice(start, start + props.chunkSize)
          task.chunkProgress.set(index, 0)
          await callUploadChunk(
            {
              file: item.raw,
              item: publicModel(item),
              chunk,
              index,
              totalChunks: item.totalChunks,
              chunkSize: props.chunkSize,
              fileHash,
              uploadId: item.uploadId,
              task,
              onProgress: (loaded, total) => {
                task.chunkProgress.set(index, total ? loaded : chunk.size)
                updateProgress(item, task, uploaded)
              }
            },
            apiOptions.value
          )
          uploaded.add(index)
          task.chunkProgress.delete(index)
          storeChunks(fileHash, props.chunkSize, uploaded)
          updateProgress(item, task, uploaded)
        } finally {
          releaseSlot(props.concurrency)
        }
      }
    }

    updateItem(item, { status: 'uploading' })
    await Promise.all(
      Array.from(
        {
          length: Math.min(Math.max(1, props.concurrency), pending.length || 1)
        },
        worker
      )
    )
    if (task.cancelled) return
    if (task.paused) return
    if (uploaded.size !== item.totalChunks) throw new Error('分片上传未完成')

    updateItem(item, {
      status: 'merging',
      percent: 99,
      uploadedChunks: item.totalChunks
    })
    const mergeResult = unwrap(
      await callMerge(
        {
          file: item.raw,
          item: publicModel(item),
          fileHash,
          uploadId: item.uploadId,
          totalChunks: item.totalChunks,
          chunkSize: props.chunkSize,
          task
        },
        apiOptions.value
      )
    )
    if (task.cancelled) return
    const url =
      mergeResult.url ||
      mergeResult.fileUrl ||
      mergeResult.downloadUrl ||
      item.url ||
      ''
    clearStoredChunks(fileHash, props.chunkSize)
    updateItem(item, {
      status: 'success',
      percent: 100,
      uploadedChunks: item.totalChunks,
      url,
      previewUrl: item.isImage && url ? url : item.previewUrl,
      response: mergeResult
    })
    emit('success', {
      item: publicModel(item),
      response: mergeResult,
      method: 'chunk'
    })
  } catch (error) {
    if (task.cancelled) return
    task.failed = true
    task.activeXhrs.forEach((xhr) => xhr.abort())
    const message = error?.message || '上传失败，请重试'
    updateItem(item, { status: 'error', error: message })
    emit('error', { item: publicModel(item), error, phase: 'upload', message })
  } finally {
    // 始终清理任务注册表：成功 / 失败 / 取消 / 暂停都会让出槽位；
    // 用户点击「继续上传」或「重试」时，startUpload 会基于 paused/error 状态判断是否新建任务。
    deleteTask(item.uid)
  }
}

const togglePause = (item) => {
  const task = getTask(item.uid)
  if (!task) return startUpload(item)
  if (task.paused) {
    resumeTask(task)
    updateItem(item, { status: 'uploading' })
  } else {
    pauseTask(task)
    updateItem(item, { status: 'paused' })
  }
}

const revokePreview = (item) => {
  const url = objectUrls.get(item.uid)
  if (url) {
    URL.revokeObjectURL(url)
    objectUrls.delete(item.uid)
  }
}

const removeFile = (item) => {
  cancelTask(item)
  revokePreview(item)
  fileList.value = fileList.value.filter((current) => current.uid !== item.uid)
  emitModel()
  emit('remove', publicModel(item))
}

const previewItem = (item) => {
  if (!item.previewUrl) return
  previewUrl.value = item.previewUrl
  previewVisible.value = true
  emit('preview', publicModel(item))
}

onBeforeUnmount(() => {
  fileList.value.forEach((item) => {
    cancelTask(item)
    revokePreview(item)
  })
  flushSlotWaiters()
})
</script>

<style lang="scss" scoped>
.chunk-upload {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  color: var(--color-text-primary);
}

.chunk-upload__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  opacity: 0;
}

.chunk-upload__dropzone {
  display: flex;
  align-items: center;
  min-height: 116px;
  padding: 20px 24px;
  cursor: pointer;
  background: var(--color-bg-card, #fff);
  border: 1px dashed var(--color-border, #dbe3ef);
  border-radius: 14px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &:focus-visible,
  &.is-dragover {
    background: var(--color-bg-hover, #f8fbff);
    border-color: var(--color-primary, #3b82f6);
    outline: none;
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--color-primary, #3b82f6) 12%, transparent);
  }
}

.chunk-upload__drop-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-right: 16px;
  color: var(--color-primary, #3b82f6);
  background: var(--color-primary-soft, #eff6ff);
  border-radius: 15px;
}

.chunk-upload__drop-copy {
  min-width: 0;
}

.chunk-upload__drop-title,
.chunk-upload__hint {
  margin: 0;
}

.chunk-upload__drop-title {
  font-size: 14px;
  font-weight: 600;
}

.chunk-upload__browse {
  padding: 0;
  font: inherit;
  color: var(--color-primary, #3b82f6);
  cursor: pointer;
  background: none;
  border: 0;
}

.chunk-upload__hint {
  margin-top: 7px;
  overflow: hidden;
  font-size: 12px;
  color: var(--color-text-secondary, #64748b);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chunk-upload__feedback {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: -2px 2px 0;
  font-size: 12px;

  &.is-error {
    color: var(--color-danger, #ef4444);
  }

  &.is-success {
    color: var(--color-success, #10b981);
  }
}

.chunk-upload__list {
  overflow: hidden;
  background: var(--color-bg-card, #fff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 14px;
}

.chunk-upload__list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border-light, #f1f5f9);
}

.chunk-upload__active-count {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  font-weight: 400;
  color: var(--color-primary, #3b82f6);
}

.chunk-upload__pulse,
.chunk-upload__status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: currentcolor;
  border-radius: 50%;
}

.chunk-upload__pulse {
  animation: chunk-upload-pulse 1.2s ease-in-out infinite;
}

.chunk-upload__item {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 76px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light, #f1f5f9);

  &:last-child {
    border-bottom: 0;
  }
}

.chunk-upload__preview {
  display: grid;
  flex: none;
  place-items: center;
  width: 42px;
  height: 42px;
  overflow: hidden;
  color: var(--color-primary, #3b82f6);
  background: var(--color-primary-soft, #eff6ff);
  border-radius: 10px;

  &.is-image {
    background: #f1f5f9;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.chunk-upload__item-main {
  flex: 1;
  min-width: 0;
}

.chunk-upload__item-topline,
.chunk-upload__item-meta,
.chunk-upload__progress-row {
  display: flex;
  align-items: center;
}

.chunk-upload__item-topline {
  gap: 8px;
}

.chunk-upload__file-name {
  max-width: min(52vw, 580px);
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chunk-upload__file-size,
.chunk-upload__chunks {
  flex: none;
  font-size: 11px;
  color: var(--color-text-muted, #94a3b8);
}

.chunk-upload__item-meta {
  gap: 8px;
  margin-top: 5px;
  font-size: 11px;
}

.chunk-upload__status {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  color: var(--color-text-secondary, #64748b);

  &.is-success {
    color: var(--color-success, #10b981);
  }

  &.is-error {
    color: var(--color-danger, #ef4444);
  }

  &.is-paused {
    color: var(--color-warning, #d97706);
  }
}

.chunk-upload__method {
  padding: 2px 6px;
  color: var(--color-primary, #3b82f6);
  background: var(--color-primary-soft, #eff6ff);
  border-radius: 4px;
}

.chunk-upload__progress-row {
  gap: 10px;
  margin-top: 8px;
}

.chunk-upload__progress-track {
  flex: 1;
  height: 5px;
  overflow: hidden;
  background: var(--color-border-light, #f1f5f9);
  border-radius: 999px;
}

.chunk-upload__progress-bar {
  display: block;
  height: 100%;
  background: var(--color-primary, #3b82f6);
  border-radius: inherit;
  transition: width 0.2s ease;

  &.is-success {
    background: var(--color-success, #10b981);
  }
}

.chunk-upload__percent {
  width: 34px;
  font-size: 11px;
  color: var(--color-text-secondary, #64748b);
  text-align: right;
}

.chunk-upload__item-error {
  margin: 5px 0 0;
  overflow: hidden;
  font-size: 11px;
  color: var(--color-danger, #ef4444);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chunk-upload__actions {
  display: flex;
  flex: none;
  gap: 2px;
  align-items: center;
}

.chunk-upload__action {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--color-text-secondary, #64748b);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;

  &:hover {
    color: var(--color-text-primary, #0f172a);
    background: var(--color-bg-hover, #f1f5f9);
  }

  &.is-primary {
    color: var(--color-primary, #3b82f6);
  }

  &.is-remove:hover {
    color: var(--color-danger, #ef4444);
    background: #fef2f2;
  }
}

.chunk-upload__image-dialog {
  display: grid;
  place-items: center;
  min-height: 220px;
  background: #0f172a;
  border-radius: 8px;

  img {
    display: block;
    max-width: 100%;
    max-height: 65vh;
    object-fit: contain;
  }
}

.chunk-upload.is-disabled {
  .chunk-upload__dropzone {
    cursor: not-allowed;
    opacity: 0.58;
  }
}

@keyframes chunk-upload-pulse {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 1;
  }
}

@media (width <= 640px) {
  .chunk-upload__dropzone {
    align-items: flex-start;
    padding: 16px;
  }

  .chunk-upload__drop-icon {
    width: 42px;
    height: 42px;
    margin-right: 12px;
  }

  .chunk-upload__item {
    align-items: flex-start;
    padding: 12px;
  }

  .chunk-upload__actions {
    flex-wrap: wrap;
    max-width: 62px;
  }

  .chunk-upload__file-size {
    display: none;
  }
}
</style>
