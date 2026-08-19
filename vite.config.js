import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import { execSync } from 'child_process'
import createVitePlugins from './build/plugins'
import { proxyServer } from './build/config/proxy'
import electron from 'vite-plugin-electron/simple'
import pkg from './package.json'
import fs from 'fs'

// 构建时获取 git 提交哈希和构建日期
const getGitCommitHash = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

const getBuildDate = () => {
  return new Date().toISOString()
}

const __COMMIT_HASH__ = JSON.stringify(getGitCommitHash())
const __BUILD_DATE__ = JSON.stringify(getBuildDate())

export default defineConfig(({ mode, command }) => {
  const viteEnv = loadEnv(mode, process.cwd())
  console.log('viteEnv:', viteEnv)
  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe
  // 不预构建 element-plus/es 整库入口，避免 .vite/deps/element-plus_es.js 过大；
  // 组件按需 import 由 unplugin-vue-components + ElementPlusResolver 自动完成，
  // Vite 自身的 ESM transform 会按需处理子模块。仅组件 CSS 仍预构建，
  // 防止 unplugin 首次 import 新组件时触发"重新优化依赖"导致整页 reload。
  const optimizeDepsElementPlusIncludes = []
  fs.readdirSync('node_modules/element-plus/es/components').forEach(
    (dirname) => {
      if (
        fs.existsSync(
          `node_modules/element-plus/es/components/${dirname}/style/css.mjs`
        )
      ) {
        optimizeDepsElementPlusIncludes.push(
          `element-plus/es/components/${dirname}/style/css`
        )
      }
    }
  )
  return defineConfig({
    base: viteEnv.VITE_BASE_URL,
    server: {
      port: 3200, // 指定服务器端口
      proxy: viteEnv.VITE_USE_PROXY === 'true' ? proxyServer : undefined,
      warmup: {
        clientFiles: [
          './src/render/components/**/*.vue',
          './src/render/views/**/*.vue'
        ]
      }
    },
    build: {
      // 传递给Terser的更多 minify 选项。
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
          passes: 3, // 多次压缩，体积更小
          reduce_funcs: true // 减小函数体积
        },
        mangle: {
          toplevel: true // 混淆顶级变量和函数名
        },
        format: {
          comments: false // 移除所有注释
        }
      },
      reportCompressedSize: false, // 关闭压缩计算，加快构建速度
      sourcemap,
      chunkSizeWarningLimit: 4000,
      minify: 'terser',
      cssCodeSplit: true, // 启用 CSS 代码分割
      assetsInlineLimit: 4096, // 小于 4kb 的资源内联为 base64
      rollupOptions: {
        // 渲染进程是浏览器环境，排除 electron，避免其内部的
        // fs / child_process / path 等 Node 内置模块被打包而产生
        // "externalized for browser compatibility" 警告
        external: ['electron'],
        treeshake: {
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
            // Element Plus 组件不强制合包：
            // 统一打成一个 chunk 会导致登录窗口（入口）静态依赖整个 element-plus，
            // 即使登录页只用到少量组件也要全量加载执行。
            // 移除后由 Rollup 自动拆分，登录链路只加载实际引用的组件。
            // Element Plus 图标
            if (id.includes('node_modules/@element-plus/icons-vue/')) {
              return 'element-icons'
            }
            // ECharts 图表库
            if (id.includes('node_modules/echarts/')) {
              return 'echarts'
            }
            // 工具库
            if (
              id.includes('node_modules/axios/') ||
              id.includes('node_modules/dayjs/') ||
              id.includes('node_modules/lodash-es/')
            ) {
              return 'utils-vendor'
            }
            // qrcode
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
          compact: true // 压缩生成代码的空白字符
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src/render'),
        '@shared': resolve(__dirname, './src/shared'),
        '@/styles': resolve(__dirname, 'src/render/styles'),
        '@/router': resolve(__dirname, 'src/render/router'),
        '@/views': resolve(__dirname, 'src/render/views'),
        '@/components': resolve(__dirname, 'src/render/components'),
        '@/utils': resolve(__dirname, 'src/render/utils'),
        '@/assets': resolve(__dirname, 'src/render/assets'),
        '@/icons': resolve(__dirname, 'src/render/icons')
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
            @use "@/styles/variables.scss" as *;
            @use "@/styles/mixin.scss" as *;
            @use "@/styles/element/index.scss" as *;
          `
        }
      }
    },
    plugins: [
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: 'src/main/index.js',
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
              ),
              'process.env.VITE_API_BASE_URL': JSON.stringify(
                viteEnv.VITE_API_BASE_URL
              ),
              'process.env.VITE_SERVER_URL': JSON.stringify(
                viteEnv.VITE_SERVER_URL
              ),
              'process.env.VITE_USE_MOCK': JSON.stringify(
                viteEnv.VITE_USE_MOCK
              ),
              'process.env.VITE_MOCK_LOGIN': JSON.stringify(
                viteEnv.VITE_MOCK_LOGIN
              ),
              __COMMIT_HASH__,
              __BUILD_DATE__
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
          input: 'src/preload/index.mjs',
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
        renderer: {}
      }),
      ...createVitePlugins()
    ],
    optimizeDeps: {
      include: [
        ...optimizeDepsElementPlusIncludes,
        // ─── 登录窗口首屏关键路径依赖 ───────────────────────────────
        // Vite dev server 冷启动时按 ESM 拓扑 transform 每个依赖项，
        // 把以下首屏必经依赖提前预构建到 .vite/deps/，避免登录窗口首启
        // 触发瀑布流式 transform，造成 ready-to-show 显著延迟
        'vue',
        'vue-router',
        'pinia',
        'pinia-plugin-persistedstate',
        'mitt', // eventBus
        'dayjs', // 时间处理
        // ─── 懒加载路由/组件才会用到的大依赖 ───────────────────────
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/features',
        'echarts/renderers',
        // 锁屏密码 AES 加密仅引入子模块，需预构建避免首次访问触发二次优化
        'crypto-js/aes',
        'crypto-js/enc-utf8',
        'qrcode',
        '@vueuse/core'
      ]
    }
  })
})
