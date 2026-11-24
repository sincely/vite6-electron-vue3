import js from '@eslint/js'
import globals from 'globals'
import pluginPrettier from 'eslint-plugin-prettier/recommended'
import vueConfig from './vue.js'

const nodeOnlyGlobalsOff = Object.fromEntries(
  Object.keys(globals.node)
    .filter((name) => !Object.hasOwn(globals.browser, name))
    .map((name) => [name, 'off'])
)

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-electron/**',
      '**/release/**',
      '**/public/**',
      '**/artifacts/**',
      '**/src/render/assets/**',
      '**/.turbo/**',
      '**/*.local',
      '**/.vscode/**',
      '**/.trae/**',
      '**/.husky/**',
      '**/.github/**',
      '**/.zcode/**',
      '**/.qoder/**',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/pnpm-lock.yaml',
      '**/stats.html',
      '**/*.md',
      '**/*.woff',
      '**/*.ttf',
      '**/*.sh',
      '**/*.nsh'
    ]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'no-new': 'warn',
      'no-unneeded-ternary': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-computed-key': 'error',
      'default-case': 'error',
      // 正则和对象原型调用在现有代码里是有意写法，不按推荐规则拦截
      'no-useless-escape': 'off',
      'no-prototype-builtins': 'off'
    }
  },
  {
    files: ['src/render/**/*.{js,vue}', '**/src/render/**/*.{js,vue}'],
    languageOptions: {
      globals: {
        ...nodeOnlyGlobalsOff,
        ...globals.browser
      }
    }
  },
  {
    files: ['src/preload/**/*.{js,mjs}', '**/src/preload/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  {
    // 启动画面脚本放在主进程目录，但在预加载脚本里操作 DOM
    files: ['src/main/loading/**/*.{js,mjs}', '**/src/main/loading/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  ...vueConfig,
  pluginPrettier
]
