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
          <button type="button" class="chunk-upload__browse" @click.stop="openPicker">点击选择</button>
        </p>
        <p class="chunk-upload__hint">
          {{ typeText }} · {{ multiple ? '支持多文件' : '单文件上传' }}
          <span v-if="chunkSizeLabel">· 分片 {{ chunkSizeLabel }}</span>
        </p>
      </div>
    </div>

    <p v-if="feedback" class="chunk-upload__feedback" :class="`is-${feedback.type}`">
      <Icon
        :icon="feedback.type === 'error' ? 'lucide:circle-alert' : 'lucide:circle-check'"
        :width="15"
        :height="15"
      />
      {{ feedback.message }}
    </p>

    <div v-if="items.length" class="chunk-upload__list">
      <div class="chunk-upload__list-header">
        <span>文件列表（{{ items.length }}）</span>
        <div class="chunk-upload__bulk">
          <span v-if="stats.working" class="chunk-upload__active-count">
            <i class="chunk-upload__pulse"></i>
            {{ stats.working }} 个任务处理中
          </span>
          <button v-if="stats.ready" type="button" class="chunk-upload__bulk-action" @click="submit">全部开始</button>
          <button v-if="stats.pausable" type="button" class="chunk-upload__bulk-action" @click="pauseAll">
            全部暂停
          </button>
          <button v-if="stats.paused" type="button" class="chunk-upload__bulk-action" @click="resumeAll">
            全部继续
          </button>
          <button v-if="stats.unfinished" type="button" class="chunk-upload__bulk-action is-danger" @click="cancelAll">
            全部取消
          </button>
        </div>
      </div>

      <div v-for="item in items" :key="item.uid" class="chunk-upload__item">
        <div class="chunk-upload__preview" :class="{ 'is-image': item.isImage }">
          <img v-if="item.isImage && item.previewUrl" :src="item.previewUrl" :alt="item.name" />
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
            <span v-if="item.totalChunks > 1 && item.status !== 'success'" class="chunk-upload__chunks">
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
            <span class="chunk-upload__percent">{{ Math.round(item.percent) }}%</span>
          </div>

          <p v-if="item.error" class="chunk-upload__item-error" :title="item.error">
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
            v-if="canPause(item)"
            type="button"
            class="chunk-upload__action"
            title="暂停上传"
            @click.stop="pause(item)"
          >
            <Icon icon="lucide:pause" :width="16" :height="16" />
          </button>
          <button
            v-else-if="item.status === 'ready' || item.status === 'paused'"
            type="button"
            class="chunk-upload__action"
            :title="item.status === 'paused' ? '继续上传' : '开始上传'"
            @click.stop="start(item)"
          >
            <Icon icon="lucide:play" :width="16" :height="16" />
          </button>
          <button
            v-else-if="item.status === 'error'"
            type="button"
            class="chunk-upload__action is-primary"
            title="重试上传"
            @click.stop="start(item)"
          >
            <Icon icon="lucide:refresh-cw" :width="16" :height="16" />
          </button>
          <button
            type="button"
            class="chunk-upload__action is-remove"
            :title="isWorking(item) ? '取消上传' : '移除文件'"
            @click.stop="remove(item)"
          >
            <Icon icon="lucide:x" :width="16" :height="16" />
          </button>
        </div>
      </div>
    </div>

    <el-dialog v-model="previewVisible" title="图片预览" width="min(680px, 90vw)" append-to-body>
      <div class="chunk-upload__image-dialog">
        <img v-if="previewUrl" :src="previewUrl" alt="预览图片" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'

import { canPause, fileIcon, formatSize, isWorking, publicModel, showProgress, statusText } from './helpers'
import { useChunkUpload } from './useChunkUpload'

defineOptions({ name: 'ChunkUpload' })

