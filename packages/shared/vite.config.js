import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'notification.js'),
        notification: resolve(__dirname, 'notification.js')
      },
      name: 'LightningShared',
      fileName: (format, entryName) =>
        entryName === 'index' ? `index.${format === 'es' ? 'mjs' : 'js'}` : `${entryName}.${format === 'es' ? 'mjs' : 'js'}`,
      formats: ['es', 'cjs']
    }
  }
})