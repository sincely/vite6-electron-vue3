<!-- WangEditor 富文本编辑器 插件地址：https://www.wangeditor.com/ -->
<template>
  <div class="editor-wrapper">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :mode="mode"
      :defaultConfig="toolbarConfig"
    />
    <Editor
      v-model="modelValue"
      :style="{ height: height, overflowY: 'hidden' }"
      :mode="mode"
      :defaultConfig="editorConfig"
      @onCreated="onCreateEditor"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'WangEditor' })

/**
 * 富文本编辑器
 * @property {string} modelValue 编辑器内容 HTML（v-model）
 * @property {string} height 编辑器高度
 * @property {Array} toolbarKeys 自定义工具栏配置（完全自定义）
 * @property {object} insertKeys 插入新工具到指定位置 { index, keys }
 * @property {Array} excludeKeys 排除的工具栏项
 * @property {string} mode 编辑器模式 default | simple
 * @property {string} placeholder 占位符文本
 * @property {object} uploadConfig 图片上传配置 { maxFileSize, maxNumberOfFiles }
 */
const props = defineProps({
  height: { type: String, default: '500px' },
  toolbarKeys: { type: Array, default: null },
  insertKeys: { type: Object, default: null },
  excludeKeys: { type: Array, default: () => ['fontFamily'] },
  mode: { type: String, default: 'default' },
  placeholder: { type: String, default: '请输入内容...' },
  uploadConfig: { type: Object, default: () => ({}) }
})

const modelValue = defineModel({ type: String, required: true })

// 编辑器实例（shallowRef 避免深度响应代理编辑器对象）
const editorRef = shallowRef()

// 默认上传配置
const DEFAULT_UPLOAD_CONFIG = {
  maxFileSize: 3 * 1024 * 1024, // 3MB
  maxNumberOfFiles: 10,
  fieldName: 'file',
  allowedFileTypes: ['image/*']
}

const mergedUploadConfig = computed(() => ({
  ...DEFAULT_UPLOAD_CONFIG,
  ...props.uploadConfig
}))

// 工具栏配置
const toolbarConfig = computed(() => {
  const config = {}

  // 完全自定义工具栏
  if (props.toolbarKeys && props.toolbarKeys.length > 0) {
    config.toolbarKeys = props.toolbarKeys
  }

  // 插入新工具
  if (props.insertKeys) {
    config.insertKeys = props.insertKeys
  }

  // 排除工具
  if (props.excludeKeys && props.excludeKeys.length > 0) {
    config.excludeKeys = props.excludeKeys
  }

  return config
})

// 文件转 base64（桌面端无图片服务器，本地转码后内嵌）
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

// 编辑器配置
const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      fieldName: mergedUploadConfig.value.fieldName,
      maxFileSize: mergedUploadConfig.value.maxFileSize,
      maxNumberOfFiles: mergedUploadConfig.value.maxNumberOfFiles,
      allowedFileTypes: mergedUploadConfig.value.allowedFileTypes,
      // 自定义上传：图片转 base64 内嵌，离线可用
      async customUpload(file, insertFn) {
        try {
          const url = await fileToBase64(file)
          insertFn(url, file.name, url)
          ElMessage.success('图片上传成功')
        } catch (error) {
          console.error('图片上传失败:', error)
          ElMessage.error('图片上传失败')
        }
      }
    }
  }
}

// 编辑器创建回调
const onCreateEditor = (editor) => {
  editorRef.value = editor
}

// 暴露编辑器实例和方法
defineExpose({
  getEditor: () => editorRef.value,
  setHtml: (html) => editorRef.value?.setHtml(html),
  getHtml: () => editorRef.value?.getHtml(),
  clear: () => editorRef.value?.clear(),
  focus: () => editorRef.value?.focus()
})

onBeforeUnmount(() => {
  editorRef.value?.destroy()
})
</script>

<style lang="scss">
@use './style';
</style>