const props = defineProps({
  /** v-model 必须是数组；回显数据也使用这个数组 */
  modelValue: {
    type: Array,
    default: () => []
  },
  /** 默认协议：POST `${action}/verify`、`${action}/chunk`、`${action}/merge`、`${action}/cancel` */
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
  cancelUrl: {
    type: String,
    default: ''
  },
  /** 可注入 verify / uploadChunk / merge / cancel，便于接入任意后端或云存储 */
  api: {
    type: Object,
    default: () => ({})
  },
  headers: {
    type: Object,
    default: () => ({})
  },
  /** 附加到每个请求的额外参数（对象或返回对象的函数）；分片请求中会拼进 query */
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
  /** 单个文件同时上传的分片数 */
  concurrency: {
    type: Number,
    default: 3
  },
  /** 同时上传的文件数，其余文件排队等待 */
  fileConcurrency: {
    type: Number,
    default: 2
  },
  /** 单个分片失败后的自动重试次数 */
  maxRetry: {
    type: Number,
    default: 3
  },
  /** 分片失败后重试前的等待毫秒数 */
  retryDelay: {
    type: Number,
    default: 1000
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
    validator: (value) => ['md5', 'sha1', 'sha-1', 'sha256', 'sha-256'].includes(value)
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
  /** 选择文件后自动开始；关闭时通过「开始」按钮或 submit() 触发 */
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

// 文件列表、上传队列与全部上传逻辑都在 useChunkUpload 里；这里只负责选择 / 拖拽 / 预览等视图交互
const { items, feedback, stats, addFiles, start, pause, remove, submit, pauseAll, resumeAll, cancelAll } =
  useChunkUpload(props, emit)

const inputRef = ref()
const isDragover = ref(false)
const previewVisible = ref(false)
const previewUrl = ref('')

const typeText = computed(() => {
  if (!props.accept) return '支持所有文件类型'
  return `支持 ${props.accept.replaceAll(',', '、')}`
})

const chunkSizeLabel = computed(() => formatSize(props.chunkSize))

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
  if (!props.disabled && props.drag) addFiles(Array.from(event.dataTransfer?.files || []))
}

const handleInputChange = (event) => {
  addFiles(Array.from(event.target.files || []))
  event.target.value = ''
}

const previewItem = (item) => {
  if (!item.previewUrl) return
  previewUrl.value = item.previewUrl
  previewVisible.value = true
  emit('preview', publicModel(item))
}

// 供宿主在 autoUpload 关闭时手动触发，或统一控制所有任务
defineExpose({ submit, pauseAll, resumeAll, cancelAll })
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
  background: var(--color-bg-card);
  border: 1px dashed var(--color-border);
  border-radius: 14px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &:focus-visible,
  &.is-dragover {
    background: var(--color-bg-hover);
    border-color: var(--color-primary);
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
}

.chunk-upload__drop-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-right: 16px;
  color: var(--color-primary);
  background: var(--color-primary-soft);
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
  color: var(--color-primary);
  cursor: pointer;
  background: none;
  border: 0;
}

.chunk-upload__hint {
  margin-top: 7px;
  overflow: hidden;
  font-size: 12px;
  color: var(--color-text-secondary);
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
    color: var(--color-danger);
  }

  &.is-success {
    color: var(--color-success);
  }
}

.chunk-upload__list {
  overflow: hidden;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 14px;
}

.chunk-upload__list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border-light);
}

.chunk-upload__bulk {
  display: flex;
  gap: 6px;
  align-items: center;
}

.chunk-upload__bulk-action {
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;

  &:hover {
    color: var(--color-primary);
    background: var(--color-bg-hover);
  }

  &.is-danger:hover {
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger) 8%, transparent);
  }
}

.chunk-upload__active-count {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  font-weight: 400;
  color: var(--color-primary);
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
  border-bottom: 1px solid var(--color-border-light);

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
  color: var(--color-primary);
  background: var(--color-primary-soft);
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
  color: var(--color-text-muted);
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
  color: var(--color-text-secondary);

  &.is-success {
    color: var(--color-success);
  }

  &.is-error {
    color: var(--color-danger);
  }

  &.is-paused {
    color: var(--color-warning);
  }
}

.chunk-upload__method {
  padding: 2px 6px;
  color: var(--color-primary);
  background: var(--color-primary-soft);
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
  background: var(--color-border-light);
  border-radius: 999px;
}

.chunk-upload__progress-bar {
  display: block;
  height: 100%;
  background: var(--color-primary);
  border-radius: inherit;
  transition: width 0.2s ease;

  &.is-success {
    background: var(--color-success);
  }
}

.chunk-upload__percent {
  width: 34px;
  font-size: 11px;
  color: var(--color-text-secondary);
  text-align: right;
}

.chunk-upload__item-error {
  margin: 5px 0 0;
  overflow: hidden;
  font-size: 11px;
  color: var(--color-danger);
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
  color: var(--color-text-secondary);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;

  &:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-hover);
  }

  &.is-primary {
    color: var(--color-primary);
  }

  &.is-remove:hover {
    color: var(--color-danger);
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
