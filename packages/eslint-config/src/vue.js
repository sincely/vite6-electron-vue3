import pluginVue from 'eslint-plugin-vue'

const vueFiles = ['**/*.vue']

/** Vue 3 flat config。浏览器全局变量和 Vue 规则只作用在 .vue 文件上。 */
export default [
  ...pluginVue.configs['flat/recommended'].map((config) => (config.files ? config : { ...config, files: vueFiles })),
  {
    files: vueFiles,
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/one-component-per-file': 'off'
    }
  }
]
