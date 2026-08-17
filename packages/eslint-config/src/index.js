import js from '@eslint/js'
import configPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'
import { defineFlatConfig } from 'eslint-define-config'

/**
 * Lightning 基础 ESLint flat config
 * 适用于所有 JS 项目。Vue 应用请叠加 ./vue.js。
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
      '.trae/**',
      '.cursor/**',
      '.husky/**',
      '.github/**',
      '.zcode/**',
      '.qoder/**',
      'package-lock.json',
      'stats.html',
      'yarn.lock',
      '*.md',
      '*.woff',
      '*.ttf',
      '*.sh',
      '*.nsh',
      'CHANGELOG.md',
      'README.md'
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
      'import/no-extraneous-dependencies': 0,
      'import/extensions': 0,
      'import/no-unresolved': 0,
      'import/prefer-default-export': 0,
      'no-var': 'error',
      'no-new': 1,
      'no-shadow': 0,
      'no-console': 0,
      'no-underscore-dangle': 0,
      'no-confusing-arrow': 0,
      'no-plusplus': 0,
      'no-param-reassign': 0,
      'no-restricted-syntax': 0,
      'no-use-before-define': 0,
      'no-prototype-builtins': 0,
      'no-unneeded-ternary': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-escape': 0,
      'no-continue': 0,
      'camelcase': 0,
      'class-methods-use-this': 0,
      'new-cap': 0,
      'func-style': 0,
      'max-len': 0,
      'consistent-return': 0,
      'default-case': 2,
      'rest-spread-spacing': 'error',
      'prefer-const': 'error',
      'arrow-spacing': 'error',
      'space-before-function-paren': 0,
      'space-before-blocks': 'error'
    }
  }
])