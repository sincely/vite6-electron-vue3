<!-- 组件中心 - 通用文件上传 -->
<template>
  <div class="file-upload-page">
    <PageHeader
      title="文件上传"
      subtitle="统一处理类型校验、进度展示、表单回显、拖拽上传与图片预览"
      icon="upload"
    />

    <ElRow :gutter="20">
      <ElCol :xs="24" :lg="12">
        <ElCard class="upload-card">
          <template #header>
            <div class="card-header">
              <span>单文件上传</span>
              <ElTag size="small" type="info">数组 v-model</ElTag>
            </div>
          </template>

          <FileUpload
            v-model="singleFiles"
            :file-types="['jpg', 'jpeg', 'png', 'webp']"
            :max-size="5 * 1024 * 1024"
            :http-request="mockUpload"
            :before-upload="beforeUpload"
            tip="支持 JPG、PNG、WEBP，单个文件不超过 5 MB"
          />
          <div class="value-preview">
            <span class="value-preview__label">当前值</span>
            <code>{{ summarizeFiles(singleFiles) }}</code>
          </div>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :lg="12">
        <ElCard class="upload-card">
          <template #header>
            <div class="card-header">
              <span>多文件拖拽上传</span>
              <ElTag size="small" type="success">支持图片预览</ElTag>
            </div>
          </template>

          <FileUpload
            v-model="multipleFiles"
            multiple
            drag
            :limit="5"
            :file-types="['image/*', 'pdf']"
            :http-request="mockUpload"
            :upload-config="{
              buttonText: '选择文件',
              dragText: '将图片或 PDF 拖到此处，或点击上传'
            }"
            tip="最多上传 5 个图片或 PDF 文件"
          />
          <div class="value-preview">
            <span class="value-preview__label">当前数量</span>
            <code>{{ multipleFiles.length }} 个文件</code>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard class="upload-card echo-card">
      <template #header>
        <div class="card-header">
          <span>表单校验回显</span>
          <ElButton size="small" @click="resetEcho">恢复示例数据</ElButton>
        </div>
      </template>
      <p class="card-description">
        初始值可以直接传入服务端 URL 数组或 UploadFile
        对象数组；单文件模式也始终传数组。
      </p>
      <FileUpload
        v-model="echoFiles"
        multiple
        :limit="3"
        :http-request="mockUpload"
        :file-types="['image/*']"
      />
    </ElCard>
  </div>
</template>

<script setup>
import coverImage from '@/assets/images/cover/img1.webp'

const singleFiles = ref([])
const multipleFiles = ref([])
const echoFiles = ref([])

const resetEcho = () => {
  echoFiles.value = [
    {
      name: '历史封面.webp',
      url: coverImage,
      type: 'image/webp',
      status: 'success'
    }
  ]
}

const beforeUpload = async () => {
  await new Promise((resolve) => setTimeout(resolve, 240))
  return true
}

const mockUpload = ({ file, onProgress, onSuccess }) => {
  let percentage = 0
  const timer = window.setInterval(() => {
    percentage += Math.round(Math.random() * 22) + 8
    if (percentage >= 100) {
      window.clearInterval(timer)
      onProgress({ percent: 100 })
      onSuccess({ url: URL.createObjectURL(file), name: file.name })
      return
    }
    onProgress({ percent: percentage })
  }, 180)

  return {
    abort: () => window.clearInterval(timer)
  }
}

const summarizeFiles = (files) =>
  files.map((file) => file.name || file.url || '未命名文件').join('、') ||
  '暂无文件'

resetEcho()
</script>

<style lang="scss" scoped>
.file-upload-page {
  padding: 20px;
}

.upload-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.value-preview {
  display: flex;
  gap: 10px;
  align-items: baseline;
  padding: 10px 12px;
  margin-top: 18px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}

.value-preview__label {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.value-preview code {
  overflow: hidden;
  font-size: 12px;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-description {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
