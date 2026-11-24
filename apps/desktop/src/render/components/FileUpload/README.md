# FileUpload

通用文件上传组件，基于 Element Plus `ElUpload` 封装。

## 基础用法

```vue
<script setup>
import { ref } from 'vue'

const files = ref([])

const beforeUpload = async (file) => {
  // 返回 false 可以阻止上传；支持 Promise
  return file.size < 5 * 1024 * 1024
}
</script>

<template>
  <FileUpload
    v-model="files"
    action="/api/upload"
    :multiple="true"
    :limit="5"
    :file-types="['jpg', 'png', 'pdf']"
    :max-size="5 * 1024 * 1024"
    :before-upload="beforeUpload"
    tip="支持 JPG、PNG、PDF，单个文件不超过 5 MB"
  />
</template>
```

## 配置与回显

`modelValue` 始终以数组形式回传。单文件上传也使用数组，便于表单字段保持一致。

```js
const files = ref([
  { name: '历史图片.png', url: 'https://example.com/a.png', status: 'success' },
  'https://example.com/b.pdf'
])
```

字符串 URL 和 Element Plus 的 `UploadFile` / `UploadUserFile` 对象都可以作为回显数据。上传接口返回地址时，组件会从 `url`、`path`、`data.url`、`data.path` 等常见字段中提取地址，也可以通过 `response-url-key="data.fileUrl"` 指定字段路径。

组件支持的常用 props：

| 属性 | 说明 |
| --- | --- |
| `action` | 上传地址；也可以用 `http-request` 接入自定义上传逻辑 |
| `multiple` / `limit` | 单文件或多文件，以及数量限制 |
| `accept` / `file-types` | 原生选择器和组件校验的文件类型限制，支持扩展名、MIME、`image/*` |
| `max-size` | 单文件大小上限，单位为字节 |
| `drag` | 开启拖拽上传 |
| `before-upload` | 上传前同步或异步逻辑，返回 `false` 阻止上传 |
| `upload-config` | 透传其他 `ElUpload` 配置；同名直接 props 优先 |
| `show-preview` | 是否开启图片预览，默认开启 |

组件还暴露了 `submit()`、`abort(file)`、`clearFiles()`、`getFileList()` 和 `getUploadRef()` 方法。
