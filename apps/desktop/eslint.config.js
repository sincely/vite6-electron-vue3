import eslintConfig from '@lightning/eslint-config'
import autoImport from './.eslintrc-auto-import.json' with { type: 'json' }

// files 同时声明「包内相对路径」和「**/ 前缀」两种写法：
// 前者供 apps/desktop 目录内执行 eslint 时匹配；后者供仓库根目录复用本配置时匹配
// —— ESLint flat config 的 files 按执行目录解析，不会像 eslintrc 那样按目录下钻。

// 主进程构建期常量：由 vite.config.js 中 electron main 的 define 在打包时做文本替换，
// 源码里没有对应声明，需要显式告知 ESLint（仅在 src/main 下使用）。
const buildTimeConstants = ['__COMMIT_HASH__', '__BUILD_DATE__']

// Element Plus 的命令式 API 由 unplugin-auto-import 的 ElementPlusResolver 在首次出现时
// 按需注入（带 sass 主题样式），不会写进 .eslintrc-auto-import.json —— 该文件只覆盖
// vue / vue-router / pinia / @vueuse/core 预设。新增命令式 API 时同步补充这里。
const elementPlusApis = ['ElLoading', 'ElMessage', 'ElMessageBox', 'ElNotification']

// 这些标识符只被调用/读取，永不被赋值
const toReadonlyGlobals = (names) => Object.fromEntries(names.map((name) => [name, 'readonly']))

const mainFiles = ['src/main/**/*.{js,mjs}', '**/src/main/**/*.{js,mjs}']
const renderFiles = ['src/render/**/*.{js,vue}', '**/src/render/**/*.{js,vue}']

export default [
  ...eslintConfig,
  {
    files: mainFiles,
    languageOptions: {
      globals: toReadonlyGlobals(buildTimeConstants)
    }
  },
  {
    files: renderFiles,
    languageOptions: {
      globals: {
        ...autoImport.globals,
        ...toReadonlyGlobals(elementPlusApis)
      }
    }
  }
]
