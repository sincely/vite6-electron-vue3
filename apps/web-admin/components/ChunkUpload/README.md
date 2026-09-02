# ChunkUpload

通用 Vue 3 大文件上传组件，支持拖拽、单/多文件、类型与大小校验、图片预览、上传前钩子、进度展示、MD5 秒传、分片上传、断点续传、暂停/恢复和并发控制。

## 基本用法

```vue
<ChunkUpload
  v-model="files"
  action="/api/upload"
  accept=".zip,.pdf,image/*"
  :multiple="true"
  :chunk-size="5 * 1024 * 1024"
  :concurrency="3"
  :before-upload="beforeUpload"
/>
```

`v-model` 始终按数组处理。回显时可以传入：

```js
const files = ref([
  {
    uid: 'remote-1',
    name: '产品手册.pdf',
    size: 1024 * 1024,
    status: 'success',
    url: 'https://cdn.example.com/manual.pdf'
  }
])
```

## 自定义 API

不想使用默认 HTTP 协议时，可传入 `api`：

```js
const api = {
  verify: async ({ fileHash, file, totalChunks, chunkSize }) => ({
    exists: false,
    uploadId: 'server-task-id',
    uploadedChunks: []
  }),
  uploadChunk: async ({ chunk, index, onProgress }) => {
    // 将 chunk 上传到对象存储，并按需调用 onProgress(loaded, total)
    onProgress(chunk.size, chunk.size)
    return { ok: true, index }
  },
  merge: async ({ uploadId, fileHash }) => ({
    url: `/files/${fileHash}`
  })
}
```

默认 HTTP 协议为：

- `POST ${action}/verify`：接收 `fileHash`、`fileName`、`fileSize`、`totalChunks`、`chunkSize`，返回 `exists`、`url`、`uploadId`、`uploadedChunks`。
- `POST ${action}`：以 `multipart/form-data` 接收 `chunk`、`chunkIndex`、`totalChunks`、`fileHash`、`uploadId` 等字段。
- `POST ${action}/merge`：接收 `uploadId`、`fileHash`、`fileName`、`totalChunks`、`chunkSize`，返回文件 `url`。

服务端应以 `fileHash` 做幂等校验，并以 `uploadedChunks` 返回已落盘分片；前端 localStorage 记录只用于浏览器重启后的辅助恢复，最终状态应以服务端为准。
