// apps/desktop 专用 ESLint flat config
// 在 @lightning/eslint-config/vue 基础上叠加本 app 特定的 ignore 规则。
import vueConfig from '@lightning/eslint-config/vue'

export default [
  ...vueConfig,
  {
    ignores: [
      'src/renderer/icons/**',
      'src/renderer/plugins/iconify-data*.json',
      'src/renderer/assets/**',
      'dist/**',
      'dist-electron/**',
      'release/**'
    ]
  }
]
