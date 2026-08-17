import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

/**
 * unplugin 自动导入(components + auto-import)
 * @param {Object} [options]
 * @param {string} [options.componentsDir] - 自动扫描的组件目录,默认 'src/renderer/components'
 * @param {string[]} [options.imports] - 自动导入的 API 列表
 */
export default function createAutoImportPlugins(options = {}) {
  const componentsDir = options.componentsDir || 'src/renderer/components'
  const imports = options.imports || ['vue', 'vue-router', 'pinia', '@vueuse/core']
  return [
    AutoImport({
      imports,
      include: [/\.[tj]sx?$/, /\.vue$/],
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      dts: false,
      vueTemplate: true,
      eslintrc: {
        enabled: false,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
        dts: false
      }
    }),
    Components({
      dirs: [componentsDir],
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      extensions: ['vue'],
      dts: false
    })
  ]
}