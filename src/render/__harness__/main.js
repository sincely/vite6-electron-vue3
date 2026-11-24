import { createApp, h, ref } from 'vue'
import '@/styles/index.scss'
import '@/plugins/iconify'
import ChunkUpload from '@/components/ChunkUpload/index.vue'

const params = new URLSearchParams(location.hash.slice(1))
const token = ref(params.get('token') || '')
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
const events = []

window.__events = events
window.__files = files
window.__formFiles = formFiles
window.__setToken = (value) => {
  token.value = value
}

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration))
const demoSessions = new Map()
const demoCompleted = new Map()
const demoApi = {
  verify: async ({ fileHash, totalChunks }) => {
    await wait(50)
    if (demoCompleted.has(fileHash)) return { exists: true, url: demoCompleted.get(fileHash) }
    return {
      exists: false,
      uploadId: `demo-${fileHash.slice(0, 10)}`,
      uploadedChunks: [...(demoSessions.get(fileHash) || [])],
      totalChunks
    }
  },
  uploadChunk: async ({ fileHash, index, chunk, onProgress, signal }) => {
    const session = new Set(demoSessions.get(fileHash) || [])
    for (let step = 1; step <= 5; step += 1) {
      signal.throwIfAborted()
      await wait(70)
      onProgress(Math.round((chunk.size * step) / 5), chunk.size)
    }
    session.add(index)
    demoSessions.set(fileHash, [...session])
    return { ok: true, index }
  },
  merge: async ({ fileHash, item }) => {
    await wait(50)
    const url = item.previewUrl || ''
    demoCompleted.set(fileHash, url)
    return { url }
  }
}

const App = {
  setup() {
    const upload = ref()
    window.__upload = upload
    window.__demoApi = demoApi
    return () =>
      h('div', [
        h(ChunkUpload, {
          ref: upload,
          modelValue: files.value,
          'onUpdate:modelValue': (value) => {
            files.value = value
          },
          action: 'http://localhost:5320/api/upload',
          headers: { Authorization: `Bearer ${token.value}` },
          chunkSize: Number(params.get('chunk') || 1024 * 1024),
          concurrency: Number(params.get('conc') || 3),
          fileConcurrency: Number(params.get('fileConc') || 2),
          maxRetry: Number(params.get('retry') || 3),
          hashAlgorithm: params.get('algo') || 'md5',
          retryDelay: 200,
          autoUpload: params.get('auto') !== '0',
          onSuccess: (payload) => events.push(['success', payload.method, payload.item.name, payload.item.url]),
          onError: (payload) => events.push(['error', payload.phase, payload.message]),
          onRemove: (item) => events.push(['remove', item.name, item.status]),
          onProgress: (payload) => {
            if (payload.phase === 'hashing') events.push(['hashing', Math.round(payload.percent)])
          }
        }),
        h('hr'),
        h('div', { id: 'echo' }, [
          h(ChunkUpload, {
            modelValue: formFiles.value,
            'onUpdate:modelValue': (value) => {
              formFiles.value = value
            },
            api: demoApi,
            accept: 'image/*,.pdf,.zip',
            multiple: false,
            limit: 1,
            chunkSize: 262144
          })
        ])
      ])
  }
}

createApp(App).mount('#app')
