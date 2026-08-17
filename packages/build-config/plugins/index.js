import vue from '@vitejs/plugin-vue'
import unplugin from './unplugin.js'
import svgIcon from './svgIcon.js'

/**
 * 聚合 Vite 插件(vue + auto-import + svg)
 * @param {Object} [options]
 * @param {string[]} [options.iconDirs] - SVG 图标目录
 * @param {string} [options.componentsDir] - 自动扫描的组件目录
 */
export default function createVitePlugins(options = {}) {
  return [
    vue(),
    ...unplugin({ componentsDir: options.componentsDir }),
    ...svgIcon({ iconDirs: options.iconDirs })
  ]
}