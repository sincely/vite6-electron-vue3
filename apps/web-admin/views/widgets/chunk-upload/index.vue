<template>
  <div class="chunk-upload-page">
    <PageHeader
      title="大文件上传"
      subtitle="分片、断点、秒传与并发控制一体化组件"
      icon="cloud-upload"
    />

    <div class="chunk-upload-page__grid">
      <ElCard class="chunk-upload-page__card">
        <div class="chunk-upload-page__card-heading">
          <div>
            <h3>多文件上传</h3>
            <p>拖拽或选择文件，演示分片并发上传和图片预览。</p>
          </div>
          <span class="chunk-upload-page__tag">Demo API</span>
        </div>

        <ChunkUpload
          v-model="files"
          :api="demoApi"
          accept="image/*,.pdf,.zip,.mp4"
          :multiple="true"
          :concurrency="3"
          :chunk-size="2 * 1024 * 1024"
          :max-size="100"
          :before-upload="beforeUpload"
          @success="handleSuccess"
          @error="handleError"
        />
      </ElCard>

      <ElCard class="chunk-upload-page__card">
        <div class="chunk-upload-page__card-heading">
          <div>
            <h3>表单回显 / 单文件</h3>
            <p>v-model 始终是数组，远端文件不会被重复上传。</p>
          </div>
          <span class="chunk-upload-page__tag is-green">Echo</span>
        </div>

        <ChunkUpload
          v-model="formFiles"
          :api="demoApi"
          accept="image/*,.pdf"
          :multiple="false"
          :limit="1"
          :chunk-size="2 * 1024 * 1024"
        />

        <div class="chunk-upload-page__model">
          <span>当前 modelValue</span>
          <code>
            {{
              formFiles
                .map((item) => `${item.name} · ${item.status}`)
                .join('、') || '[]'
            }}
          </code>
        </div>
      </ElCard>
    </div>

    <ElCard class="chunk-upload-page__card chunk-upload-page__protocol">
      <div class="chunk-upload-page__card-heading">
        <div>
          <h3>接入配置</h3>
          <p>
            生产环境传入 action 使用默认协议，或通过 api 覆盖 verify /
            uploadChunk / merge。
          </p>
        </div>
      </div>
      <div class="chunk-upload-page__config-list">
        <div class="chunk-upload-page__config-item">
          <Icon icon="lucide:scan-search" :width="18" :height="18" />
          <div>
            <b>文件指纹</b>
            <span>MD5 哈希用于秒传和恢复任务识别</span>
          </div>
        </div>
        <div class="chunk-upload-page__config-item">
          <Icon icon="lucide:layers-3" :width="18" :height="18" />
          <div>
            <b>分片策略</b>
            <span>默认 5 MB / 片，可按接口限制调整</span>
          </div>
        </div>
        <div class="chunk-upload-page__config-item">
          <Icon icon="lucide:repeat-2" :width="18" :height="18" />
          <div>
            <b>断点续传</b>
            <span>服务端分片索引 + localStorage 双重恢复</span>
          </div>
        </div>
        <div class="chunk-upload-page__config-item">
          <Icon icon="lucide:gauge" :width="18" :height="18" />
          <div>
            <b>并发控制</b>
            <span>全组件请求池，默认最多 3 个分片同时上传</span>
          </div>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'WidgetsChunkUpload' })

const files = ref([])
const formFiles = ref([
  {
    uid: 'echo-manual-1',
    name: '产品手册.pdf',
    size: 3.8 * 1024 * 1024,
    type: 'application/pdf',
    status: 'success',
    url: 'https://dummyimage.com/900x520/0f172a/ffffff.png&text=PDF+Preview'
  }
])

const demoSessions = new Map()
const demoCompleted = new Map()

const wait = (duration) =>
  new Promise((resolve) => window.setTimeout(resolve, duration))

const demoApi = {
  verify: async ({ fileHash, totalChunks }) => {
    await wait(220)
    if (demoCompleted.has(fileHash)) {
      return { exists: true, url: demoCompleted.get(fileHash) }
    }
    return {
      exists: false,
      uploadId: `demo-${fileHash.slice(0, 10)}`,
      uploadedChunks: [...(demoSessions.get(fileHash) || [])],
      totalChunks
    }
  },
  uploadChunk: async ({ fileHash, index, chunk, onProgress, task }) => {
    const session = new Set(demoSessions.get(fileHash) || [])
    const steps = 5
    for (let step = 1; step <= steps; step += 1) {
      if (task.cancelled) throw new Error('上传已取消')
      await wait(70)
      onProgress(Math.round((chunk.size * step) / steps), chunk.size)
    }
    session.add(index)
    demoSessions.set(fileHash, [...session])
    return { ok: true, index }
  },
  merge: async ({ fileHash, item }) => {
    await wait(180)
    const url = item.previewUrl || ''
    demoCompleted.set(fileHash, url)
    return { url }
  }
}

const beforeUpload = async (file) => {
  if (/\.exe$/i.test(file.name)) {
    ElMessage.warning('演示页面不允许上传可执行文件')
    return false
  }
  return true
}

const handleSuccess = ({ item, method }) => {
  ElMessage.success(
    `${item.name} ${method === 'fast' ? '秒传成功' : '上传成功'}`
  )
}

const handleError = ({ message, phase }) => {
  if (phase === 'validate' || phase === 'before-upload')
    ElMessage.error(message)
}
</script>

<style lang="scss" scoped>
.chunk-upload-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.chunk-upload-page__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.9fr);
  gap: 16px;
}

.chunk-upload-page__card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.chunk-upload-page__card-heading {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: 15px;
    color: var(--color-text-primary);
  }

  p {
    margin-top: 5px;
    font-size: 12px;
    color: var(--color-text-secondary);
  }
}

.chunk-upload-page__tag {
  flex: none;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border-radius: 5px;

  &.is-green {
    color: var(--color-success);
    background: rgb(16 185 129 / 10%);
  }
}

.chunk-upload-page__model {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px;
  margin-top: 14px;
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-bg-content);
  border-radius: 8px;

  code {
    overflow: hidden;
    color: var(--color-text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.chunk-upload-page__protocol {
  :deep(.el-card__body) {
    padding-bottom: 18px;
  }
}

.chunk-upload-page__config-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.chunk-upload-page__config-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  color: var(--color-primary);
  background: var(--color-bg-content);
  border-radius: 9px;

  div {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  b {
    font-size: 12px;
    color: var(--color-text-primary);
  }

  span {
    font-size: 11px;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
}

@media (width <= 1100px) {
  .chunk-upload-page__grid {
    grid-template-columns: 1fr;
  }

  .chunk-upload-page__config-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 560px) {
  .chunk-upload-page__config-list {
    grid-template-columns: 1fr;
  }
}
</style>
