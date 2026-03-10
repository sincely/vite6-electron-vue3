import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import createVitePlugins from './build/plugins'
import { proxyServer } from './build/config/proxy'
import electron from 'vite-plugin-electron/simple'
import pkg from './package.json'
export default defineConfig(({ mode, command }) => {
  const viteEnv = loadEnv(mode, process.cwd())
  console.log('viteEnv:', viteEnv)
  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe
  return defineConfig({
    base: viteEnv.VITE_BASE_URL,
    server: {
      port: 3200, // 指定服务器端口
      proxy: viteEnv.VITE_USE_PROXY === 'true' ? proxyServer : undefined
    },
    build: {
      // 传递给Terser的更多 minify 选项。
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 3 // 多次压缩，体积更小
        }
      },
      reportCompressedSize: false, // 关闭压缩计算，加快构建速度
      sourcemap,
      chunkSizeWarningLimit: 4000,
      minify: 'terser',
      cssCodeSplit: true, // 启用 CSS 代码分割
      assetsInlineLimit: 4096, // 小于 4kb 的资源内联为 base64
      rollupOptions: {
        treeshake: {
          moduleSideEffects: false, // 假设模块无副作用，激进 tree-shaking
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false
        },
        output: {
          manualChunks(id) {
            // Vue 核心
            if (
              id.includes('node_modules/vue/') ||
              id.includes('node_modules/@vue/') ||
              id.includes('node_modules/vue-router/') ||
              id.includes('node_modules/pinia/')
            ) {
              return 'vue-vendor'
            }
            // Element Plus 组件（按需拆分减小首屏）
            if (id.includes('node_modules/element-plus/')) {
              return 'element-plus'
            }
            // Element Plus 图标
            if (id.includes('node_modules/@element-plus/icons-vue/')) {
              return 'element-icons'
            }
            // 工具库
            if (
              id.includes('node_modules/axios/') ||
              id.includes('node_modules/dayjs/') ||
              id.includes('node_modules/lodash-es/')
            ) {
              return 'utils-vendor'
            }
            // gsap 动画单独分包
            if (id.includes('node_modules/gsap/')) {
              return 'gsap'
            }
            // nprogress
            if (id.includes('node_modules/nprogress/')) {
              return 'nprogress'
            }
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          compact: true // 压缩生成代码的空白字符
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@/styles': resolve(__dirname, 'src/styles'),
        '@/router': resolve(__dirname, 'src/router'),
        '@/views': resolve(__dirname, 'src/views'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/assets': resolve(__dirname, 'src/assets'),
        '@/icons': resolve(__dirname, 'src/icons')
      },
      // 导入时想要省略的扩展名列表
      // 不建议使用.vue 影响IDE和类型支持
      // 在Vite中,不建议(实测还是可以配置的)忽略自定义扩展名，因为会影响IDE和类型支持。因此需要完整书写
      extensions: ['.mjs', '.js', '.json', 'vue'] // 默认支持
    },
    css: {
      preprocessorOptions: {
        // 指定传递给css预处理器的选项
        // sass variable and mixin
        scss: {
          api: 'modern-compiler',
          additionalData: `
            @use "@/styles/variables.scss" as *; @use "@/styles/mixin.scss" as *;
          `
        }
      }
    },
    plugins: [
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: 'electron/main/index.js',
          onstart({ startup }) {
            if (process.env.VSCODE_DEBUG) {
              console.log('[startup] Electron App')
            } else {
              startup()
            }
          },
          vite: {
            define: {
              // 将 .env 文件中的 VITE_* 变量注入主进程（Node.js 不读取 VITE_ 前缀变量）
              'process.env.VITE_UPDATE_URL': JSON.stringify(
                viteEnv.VITE_UPDATE_URL
              )
            },
            build: {
              sourcemap,
              minify: isBuild ? 'terser' : false,
              terserOptions: isBuild
                ? {
                    compress: {
                      drop_console: true,
                      drop_debugger: true,
                      passes: 2
                    },
                    mangle: true,
                    format: { comments: false }
                  }
                : undefined,
              outDir: 'dist-electron/main',
              rollupOptions: {
                // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons,
                // we can use `external` to exclude them to ensure they work correctly.
                // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
                // Of course, this is not absolute, just this way is relatively simple. :)
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {}
                ),
                treeshake: {
                  moduleSideEffects: 'no-external'
                }
              }
            }
          }
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: 'electron/preload/index.mjs',
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild ? 'terser' : false,
              terserOptions: isBuild
                ? {
                    compress: {
                      drop_console: true,
                      drop_debugger: true,
                      passes: 2
                    },
                    mangle: true,
                    format: { comments: false }
                  }
                : undefined,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {}
                ),
                treeshake: {
                  moduleSideEffects: 'no-external'
                }
              }
            }
          }
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        resolve: {}
      }),
      ...createVitePlugins(viteEnv, command === 'build')
    ]
  })
})
