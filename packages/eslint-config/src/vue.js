import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'
import { defineFlatConfig } from 'eslint-define-config'

/**
 * Lightning Vue 扩展 ESLint flat config
 * 在基础 flat config 基础上叠加 Vue 3 规则。
 */
export default defineFlatConfig([
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'dist-electron/**',
      'release/**',
      'public/**',
      'artifacts/**',
      '*.local',
      '.vscode/**',
      '.idea/**',
      '.husky/**',
      '.github/**',
      '.zcode/**'
    ]
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {}
    },
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      ...configPrettier.rules,
      ...pluginPrettier.configs.recommended.rules,
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unneeded-ternary': 'error',
      'no-duplicate-imports': 'error',
      'default-case': 2,
      'rest-spread-spacing': 'error',
      'arrow-spacing': 'error',
      'space-before-blocks': 'error'
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        extraFileExtensions: ['.vue'],
        sourceType: 'module'
      }
    },
    plugins: {
      vue: pluginVue
    },
    processor: pluginVue.processors['.vue'],
    rules: {
      ...pluginVue.configs.base.rules,
      ...pluginVue.configs['vue3-essential'].rules,
      ...pluginVue.configs['vue3-recommended'].rules,
      'vue/multi-word-component-names': 0,
      'vue/one-component-per-file': 0
    }
  }
])