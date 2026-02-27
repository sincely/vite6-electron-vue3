import fs from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import createVitePlugins from './build/plugins'
import { proxyServer } from './build/config/proxy'
import electron from 'vite-plugin-electron/simple'
import pkg from './package.json'
export default defineConfig(({ mode, command }) => {
  fs.rmSync('dist-electron', { recursive: true, force: true })
  const viteEnv = loadEnv(mode, process.cwd())
  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  return defineConfig({
    base: viteEnv.VITE_BASE_URL,
    server: {
      // https: false, // 是否开启https
      // strictPort: false, // 设为false时，若端口已被占用则会尝试下一个可用端口,而不是直接退出
      open: true, // 在服务器启动时自动在浏览器中打开应用程序
      port: 3200, // 指定服务器端口
      proxy: proxyServer // 设置代理
    },
    build: {
      // 传递给Terser的更多 minify 选项。
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境时移除console
          drop_debugger: true // 生产环境时移除debugger
        }
      },
      modulePreload: true, // 是否动态引入polyfill，需要引入兼容性相关的文件
      emptyOutDir: true, // 默认true默认情况下，若outDir在root目录下，则Vite会在构建时清空该目录。
      assetsInlineLimit: 4096, // 小于此阈值的导入或引用资源将内联为base64编码，以避免额外的http请求。设置为0可以完全禁用此项
      outDir: 'dist', // 指定输出路径,默认dist
      reportCompressedSize: true, // 开启计算文件大小，监控打包体积
      sourcemap: false, // 生产环境禁用 source map 以减小体积
      assetsDir: 'assets', // 静态资源的存放目录
      cssCodeSplit: true, // 启用/禁用CSS代码拆分默认true, 用则所有样式保存在一个css里面
      chunkSizeWarningLimit: 1000, // chunk大小警告的限制
      minify: 'terser', // 混淆器terser构建后文件体积更小
      manifest: false, // 当设置为true，构建后将会生成 manifest.json 文件
      commonjsOptions: {}, // @rollup/plugin-commonjs 插件的选项
      // 自定义底层的Rollup 打包配置
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'element-plus-vendor': ['element-plus'],
            'utils-vendor': ['axios', 'dayjs', 'lodash-es']
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]'
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
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', 'vue'] // 默认支持
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
              console.log(/* For `.vscode/.debug.script.mjs` */ '[startup] Electron App')
            } else {
              startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons,
                // we can use `external` to exclude them to ensure they work correctly.
                // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
                // Of course, this is not absolute, just this way is relatively simple. :)
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
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
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
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
    ],
    // 强制预构建插件包
    optimizeDeps: {
      force: false, // 是否强制依赖预构建
      entries: [], // 检测需要预构建的依赖项
      include: [], // 默认情况下，不在node_modules中的，链接的包不会预构建
      exclude: [] // 排除在优化之外
    }
  })
})
