// apps/web-admin 专用 ESLint flat config
// 在 @lightning/eslint-config/vue 基础上叠加本 app 特定的 ignore 规则。
import vueConfig from '@lightning/eslint-config/vue'

export default [
  ...vueConfig,
  {
    ignores: [
      'icons/**',
      'plugins/iconify-data*.json',
      'assets/**',
      'dist/**',
      'release/**'
    ]
  }
]
