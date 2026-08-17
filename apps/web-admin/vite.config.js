import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import svgLoader from 'vite-svg-loader'

export default defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, process.cwd())

  return defineConfig({
    base: viteEnv.VITE_BASE_URL || '/',
    server: {
      port: 3300,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: viteEnv.VITE_MOCK_SERVER_URL || 'http://localhost:5320/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: [
            'console.log',
            'console.info',
            'console.debug',
            'console.warn'
          ],
          passes: 3,
          reduce_funcs: true
        },
        mangle: {
          toplevel: true
        },
        format: {
          comments: false
        }
      },
      reportCompressedSize: false,
      chunkSizeWarningLimit: 4000,
      minify: 'terser',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        external: ['electron'],
        treeshake: {
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false
        },
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/vue/') ||
              id.includes('node_modules/@vue/') ||
              id.includes('node_modules/vue-router/') ||
              id.includes('node_modules/pinia/')
            ) {
              return 'vue-vendor'
            }
            if (id.includes('node_modules/@element-plus/icons-vue/')) {
              return 'element-icons'
            }
            if (id.includes('node_modules/echarts/')) {
              return 'echarts'
            }
            if (
              id.includes('node_modules/axios/') ||
              id.includes('node_modules/dayjs/') ||
              id.includes('node_modules/lodash-es/')
            ) {
              return 'utils-vendor'
            }
            if (id.includes('node_modules/nprogress/')) {
              return 'nprogress'
            }
            if (id.includes('node_modules/qrcode/')) {
              return 'qrcode'
            }
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames(assetInfo) {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|gif|tiff|bmp|ico|webp|svg/i.test(ext)) {
              return `images/[name]-[hash][extname]`
            } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash][extname]`
            } else if (ext === 'css') {
              return `css/[name]-[hash][extname]`
            } else {
              return `assets/[name]-[hash][extname]`
            }
          },
          compact: true
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './'),
        '@/styles': resolve(__dirname, './styles'),
        '@/router': resolve(__dirname, './router'),
        '@/views': resolve(__dirname, './views'),
        '@/components': resolve(__dirname, './components'),
        '@/utils': resolve(__dirname, './utils'),
        '@/assets': resolve(__dirname, './assets'),
        '@/icons': resolve(__dirname, './icons')
      },
      extensions: ['.mjs', '.js', '.json', 'vue']
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `
            @use "@/styles/variables.scss" as *;
            @use "@/styles/mixin.scss" as *;
            @use "@/styles/element/index.scss" as *;
          `
        }
      }
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        include: [/\.[tj]sx?$/, /\.vue$/],
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dts: false,
        vueTemplate: true,
        eslintrc: { enabled: false, dts: false }
      }),
      Components({
        dirs: ['components'],
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        extensions: ['vue'],
        dts: false
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve(__dirname, './icons/svg')],
        symbolId: 'icon-[dir]-[name]',
        inject: 'body-last'
      }),
      svgLoader({ defaultImport: 'url' })
    ]
  })
})
